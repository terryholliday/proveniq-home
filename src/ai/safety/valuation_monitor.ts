
import { AuditService, AuditAction } from '@/lib/services/audit-service';

export type FairnessCheckResult = {
    isFair: boolean;
    biasDetected: boolean;
    reason?: string;
    demographicFactor?: string;
};

export type DriftCheckResult = {
    hasDrift: boolean;
    deviationPercentage: number;
    baseline: number;
    threshold: number;
};

// Mock historical baselines for demonstration
const CATEGORY_BASELINES: Record<string, number> = {
    'electronics': 500,
    'jewelry': 1200,
    'vehicles': 25000,
    'furniture': 300,
    'art': 5000
};

export class ValuationSafetyEngine {

    /**
     * Checks if a valuation seems significantly drifted from category norms.
     * Satisfies: "Set up basic drift monitoring"
     */
    static checkDrift(valuation: number, category: string): DriftCheckResult {
        const baseline = CATEGORY_BASELINES[category.toLowerCase()];

        if (!baseline) {
            return { hasDrift: false, deviationPercentage: 0, baseline: 0, threshold: 0 };
        }

        const diff = Math.abs(valuation - baseline);
        const deviation = (diff / baseline) * 100;
        const threshold = 50; // 50% deviation triggers alerts

        const result = {
            hasDrift: deviation > threshold,
            deviationPercentage: deviation,
            baseline,
            threshold
        };

        if (result.hasDrift) {
            // In a real scenario, we'd pass a real user/system actor
            AuditService.log({ uid: 'system:ai_safety' }, AuditAction.DRIFT_DETECTED, 'valuation', undefined, { category, valuation, ...result });
        }

        return result;
    }

    /**
     * Checks for potential bias in the valuation logic.
     * In a real system, this would analyze model inputs vs. protected attributes.
     * Satisfies: "Define and implement bias checks"
     */
    static checkFairness(valuation: number, itemMetadata: any, userProfile?: any): FairnessCheckResult {
        // Simulation: Flag if "cultural" items are receiving unusually low valuations compared to generic items
        // This is a heuristic simulation for Phase 3.

        const isSensitive = itemMetadata?.isCulturalArtifact || itemMetadata?.tags?.includes('religious');

        if (isSensitive && valuation < 100) {
            const result = {
                isFair: false,
                biasDetected: true,
                reason: 'Potentially undervalued cultural artifact requiring human review.',
                demographicFactor: 'Cultural Heritage'
            };

            AuditService.log({ uid: 'system:ai_safety' }, AuditAction.BIAS_FLAGGED, 'valuation', undefined, result);
            return result;
        }

        return { isFair: true, biasDetected: false };
    }
}
