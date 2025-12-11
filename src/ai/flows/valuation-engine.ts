import { InventoryItem } from "../../lib/types";

export interface ValuationResult {
    estimatedValue: number;
    currency: string;
    confidence: number;
    explanation: string;
    valuationDate: string;
    marketTrend?: {
        direction: 'up' | 'down' | 'stable';
        percentage: number;
    };
}

export interface ValuationAlert {
    itemId: string;
    itemName: string;
    oldValue: number;
    newValue: number;
    percentChange: number;
    message: string;
}

// Depreciation rates per category (annual)
const DEPRECIATION_RATES: Record<string, number> = {
    "Electronics": 0.20,
    "Computers": 0.25,
    "Mobile": 0.25,
    "Furniture": 0.10,
    "Musical Instruments": 0.03,
    "Guitars": 0.02,
    "Collectibles": -0.05, // Appreciates
    "Vehicles": 0.15,
    "default": 0.10
};

const CONDITION_FACTORS: Record<string, number> = {
    "New": 1.0,
    "Like New": 0.95,
    "Good": 0.80,
    "Fair": 0.60,
    "Poor": 0.30,
    "For Parts": 0.10
};

import { ValuationSafetyEngine } from "../safety/valuation_monitor";

export class ValuationEngine {

    /**
     * Calculates the estimated value of an item based on depreciation logic.
     */
    estimateValue(item: InventoryItem): ValuationResult {
        const purchasePrice = item.purchasePrice || item.marketValue || 0;
        const ageYears = this.calculateAge(item.purchaseDate);
        const category = item.category || "default";
        const subcategory = item.subcategory || "default";

        // 1. Determine Rate
        const rate = DEPRECIATION_RATES[subcategory] ?? DEPRECIATION_RATES[category] ?? DEPRECIATION_RATES["default"];

        // 2. Apply Depreciation: Value = Price * (1 - rate)^age
        // If rate is negative (appreciation), we use (1 + abs(rate))
        let factor = 1 - rate;
        if (rate < 0) factor = 1 + Math.abs(rate);

        let depreciatedValue = purchasePrice * Math.pow(factor, ageYears);

        // 3. Apply Condition Adjustment
        const conditionFactor = CONDITION_FACTORS[item.condition || "Good"] || 0.8;
        depreciatedValue *= conditionFactor;

        // Round to nearest dollar
        depreciatedValue = Math.round(depreciatedValue);

        // --- AI SAFETY CHECKS ---
        // 1. Bias/Fairness Check
        const fairness = ValuationSafetyEngine.checkFairness(depreciatedValue, { isCulturalArtifact: false, tags: [] });

        // 2. Drift Check (vs Historical Category Baseline)
        const drift = ValuationSafetyEngine.checkDrift(depreciatedValue, category);

        // 4. Generate Explanation (Enhanced with Safety Context)
        let explanation = this.generateExplanation(item, ageYears, item.condition || "Good");

        if (!fairness.isFair) {
            explanation += ` [SAFETY WARNING: ${fairness.reason}]`;
        }
        if (drift.hasDrift) {
            explanation += ` [DRIFT WARNING: Valuation deviates ${drift.deviationPercentage.toFixed(0)}% from category norms.]`;
        }

        return {
            estimatedValue: depreciatedValue,
            currency: "USD",
            confidence: drift.hasDrift ? 0.5 : 0.85, // Lower confidence if drift detected
            explanation,
            valuationDate: new Date().toISOString(),
            marketTrend: {
                direction: rate < 0 ? 'up' : 'down',
                percentage: Math.abs(rate * 100)
            }
        };
    }

    /**
     * Generates a human-readable explanation for the valuation.
     */
    private generateExplanation(item: InventoryItem, age: number, condition: string): string {
        const factors = [];
        if (item.purchasePrice) factors.push("original purchase price");
        if (age > 0) factors.push(`${age.toFixed(1)} years of age`);
        factors.push(`detected ${condition} condition`);

        return `This estimate is based on ${factors.join(", ")} and market trends for ${item.category || "similar items"}.`;
    }

    private calculateAge(dateString?: string): number {
        if (!dateString) return 0;
        const purchaseDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
        return diffTime / (1000 * 60 * 60 * 24 * 365);
    }

    /**
     * Checks for significant value changes and generates alerts.
     */
    checkValuationAlerts(item: InventoryItem, oldValuation: number, newValuation: number): ValuationAlert | null {
        const percentChange = ((newValuation - oldValuation) / oldValuation) * 100;

        // Threshold: 5% change
        if (Math.abs(percentChange) >= 5) {
            const direction = percentChange > 0 ? "increased" : "decreased";
            return {
                itemId: item.id || "unknown",
                itemName: item.name,
                oldValue: oldValuation,
                newValue: newValuation,
                percentChange,
                message: `Your ${item.name} ${direction} in value by ${Math.abs(percentChange).toFixed(1)}% this year.`
            };
        }
        return null;
    }

    /**
     * Batch processes items for revaluation.
     */
    bulkRevaluate(items: InventoryItem[]): { results: Map<string, ValuationResult>, alerts: ValuationAlert[] } {
        const results = new Map<string, ValuationResult>();
        const alerts: ValuationAlert[] = [];

        for (const item of items) {
            const oldVal = item.currentValue || item.purchasePrice || 0;
            const result = this.estimateValue(item);

            if (item.id) {
                results.set(item.id, result);

                if (oldVal > 0) {
                    const alert = this.checkValuationAlerts(item, oldVal, result.estimatedValue);
                    if (alert) alerts.push(alert);
                }
            }
        }

        return { results, alerts };
    }
}
