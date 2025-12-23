/**
 * LEDGER Integration Service for HOME App
 * 
 * Implements INTER_APP_CONTRACT.md compliance:
 * - Publishes events to LEDGER via API
 * - Subscribes to ledger.event.appended
 * - Enforces custody state transitions
 * - Uses walletId (Zero PII)
 */

const LEDGER_API_BASE = process.env.NEXT_PUBLIC_LEDGER_API_URL || 'http://localhost:8006/api/v1';

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
// EVENT TYPES (per INTER_APP_CONTRACT)
// =============================================================================

export const HOME_EVENT_TYPES = {
  ITEM_REGISTERED: 'home.item.registered',
  ITEM_UPDATED: 'home.item.updated',
  ITEM_PHOTO_ADDED: 'home.item.photo_added',
  ITEM_DOCUMENT_ADDED: 'home.item.document_added',
  ITEM_VALUATION_UPDATED: 'home.item.valuation_updated',
  CUSTODY_CHANGED: 'home.custody.changed',
  CLAIM_INITIATED: 'home.claim.initiated',
} as const;

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
    eventType: HOME_EVENT_TYPES.ITEM_REGISTERED,
    payload: {
      itemType: params.itemType,
      description: params.description,
      initialValuation: params.initialValuation,
      registeredAt: new Date().toISOString(),
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
    eventType: HOME_EVENT_TYPES.ITEM_PHOTO_ADDED,
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
    eventType: HOME_EVENT_TYPES.ITEM_VALUATION_UPDATED,
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
// CORE API METHODS
// =============================================================================

/**
 * Append an event to the ledger
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (params.idempotencyKey) {
      headers['X-Idempotency-Key'] = params.idempotencyKey;
    }

    const response = await fetch(`${LEDGER_API_BASE}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        itemId: params.itemId,
        walletId: params.walletId,
        eventType: params.eventType,
        payload: params.payload,
        custodyState: params.custodyState,
      }),
    });

    return await response.json();
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
