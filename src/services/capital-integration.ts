/**
 * @file src/services/capital-integration.ts
 * @description PROVENIQ Capital Integration - Asset-backed lending for Home users
 * 
 * Enables consumers to use their verified assets as collateral for loans.
 * Capital consumes truth from Ledger (valuations, condition, ownership).
 */

import { InventoryItem } from '@/lib/types';

const CAPITAL_API_URL = process.env.NEXT_PUBLIC_CAPITAL_API_URL || 'http://localhost:8002';

export interface LoanEligibility {
  eligible: boolean;
  maxLoanAmount: number;
  ltv: number; // Loan-to-value ratio (e.g., 0.6 = 60%)
  estimatedRate: number; // APR as decimal (e.g., 0.12 = 12%)
  term: number; // Months
  reasons: string[];
  requiredCovenants: string[];
}

export interface LoanOffer {
  offerId: string;
  principal: number;
  apr: number;
  term: number; // Months
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  collateralAssets: string[]; // Asset IDs
  covenants: LoanCovenant[];
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface LoanCovenant {
  type: 'custody' | 'condition' | 'insurance' | 'location';
  description: string;
  monitoredBy: 'ledger' | 'anchors' | 'protect';
}

export interface ActiveLoan {
  loanId: string;
  principal: number;
  remainingBalance: number;
  apr: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  collateralAssets: AssetCollateral[];
  status: 'current' | 'late' | 'default' | 'paid_off';
  covenantStatus: 'compliant' | 'warning' | 'breach';
  originatedAt: string;
}

export interface AssetCollateral {
  assetId: string;
  name: string;
  valuationAtOrigination: number;
  currentValuation: number;
  ltvContribution: number;
}

/**
 * Check if an asset is eligible for collateral lending
 */
export async function checkLoanEligibility(
  assets: InventoryItem[],
  requestedAmount: number,
  userIdToken: string
): Promise<LoanEligibility> {
  try {
    const response = await fetch(`${CAPITAL_API_URL}/v1/capital/eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
        'X-Source-App': 'proveniq-home',
      },
      body: JSON.stringify({
        assets: assets.map(a => ({
          assetId: a.id,
          name: a.name,
          category: a.category,
          marketValue: a.marketValue || a.purchasePrice,
          condition: a.condition,
          hasReceipt: !!a.receiptUrl,
          hasImages: !!(a.imageUrl || (a.additionalImages && a.additionalImages.length > 0)),
          provenanceScore: a.provenanceScore,
        })),
        requestedAmount,
      }),
    });

    if (response.ok) {
      return await response.json();
    }

    // Capital service unavailable - return mock eligibility check
    console.warn('[Capital] Service unavailable, using local eligibility check');
  } catch (error) {
    console.warn('[Capital] Eligibility check failed:', error);
  }

  // Fallback: Local eligibility calculation
  return calculateLocalEligibility(assets, requestedAmount);
}

/**
 * Local eligibility calculation when Capital service unavailable
 */
function calculateLocalEligibility(assets: InventoryItem[], requestedAmount: number): LoanEligibility {
  const reasons: string[] = [];
  const requiredCovenants: string[] = [];

  // Calculate total collateral value
  const totalValue = assets.reduce((sum, a) => {
    const value = a.marketValue || a.purchasePrice || 0;
    return sum + value;
  }, 0);

  // Check minimum requirements
  if (totalValue < 500) {
    return {
      eligible: false,
      maxLoanAmount: 0,
      ltv: 0,
      estimatedRate: 0,
      term: 0,
      reasons: ['Minimum collateral value is $500'],
      requiredCovenants: [],
    };
  }

  // Category-specific LTV rates
  const categoryLTV: Record<string, number> = {
    'Electronics': 0.40,
    'Jewelry': 0.60,
    'Watches': 0.55,
    'Art': 0.30,
    'Collectibles': 0.35,
    'Vehicles': 0.50,
    'Musical Instruments': 0.45,
    'Furniture': 0.25,
    'default': 0.35,
  };

  // Calculate weighted LTV
  let weightedLTV = 0;
  assets.forEach(a => {
    const value = a.marketValue || a.purchasePrice || 0;
    const ltv = categoryLTV[a.category] || categoryLTV['default'];
    weightedLTV += (value / totalValue) * ltv;
  });

  const maxLoanAmount = Math.floor(totalValue * weightedLTV);

  // Check provenance
  const hasStrongProvenance = assets.every(a => (a.provenanceScore || 0) >= 70);
  if (!hasStrongProvenance) {
    reasons.push('Some assets have weak provenance - higher rate applies');
  }

  // Check documentation
  const hasReceipts = assets.every(a => !!a.receiptUrl);
  if (!hasReceipts) {
    reasons.push('Missing purchase receipts - may affect loan terms');
  }

  // Base rate calculation
  let baseRate = 0.12; // 12% APR base
  if (!hasStrongProvenance) baseRate += 0.03;
  if (!hasReceipts) baseRate += 0.02;

  // Required covenants
  requiredCovenants.push('Asset must remain in your custody');
  requiredCovenants.push('Asset condition must be maintained');
  if (assets.some(a => (a.marketValue || 0) > 5000)) {
    requiredCovenants.push('High-value assets require Protect coverage');
  }

  const eligible = requestedAmount <= maxLoanAmount;
  if (!eligible) {
    reasons.push(`Requested amount ($${requestedAmount.toLocaleString()}) exceeds maximum ($${maxLoanAmount.toLocaleString()})`);
  }

  return {
    eligible,
    maxLoanAmount,
    ltv: weightedLTV,
    estimatedRate: baseRate,
    term: 12, // Default 12 months
    reasons,
    requiredCovenants,
  };
}

/**
 * Request a loan offer from Capital
 */
export async function requestLoanOffer(
  assets: InventoryItem[],
  amount: number,
  term: number,
  userIdToken: string
): Promise<LoanOffer | null> {
  try {
    const response = await fetch(`${CAPITAL_API_URL}/v1/capital/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userIdToken}`,
        'X-Source-App': 'proveniq-home',
      },
      body: JSON.stringify({
        assetIds: assets.map(a => a.id),
        requestedAmount: amount,
        requestedTerm: term,
      }),
    });

    if (response.ok) {
      return await response.json();
    }

    console.warn('[Capital] Offer request failed:', response.status);
  } catch (error) {
    console.warn('[Capital] Offer request error:', error);
  }

  // Return mock offer for demonstration
  const apr = 0.12;
  const monthlyRate = apr / 12;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                         (Math.pow(1 + monthlyRate, term) - 1);
  const totalRepayment = monthlyPayment * term;

  return {
    offerId: `offer_${Date.now()}`,
    principal: amount,
    apr,
    term,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round((totalRepayment - amount) * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    collateralAssets: assets.map(a => a.id),
    covenants: [
      { type: 'custody', description: 'Asset must remain in your possession', monitoredBy: 'ledger' },
      { type: 'condition', description: 'Asset condition must be maintained', monitoredBy: 'anchors' },
    ],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    status: 'pending',
  };
}

/**
 * Get active loans for user
 */
export async function getActiveLoans(userIdToken: string): Promise<ActiveLoan[]> {
  try {
    const response = await fetch(`${CAPITAL_API_URL}/v1/capital/loans`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userIdToken}`,
        'X-Source-App': 'proveniq-home',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.loans || [];
    }
  } catch (error) {
    console.warn('[Capital] Failed to fetch loans:', error);
  }

  // Return empty array - no mock loans
  return [];
}

/**
 * Accept a loan offer
 */
export async function acceptLoanOffer(
  offerId: string,
  userIdToken: string
): Promise<{ success: boolean; loanId?: string; error?: string }> {
  try {
    const response = await fetch(`${CAPITAL_API_URL}/v1/capital/offers/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userIdToken}`,
        'X-Source-App': 'proveniq-home',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, loanId: data.loanId };
    }

    const error = await response.json();
    return { success: false, error: error.message || 'Failed to accept offer' };
  } catch (error) {
    return { success: false, error: 'Capital service unavailable' };
  }
}
