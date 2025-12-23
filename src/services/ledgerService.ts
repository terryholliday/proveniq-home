/**
 * LEDGER Integration Service for HOME App
 * 
 * CANONICAL SCHEMA v1.0.0
 * - Uses DOMAIN_NOUN_VERB_PAST event naming
 * - Publishes to /api/v1/events/canonical endpoint
 * - Includes idempotency_key for duplicate prevention
 * - Uses asset_id (PAID) instead of itemId
 */

import { createHash, randomUUID } from 'crypto';

const LEDGER_API_BASE = process.env.NEXT_PUBLIC_LEDGER_API_URL || 'http://localhost:8006';
const SCHEMA_VERSION = '1.0.0';
const PRODUCER = 'home';
const PRODUCER_VERSION = '1.0.0';

// =============================================================================
// TYPES
// =============================================================================

export type CustodyState = 'HOME' | 'IN_TRANSIT' | 'VAULT' | 'RETURNED' | 'SOLD';

export interface LedgerEvent {
  eventId: string;
  itemId: string;
  walletId: string;
  eventType: string;
  payload: Record<string, unknown>;
  payloadHash: string;
  previousHash: string;
  hash: string;
  timestamp: string;
  sequence: number;
}

export interface CustodyRecord {
  itemId: string;
  currentState: CustodyState;
  walletId: string | null;
  lastUpdated: string | null;
  transitionHistory: Array<{
    from: string;
    to: string;
    timestamp: string;
    eventId: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// =============================================================================
// CANONICAL EVENT TYPES (DOMAIN_NOUN_VERB_PAST)
// =============================================================================

export const HOME_EVENT_TYPES = {
  ASSET_REGISTERED: 'HOME_ASSET_REGISTERED',
  ASSET_UPDATED: 'HOME_ASSET_UPDATED',
  PHOTO_ADDED: 'HOME_PHOTO_ADDED',
  DOCUMENT_ATTACHED: 'HOME_DOCUMENT_ATTACHED',
  VALUATION_UPDATED: 'HOME_VALUATION_UPDATED',
  CUSTODY_CHANGED: 'HOME_CUSTODY_CHANGED',
  CLAIM_INITIATED: 'HOME_CLAIM_INITIATED',
} as const;

type HomeEventType = typeof HOME_EVENT_TYPES[keyof typeof HOME_EVENT_TYPES];

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Register a new item in the ledger
 */
export async function registerItem(params: {
  itemId: string;
  walletId: string;
  itemType: string;
  description: string;
  initialValuation?: number;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  return appendEvent({
    itemId: params.itemId,
    walletId: params.walletId,
    eventType: HOME_EVENT_TYPES.ASSET_REGISTERED,
    payload: {
      item_type: params.itemType,
      description: params.description,
      initial_valuation_cents: params.initialValuation,
      registered_at: new Date().toISOString(),
    },
    idempotencyKey: params.idempotencyKey,
  });
}

/**
 * Update item custody state
 */
export async function updateCustodyState(params: {
  itemId: string;
  walletId: string;
  newState: CustodyState;
  reason?: string;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  return appendEvent({
    itemId: params.itemId,
    walletId: params.walletId,
    eventType: HOME_EVENT_TYPES.CUSTODY_CHANGED,
    payload: {
      newState: params.newState,
      reason: params.reason,
      changedAt: new Date().toISOString(),
    },
    custodyState: params.newState,
    idempotencyKey: params.idempotencyKey,
  });
}

/**
 * Record a photo addition
 */
export async function addItemPhoto(params: {
  itemId: string;
  walletId: string;
  photoHash: string;
  photoUrl: string;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  return appendEvent({
    itemId: params.itemId,
    walletId: params.walletId,
    eventType: HOME_EVENT_TYPES.PHOTO_ADDED,
    payload: {
      photoHash: params.photoHash,
      photoUrl: params.photoUrl,
      addedAt: new Date().toISOString(),
    },
    idempotencyKey: params.idempotencyKey,
  });
}

/**
 * Update item valuation
 */
export async function updateValuation(params: {
  itemId: string;
  walletId: string;
  newValuation: number;
  valuationSource: string;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  return appendEvent({
    itemId: params.itemId,
    walletId: params.walletId,
    eventType: HOME_EVENT_TYPES.VALUATION_UPDATED,
    payload: {
      newValuation: params.newValuation,
      valuationSource: params.valuationSource,
      updatedAt: new Date().toISOString(),
    },
    idempotencyKey: params.idempotencyKey,
  });
}

/**
 * Initiate a claim
 */
export async function initiateClaim(params: {
  itemId: string;
  walletId: string;
  claimType: string;
  claimDescription: string;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  return appendEvent({
    itemId: params.itemId,
    walletId: params.walletId,
    eventType: HOME_EVENT_TYPES.CLAIM_INITIATED,
    payload: {
      claimType: params.claimType,
      claimDescription: params.claimDescription,
      initiatedAt: new Date().toISOString(),
    },
    idempotencyKey: params.idempotencyKey,
  });
}

// =============================================================================
// CORE API METHODS (CANONICAL v1.0.0)
// =============================================================================

function hashPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(json).digest('hex');
}

/**
 * Append a canonical event to the ledger
 */
async function appendEvent(params: {
  itemId: string;
  walletId: string;
  eventType: string;
  payload: Record<string, unknown>;
  custodyState?: CustodyState;
  idempotencyKey?: string;
}): Promise<ApiResponse<{ event: LedgerEvent }>> {
  try {
    const correlationId = randomUUID();
    const idempotencyKey = params.idempotencyKey || `home_${randomUUID()}`;
    const occurredAt = new Date().toISOString();
    const canonicalHashHex = hashPayload(params.payload);

    // Build canonical envelope
    const canonicalEvent = {
      schema_version: SCHEMA_VERSION,
      event_type: params.eventType,
      occurred_at: occurredAt,
      committed_at: occurredAt, // Will be overwritten by Ledger
      correlation_id: correlationId,
      idempotency_key: idempotencyKey,
      producer: PRODUCER,
      producer_version: PRODUCER_VERSION,
      subject: {
        asset_id: params.itemId, // itemId is the PAID
      },
      payload: {
        ...params.payload,
        wallet_id: params.walletId,
        custody_state: params.custodyState,
      },
      canonical_hash_hex: canonicalHashHex,
    };

    const response = await fetch(`${LEDGER_API_BASE}/api/v1/events/canonical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(canonicalEvent),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.error || 'LEDGER_ERROR',
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.details,
        },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        event: {
          eventId: data.event_id,
          itemId: params.itemId,
          walletId: params.walletId,
          eventType: params.eventType,
          payload: params.payload,
          payloadHash: canonicalHashHex,
          previousHash: '',
          hash: data.entry_hash,
          timestamp: data.committed_at,
          sequence: data.sequence_number,
        },
      },
    };
  } catch (error) {
    console.error('[LEDGER] Failed to append event:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Get item event history
 */
export async function getItemHistory(
  itemId: string,
  options?: { limit?: number; offset?: number }
): Promise<ApiResponse<{ events: LedgerEvent[]; total: number }>> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const url = `${LEDGER_API_BASE}/items/${itemId}/events${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('[LEDGER] Failed to get item history:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Get item custody state
 */
export async function getItemCustody(itemId: string): Promise<ApiResponse<{ custody: CustodyRecord }>> {
  try {
    const response = await fetch(`${LEDGER_API_BASE}/items/${itemId}/custody`);
    return await response.json();
  } catch (error) {
    console.error('[LEDGER] Failed to get custody state:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Get wallet history (all events for a user)
 */
export async function getWalletHistory(
  walletId: string,
  options?: { limit?: number; offset?: number; eventType?: string }
): Promise<ApiResponse<{ events: LedgerEvent[]; total: number }>> {
  try {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.eventType) params.set('eventType', options.eventType);

    const url = `${LEDGER_API_BASE}/wallets/${walletId}/history${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('[LEDGER] Failed to get wallet history:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    };
  }
}

/**
 * Check LEDGER API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8006/health');
    const data = await response.json();
    return data.status === 'ok' || data.status === 'healthy';
  } catch {
    return false;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const LedgerService = {
  registerItem,
  updateCustodyState,
  addItemPhoto,
  updateValuation,
  initiateClaim,
  getItemHistory,
  getItemCustody,
  getWalletHistory,
  checkHealth,
  EVENT_TYPES: HOME_EVENT_TYPES,
};

export default LedgerService;
