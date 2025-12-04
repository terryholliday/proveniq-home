
export interface ValuationInput {
    category: string;
    brand?: string;
    model?: string;
    condition: string; // e.g., 'New', 'Excellent', 'Good', 'Fair', 'Poor'
    ageYears?: number;
    materials?: string[];
    description?: string;
    originalPrice?: number;
    listingPrice?: number; // If comparing to a specific listing
    provenanceScore?: number; // 0-100
}

export interface ValuationResult {
    estimatedValue: {
        min: number;
        max: number;
        currency: string;
    };
    confidenceScore: number; // 0-100
    factors: {
        brand: number; // Impact factor
        condition: number;
        age: number;
        materials: number;
        market: number;
    };
    explanation: string;
    modelBreakdown: {
        aiDescription?: number;
        priceHistory?: number;
        marketComparison?: number;
        conditionAdjusted?: number;
    };
    depreciationCurve?: {
        year: number;
        value: number;
    }[];
}

// --- Models ---

class AIDescriptionModel {
    async estimate(input: ValuationInput): Promise<number | null> {
        // Placeholder: In a real scenario, this would call an LLM or ML model
        // analyzing the description text.
        if (!input.description) return null;

        // Simple heuristic for demo: length of description * multiplier + base
        const baseValue = 50;
        const complexityBonus = input.description.length * 0.5;
        return baseValue + complexityBonus;
    }
}

class PriceHistoryModel {
    async estimate(input: ValuationInput): Promise<number | null> {
        // Placeholder: Look up internal historical sales/valuations
        // For demo, return a variation of original price if available
        if (input.originalPrice) {
            return input.originalPrice * 0.6; // Assume 40% depreciation baseline
        }
        return null;
    }
}

class MarketplaceComparisonModel {
    async estimate(input: ValuationInput): Promise<number | null> {
        // Placeholder: External API call to eBay/Reverb/etc.
        // For demo, return a random value within a range for the category
        const basePrices: Record<string, number> = {
            'guitar': 800,
            'electronics': 300,
            'furniture': 150,
            'default': 100
        };
        const base = basePrices[input.category.toLowerCase()] || basePrices['default'];
        return base * (0.8 + Math.random() * 0.4); // +/- 20%
    }
}

class ConditionAdjustedModel {
    async estimate(input: ValuationInput, baseValue: number): Promise<number> {
        const conditionMultipliers: Record<string, number> = {
            'new': 1.0,
            'excellent': 0.9,
            'good': 0.75,
            'fair': 0.5,
            'poor': 0.2
        };
        const multiplier = conditionMultipliers[input.condition.toLowerCase()] || 0.5;
        return baseValue * multiplier;
    }
}

// --- Engine ---

export class ValuationEngine {
    private aiModel = new AIDescriptionModel();
    private historyModel = new PriceHistoryModel();
    private marketModel = new MarketplaceComparisonModel();
    private conditionModel = new ConditionAdjustedModel();

    async evaluate(input: ValuationInput): Promise<ValuationResult> {
        // 1. Run models
        const aiVal = await this.aiModel.estimate(input);
        const historyVal = await this.historyModel.estimate(input);
        const marketVal = await this.marketModel.estimate(input);

        // 2. Ensemble Logic (Weighted Average)
        let totalValue = 0;
        let totalWeight = 0;
        const breakdown: any = {};

        if (aiVal !== null) {
            totalValue += aiVal * 0.2;
            totalWeight += 0.2;
            breakdown.aiDescription = aiVal;
        }
        if (historyVal !== null) {
            totalValue += historyVal * 0.3;
            totalWeight += 0.3;
            breakdown.priceHistory = historyVal;
        }
        if (marketVal !== null) {
            totalValue += marketVal * 0.5;
            totalWeight += 0.5;
            breakdown.marketComparison = marketVal;
        }

        let baseEstimate = totalWeight > 0 ? totalValue / totalWeight : 0;

        // Fallback if no models returned data (shouldn't happen with market fallback)
        if (baseEstimate === 0) {
            baseEstimate = 100; // Default fallback
        }

        // 3. Condition Adjustment
        const finalEstimate = await this.conditionModel.estimate(input, baseEstimate);
        breakdown.conditionAdjusted = finalEstimate;

        // 4. Confidence Scoring
        // More models agreeing + more data = higher confidence
        let confidence = 50; // Base
        if (historyVal !== null) confidence += 20;
        if (marketVal !== null) confidence += 20;
        if (input.brand) confidence += 5;
        if (input.model) confidence += 5;
        if (input.provenanceScore) confidence += (input.provenanceScore / 100) * 20; // Up to 20 points for perfect provenance

        // Cap at 100
        confidence = Math.min(100, confidence);

        // 5. Factors & Explanation
        const factors = {
            brand: input.brand ? 10 : 0,
            condition: (breakdown.conditionAdjusted / baseEstimate) * 100 - 100, // % change
            age: input.ageYears ? -5 * input.ageYears : 0, // Simple depreciation
            materials: input.materials ? 5 : 0,
            provenance: input.provenanceScore ? (input.provenanceScore / 10) : 0,
            market: 0 // Placeholder
        };

        const explanation = `This estimate is based on ${marketVal ? 'recent sales of similar items, ' : ''
            }${input.ageYears ? 'age, ' : ''}and detected condition (${input.condition}).`;

        // 6. Depreciation Curve (Temporal)
        const depreciationCurve = [];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i <= 5; i++) {
            depreciationCurve.push({
                year: currentYear + i,
                value: finalEstimate * Math.pow(0.95, i) // 5% annual depreciation
            });
        }

        return {
            estimatedValue: {
                min: Math.floor(finalEstimate * 0.9),
                max: Math.ceil(finalEstimate * 1.1),
                currency: 'USD'
            },
            confidenceScore: confidence,
            factors,
            explanation,
            modelBreakdown: breakdown,
            depreciationCurve
        };
    }
}
