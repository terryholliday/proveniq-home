import { ValuationInput, ValuationResult } from '../valuation_engine';

export interface BiasCheckResult {
    passed: boolean;
    issues: string[];
    metrics: {
        categoryDisparity: number; // 0-1, lower is better
        driftScore: number; // 0-1, lower is better
    };
}

export interface DriftConfig {
    baselineAvgValue: number;
    allowedVariance: number; // Percentage, e.g., 0.2 for 20%
}

export class BiasMonitor {
    private sensitiveCategories = ['religious', 'political', 'cultural'];
    private driftConfig: Record<string, DriftConfig> = {
        'default': { baselineAvgValue: 100, allowedVariance: 0.5 },
        'guitar': { baselineAvgValue: 800, allowedVariance: 0.3 },
        'electronics': { baselineAvgValue: 300, allowedVariance: 0.4 }
    };

    /**
     * Checks for potential bias or safety issues in the valuation process.
     */
    async checkValuationSafety(
        input: ValuationInput,
        result: ValuationResult
    ): Promise<BiasCheckResult> {
        const issues: string[] = [];
        const categoryDisparity = 0;

        // 1. Sensitivity Check (Basic Keyword Matching for minimal safety)
        if (input.description) {
            const descLower = input.description.toLowerCase();
            for (const sensitive of this.sensitiveCategories) {
                if (descLower.includes(sensitive)) {
                    issues.push(`Valuation input contains sensitive term: ${sensitive}. Requires manual review.`);
                }
            }
        }

        // 2. Drift / Anomaly Check
        const category = input.category.toLowerCase();
        const config = this.driftConfig[category] || this.driftConfig['default'];

        // Calculate deviation from baseline
        const estimatedMidpoint = (result.estimatedValue.min + result.estimatedValue.max) / 2;
        const deviation = Math.abs(estimatedMidpoint - config.baselineAvgValue) / config.baselineAvgValue;

        if (deviation > config.allowedVariance) {
            issues.push(`Valuation deviation ${Math.round(deviation * 100)}% exceeds allowed variance for category '${category}'.`);
        }

        // 3. Confidence Integrity Check
        if (result.confidenceScore < 20) {
            issues.push('Confidence score extremely low. Result may be unreliable.');
        }

        return {
            passed: issues.length === 0,
            issues,
            metrics: {
                categoryDisparity, // Placeholder for actual disparity math
                driftScore: deviation
            }
        };
    }

    /**
     * Updates the historical baseline for drift monitoring.
     * In a real system, this would aggregate recent logs.
     */
    updateBaseline(category: string, newValue: number) {
        const key = category.toLowerCase();
        if (!this.driftConfig[key]) {
            this.driftConfig[key] = { baselineAvgValue: newValue, allowedVariance: 0.3 };
        } else {
            // Simple moving average for demo purposes
            const current = this.driftConfig[key];
            current.baselineAvgValue = (current.baselineAvgValue * 0.9) + (newValue * 0.1);
        }
    }
}
