/**
 * @file services/core-client.ts
 * @description PROVENIQ Core API Client for Home App
 * 
 * Provides:
 * - Real-time valuation as items are added
 * - PAID registration for assets
 * - Fraud pre-screening before claims
 * - Provenance scoring
 */

// ============================================
// CONFIGURATION
// ============================================

const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8000';

// ============================================
// TYPES
// ============================================

export interface ValuationRequest {
  assetId: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  purchasePrice?: number;
  purchaseDate?: string;
  hasReceipt?: boolean;
}

export interface ValuationResult {
  assetId: string;
  estimatedValue: number;
  currency: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidencePercent: number;
  breakdown: {
    baseValue: number;
    depreciationRate: number;
    yearsOwned: number;
    depreciatedValue: number;
    conditionMultiplier: number;
    brandPremium: number;
    finalValue: number;
  };
  biasFlags: string[];
  valuedAt: string;
}

export interface PAIDRegistrationRequest {
  ownerId: string;
  name: string;
  category: string;
  subcategory?: string;
  sourceApp: 'home';
  externalId: string; // Home's inventory item ID
  initialValue?: number;
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
}

export interface PAIDRecord {
  paid: string;
  ownerId: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'ARCHIVED' | 'DISPUTED';
  registeredAt: string;
}

export interface FraudScreeningRequest {
  assetId: string;
  userId: string;
  claimType: 'insurance' | 'valuation' | 'sale' | 'loan';
  claimedValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  category: string;
  hasReceipt: boolean;
  hasImages: boolean;
  imageCount: number;
  hasSerialNumber?: boolean;
  previousClaims?: number;
  accountAgeDays?: number;
}

export interface FraudScreeningResult {
  assetId: string;
  userId: string;
  score: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'ESCALATE' | 'AUTO_DENY';
  signals: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
  }>;
  scoredAt: string;
}

export interface ProvenanceRequest {
  assetId: string;
  hasReceipt: boolean;
  receiptVerified?: boolean;
  imageCount: number;
  imagesHashed?: boolean;
  hasSerialNumber?: boolean;
  ownershipEvents?: number;
  currentOwnershipDays?: number;
  ledgerEventCount?: number;
  sourceApp: 'home';
  userVerified?: boolean;
}

export interface ProvenanceResult {
  assetId: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scoredAt: string;
}

// ============================================
// API CLIENT
// ============================================

class CoreClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = CORE_API_URL;
  }

  /**
   * Get real-time valuation for an asset
   */
  async getValuation(request: ValuationRequest): Promise<ValuationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/valuations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-App': 'proveniq-home',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback to local estimation
      console.warn('[Core] Valuation API unavailable, using local fallback');
      return this.localValuationFallback(request);
    } catch (error) {
      console.error('[Core] Valuation request failed:', error);
      return this.localValuationFallback(request);
    }
  }

  /**
   * Register asset and get PAID
   */
  async registerAsset(request: PAIDRegistrationRequest): Promise<PAIDRecord | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/registry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-App': 'proveniq-home',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const record = await response.json();
        console.log(`[Core] Asset registered: ${record.paid}`);
        return record;
      }

      console.warn('[Core] PAID registration failed:', response.status);
      return null;
    } catch (error) {
      console.error('[Core] PAID registration error:', error);
      return null;
    }
  }

  /**
   * Get asset by PAID
   */
  async getAssetByPAID(paid: string): Promise<PAIDRecord | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/registry/${paid}`, {
        method: 'GET',
        headers: {
          'X-Source-App': 'proveniq-home',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('[Core] Asset lookup error:', error);
      return null;
    }
  }

  /**
   * Pre-screen for fraud before claims submission
   */
  async screenForFraud(request: FraudScreeningRequest): Promise<FraudScreeningResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/fraud/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-App': 'proveniq-home',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback: Allow with manual review
      console.warn('[Core] Fraud API unavailable, defaulting to manual review');
      return this.localFraudFallback(request);
    } catch (error) {
      console.error('[Core] Fraud screening error:', error);
      return this.localFraudFallback(request);
    }
  }

  /**
   * Get provenance score for an asset
   */
  async getProvenanceScore(request: ProvenanceRequest): Promise<ProvenanceResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/provenance/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-App': 'proveniq-home',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }

      console.warn('[Core] Provenance API unavailable, using local fallback');
      return this.localProvenanceFallback(request);
    } catch (error) {
      console.error('[Core] Provenance error:', error);
      return this.localProvenanceFallback(request);
    }
  }

  /**
   * Check Core service health
   */
  async checkHealth(): Promise<{ available: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      return {
        available: response.ok,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        available: false,
        latencyMs: Date.now() - start,
      };
    }
  }

  // ============================================
  // LOCAL FALLBACKS
  // ============================================

  private localValuationFallback(request: ValuationRequest): ValuationResult {
    const depreciationRates: Record<string, number> = {
      electronics: 0.25,
      furniture: 0.10,
      jewelry: 0.02,
      clothing: 0.40,
      appliances: 0.12,
      default: 0.15,
    };

    const conditionMultipliers: Record<string, number> = {
      new: 1.0,
      excellent: 0.9,
      good: 0.75,
      fair: 0.5,
      poor: 0.25,
    };

    const category = request.category.toLowerCase();
    const rate = depreciationRates[category] || depreciationRates.default;
    const conditionMult = conditionMultipliers[request.condition] || 0.75;

    let baseValue = request.purchasePrice || 500;
    let yearsOwned = 0;

    if (request.purchaseDate) {
      const purchaseDate = new Date(request.purchaseDate);
      yearsOwned = (Date.now() - purchaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    }

    const depreciatedValue = baseValue * Math.pow(1 - rate, yearsOwned);
    const finalValue = Math.round(depreciatedValue * conditionMult);

    return {
      assetId: request.assetId,
      estimatedValue: finalValue,
      currency: 'USD',
      confidence: request.purchasePrice ? 'MEDIUM' : 'LOW',
      confidencePercent: request.purchasePrice ? 65 : 40,
      breakdown: {
        baseValue,
        depreciationRate: rate,
        yearsOwned: Math.round(yearsOwned * 10) / 10,
        depreciatedValue: Math.round(depreciatedValue),
        conditionMultiplier: conditionMult,
        brandPremium: 0,
        finalValue,
      },
      biasFlags: request.purchasePrice ? [] : ['MISSING_PURCHASE_PRICE'],
      valuedAt: new Date().toISOString(),
    };
  }

  private localFraudFallback(request: FraudScreeningRequest): FraudScreeningResult {
    // Conservative fallback: Recommend manual review
    return {
      assetId: request.assetId,
      userId: request.userId,
      score: 50,
      riskLevel: 'MEDIUM',
      recommendation: 'MANUAL_REVIEW',
      signals: [
        {
          code: 'CORE_UNAVAILABLE',
          severity: 'MEDIUM',
          description: 'Core fraud scoring unavailable, defaulting to manual review',
        },
      ],
      scoredAt: new Date().toISOString(),
    };
  }

  private localProvenanceFallback(request: ProvenanceRequest): ProvenanceResult {
    let score = 30; // Base score
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (request.hasReceipt) {
      score += 20;
      strengths.push('Receipt on file');
    } else {
      weaknesses.push('No receipt');
      recommendations.push('Add purchase receipt');
    }

    if (request.imageCount >= 3) {
      score += 15;
      strengths.push(`${request.imageCount} photos documented`);
    } else if (request.imageCount > 0) {
      score += 5;
      recommendations.push('Add more photos from multiple angles');
    } else {
      weaknesses.push('No photos');
      recommendations.push('Add photos of item');
    }

    if (request.hasSerialNumber) {
      score += 10;
      strengths.push('Serial number recorded');
    }

    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F';

    return {
      assetId: request.assetId,
      score: Math.min(score, 100),
      grade,
      confidence: 'LOW',
      strengths,
      weaknesses,
      recommendations,
      scoredAt: new Date().toISOString(),
    };
  }
}

// Singleton export
export const coreClient = new CoreClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Home inventory item to valuation request
 */
export function toValuationRequest(item: {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  hasReceipt?: boolean;
}): ValuationRequest {
  return {
    assetId: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    brand: item.brand,
    model: item.model,
    condition: (item.condition as ValuationRequest['condition']) || 'good',
    purchasePrice: item.purchasePrice,
    purchaseDate: item.purchaseDate,
    hasReceipt: item.hasReceipt,
  };
}

/**
 * Convert Home inventory item to PAID registration request
 */
export function toPAIDRegistrationRequest(
  userId: string,
  item: {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    estimatedValue?: number;
    condition?: string;
  }
): PAIDRegistrationRequest {
  return {
    ownerId: userId,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    sourceApp: 'home',
    externalId: item.id,
    initialValue: item.estimatedValue,
    condition: (item.condition as PAIDRegistrationRequest['condition']) || 'good',
  };
}

/**
 * Convert Home inventory item to fraud screening request
 */
export function toFraudScreeningRequest(
  userId: string,
  item: {
    id: string;
    category: string;
    estimatedValue?: number;
    purchasePrice?: number;
    purchaseDate?: string;
    hasReceipt?: boolean;
    images?: string[];
    serialNumber?: string;
  },
  claimType: FraudScreeningRequest['claimType'] = 'insurance'
): FraudScreeningRequest {
  return {
    assetId: item.id,
    userId,
    claimType,
    claimedValue: item.estimatedValue || 0,
    purchasePrice: item.purchasePrice,
    purchaseDate: item.purchaseDate,
    category: item.category,
    hasReceipt: item.hasReceipt || false,
    hasImages: (item.images?.length || 0) > 0,
    imageCount: item.images?.length || 0,
    hasSerialNumber: !!item.serialNumber,
  };
}
