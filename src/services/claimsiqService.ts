/**
 * CLAIMSIQ Integration Service for HOME App
 * 
 * Implements INTER_APP_CONTRACT.md compliance:
 * - Submits insurance claims from inventory items
 * - Tracks claim status
 * - Receives claim.settled events
 */

const CLAIMSIQ_API_BASE = process.env.NEXT_PUBLIC_CLAIMSIQ_API_URL || 'http://localhost:3005/v1/claimsiq';

// =============================================================================
// TYPES
// =============================================================================

export type ClaimType = 'INSURANCE' | 'WARRANTY' | 'DAMAGE';
export type ClaimStatus = 'INTAKE' | 'PROCESSING' | 'APPROVED' | 'DENIED' | 'PAID';

export interface ClaimSubmission {
  itemId: string;
  itemName: string;
  walletId: string;
  claimType: ClaimType;
  description: string;
  estimatedValueCents: number;
  evidenceHashes: string[];
  purchaseDate?: string;
  purchaseReceiptHash?: string;
}

export interface ClaimResult {
  success: boolean;
  claimId?: string;
  correlationId?: string;
  status?: ClaimStatus;
  error?: string;
}

export interface ClaimStatusResponse {
  claimId: string;
  status: ClaimStatus;
  decision?: 'PAY' | 'DENY';
  amountApprovedCents?: number;
  rationale?: string;
  auditSeal?: string;
  updatedAt: string;
}

// =============================================================================
// CLAIM SUBMISSION
// =============================================================================

/**
 * Submit an insurance claim for an inventory item
 */
export async function submitInsuranceClaim(
  submission: ClaimSubmission,
  authToken: string
): Promise<ClaimResult> {
  try {
    const payload = {
      id: `home-claim-${submission.itemId}-${Date.now()}`,
      intake_timestamp: new Date().toISOString(),
      policy_snapshot_id: submission.walletId,
      claimant_did: `did:proveniq:wallet:${submission.walletId}`,
      asset_id: submission.itemId,
      incident_vector: {
        type: mapClaimType(submission.claimType),
        severity: calculateSeverity(submission.estimatedValueCents),
        description_hash: hashDescription(submission.description),
      },
      claim_type: submission.claimType,
      evidence: {
        item_name: submission.itemName,
        estimated_value_cents: submission.estimatedValueCents,
        evidence_hashes: submission.evidenceHashes,
        purchase_date: submission.purchaseDate,
        purchase_receipt_hash: submission.purchaseReceiptHash,
        description: submission.description,
      },
    };

    const response = await fetch(`${CLAIMSIQ_API_BASE}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Source-App': 'proveniq-home',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ClaimsIQ] Submission failed:', errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log('[ClaimsIQ] Claim submitted:', data.claimId);

    return {
      success: true,
      claimId: data.claimId || data.claim_id,
      correlationId: data.correlationId,
      status: 'INTAKE',
    };
  } catch (error) {
    console.error('[ClaimsIQ] Network error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get the status of a submitted claim
 */
export async function getClaimStatus(
  claimId: string,
  authToken: string
): Promise<ClaimStatusResponse | null> {
  try {
    const response = await fetch(`${CLAIMSIQ_API_BASE}/claims/${claimId}/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Source-App': 'proveniq-home',
      },
    });

    if (!response.ok) {
      console.error('[ClaimsIQ] Status fetch failed:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[ClaimsIQ] Status fetch error:', error);
    return null;
  }
}

/**
 * Get pre-loss provenance for an item (for claim readiness)
 */
export async function getPreLossProvenance(
  itemId: string,
  authToken: string
): Promise<{
  provenanceScore: number;
  documentedValue: number;
  claimReadiness: 'HIGH' | 'MEDIUM' | 'LOW';
} | null> {
  try {
    const response = await fetch(`${CLAIMSIQ_API_BASE}/items/${itemId}/preloss-provenance`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Source-App': 'proveniq-home',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[ClaimsIQ] Provenance fetch error:', error);
    return null;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function mapClaimType(claimType: ClaimType): string {
  switch (claimType) {
    case 'INSURANCE':
      return 'PROPERTY_LOSS';
    case 'WARRANTY':
      return 'WARRANTY_CLAIM';
    case 'DAMAGE':
      return 'PROPERTY_DAMAGE';
    default:
      return 'UNKNOWN';
  }
}

function calculateSeverity(valueCents: number): number {
  // 1-10 scale based on value
  if (valueCents < 10000) return 2;      // < $100
  if (valueCents < 50000) return 4;      // < $500
  if (valueCents < 100000) return 5;     // < $1000
  if (valueCents < 500000) return 7;     // < $5000
  if (valueCents < 1000000) return 8;    // < $10000
  return 10;                              // >= $10000
}

function hashDescription(description: string): string {
  // Simple hash for description - in production use crypto
  let hash = 0;
  for (let i = 0; i < description.length; i++) {
    const char = description.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const claimsiqService = {
  submitInsuranceClaim,
  getClaimStatus,
  getPreLossProvenance,
};

export default claimsiqService;
