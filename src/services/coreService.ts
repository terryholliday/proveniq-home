/**
 * CORE Integration Service for HOME App
 * 
 * Integrates with PROVENIQ Core for:
 * - Centralized valuations
 * - Fraud scoring
 * - Asset registry (PAID management)
 */

const CORE_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8000';

// =============================================================================
// TYPES
// =============================================================================

export interface ValuationRequest {
  assetId: string;
  itemType: string;
  category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  purchasePriceCents?: number;
  purchaseDate?: string;
  brand?: string;
  model?: string;
}

export interface ValuationResult {
  valuationId: string;
  assetId: string;
  estimatedValueCents: number;
  lowEstimateCents: number;
  highEstimateCents: number;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  method: string;
  biasFlags: string[];
  depreciation: {
    rate: number;
    yearsOwned: number;
    depreciatedAmount: number;
  };
}

export interface FraudScoreResult {
  scoreId: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  signals: Array<{
    signalType: string;
    severity: number;
    description: string;
  }>;
  recommendation: 'approve' | 'review' | 'escalate' | 'deny';
}

export interface AssetRegistration {
  paid: string; // PROVENIQ Asset ID
  sourceApp: string;
  sourceAssetId: string;
  assetType: string;
  category: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Get centralized valuation from Core
 */
export async function getValuation(request: ValuationRequest): Promise<ValuationResult | null> {
  try {
    const response = await fetch(`${CORE_API_BASE}/v1/valuations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset_id: request.assetId,
        item_type: request.itemType,
        category: request.category,
        condition: request.condition,
        purchase_price_micros: request.purchasePriceCents ? (request.purchasePriceCents * 10000).toString() : undefined,
        purchase_date: request.purchaseDate,
        brand: request.brand,
        model: request.model,
        source_app: 'home',
      }),
    });

    if (!response.ok) {
      console.warn('[CORE] Valuation request failed:', response.status);
      return null;
    }

    const data = await response.json() as any;
    return {
      valuationId: data.valuation_id,
      assetId: data.asset_id,
      estimatedValueCents: Math.round(parseInt(data.estimated_value_micros) / 10000),
      lowEstimateCents: Math.round(parseInt(data.low_estimate_micros) / 10000),
      highEstimateCents: Math.round(parseInt(data.high_estimate_micros) / 10000),
      confidenceScore: data.confidence_score,
      confidenceLevel: data.confidence_level,
      method: data.method,
      biasFlags: data.bias_flags || [],
      depreciation: {
        rate: data.depreciation_rate || 0,
        yearsOwned: data.years_owned || 0,
        depreciatedAmount: data.depreciated_amount_cents || 0,
      },
    };
  } catch (error) {
    console.error('[CORE] Valuation error:', error);
    return null;
  }
}

/**
 * Get fraud score for a claim
 */
export async function getFraudScore(params: {
  claimId: string;
  userId: string;
  assetId: string;
  claimAmountCents: number;
  evidenceCount: number;
  hasAnchor: boolean;
}): Promise<FraudScoreResult | null> {
  try {
    const response = await fetch(`${CORE_API_BASE}/v1/fraud/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'claim',
        entity_id: params.claimId,
        user_id: params.userId,
        asset_id: params.assetId,
        amount_micros: (params.claimAmountCents * 10000).toString(),
        source_app: 'home',
        event_type: 'CLAIM_SUBMITTED',
        evidence_count: params.evidenceCount,
        has_anchor_verification: params.hasAnchor,
      }),
    });

    if (!response.ok) {
      console.warn('[CORE] Fraud score request failed:', response.status);
      return null;
    }

    const data = await response.json() as any;
    return {
      scoreId: data.score_id,
      score: data.score,
      riskLevel: data.risk_level,
      signals: (data.signals || []).map((s: any) => ({
        signalType: s.signal_type,
        severity: s.severity,
        description: s.description,
      })),
      recommendation: data.recommendation,
    };
  } catch (error) {
    console.error('[CORE] Fraud score error:', error);
    return null;
  }
}

/**
 * Register asset in Core registry (get PAID)
 */
export async function registerAsset(params: {
  sourceAssetId: string;
  assetType: string;
  category: string;
  name: string;
  description?: string;
  ownerId: string;
  valueCents?: number;
}): Promise<AssetRegistration | null> {
  try {
    const response = await fetch(`${CORE_API_BASE}/v1/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_app: 'home',
        source_asset_id: params.sourceAssetId,
        asset_type: params.assetType,
        category: params.category,
        name: params.name,
        description: params.description,
        owner_id: params.ownerId,
        current_value_micros: params.valueCents ? (params.valueCents * 10000).toString() : undefined,
      }),
    });

    if (!response.ok) {
      console.warn('[CORE] Asset registration failed:', response.status);
      return null;
    }

    const data = await response.json() as any;
    return {
      paid: data.paid,
      sourceApp: data.source_app,
      sourceAssetId: data.source_asset_id,
      assetType: data.asset_type,
      category: data.category,
      name: data.name,
      ownerId: data.owner_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[CORE] Asset registration error:', error);
    return null;
  }
}

/**
 * Get asset by PAID
 */
export async function getAsset(paid: string): Promise<AssetRegistration | null> {
  try {
    const response = await fetch(`${CORE_API_BASE}/v1/assets/${paid}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      console.warn('[CORE] Asset lookup failed:', response.status);
      return null;
    }

    const data = await response.json() as any;
    return {
      paid: data.paid,
      sourceApp: data.source_app,
      sourceAssetId: data.source_asset_id,
      assetType: data.asset_type,
      category: data.category,
      name: data.name,
      ownerId: data.owner_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('[CORE] Asset lookup error:', error);
    return null;
  }
}

/**
 * Check Core API health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${CORE_API_BASE}/health`);
    const data = await response.json();
    return data.status === 'ok' || data.status === 'healthy';
  } catch {
    return false;
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export const CoreService = {
  getValuation,
  getFraudScore,
  registerAsset,
  getAsset,
  checkHealth,
};

export default CoreService;
