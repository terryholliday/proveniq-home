/**
 * Collector Score - Gamification Engine
 * 
 * Calculates a score based on inventory value, provenance completeness,
 * Visual Truth verification rate, and documentation quality.
 */

import { InventoryItem } from '@/lib/types';

export interface CollectorScoreBreakdown {
    totalScore: number;
    inventoryValueScore: number;
    provenanceScore: number;
    visualTruthScore: number;
    documentationScore: number;
    rank: CollectorRank;
    nextRankThreshold: number;
    percentile?: number;
}

export type CollectorRank =
    | 'Novice Collector'
    | 'Rising Collector'
    | 'Established Collector'
    | 'Master Collector'
    | 'Elite Collector'
    | 'Legendary Collector';

const RANK_THRESHOLDS: { rank: CollectorRank; minScore: number }[] = [
    { rank: 'Legendary Collector', minScore: 950 },
    { rank: 'Elite Collector', minScore: 800 },
    { rank: 'Master Collector', minScore: 600 },
    { rank: 'Established Collector', minScore: 400 },
    { rank: 'Rising Collector', minScore: 200 },
    { rank: 'Novice Collector', minScore: 0 },
];

/**
 * Calculate Collector Score for a user's inventory
 */
export function calculateCollectorScore(
    items: InventoryItem[],
    options?: {
        totalValueCap?: number; // Max value for scoring (default: 1M)
    }
): CollectorScoreBreakdown {
    const { totalValueCap = 1_000_000 } = options || {};

    if (items.length === 0) {
        return {
            totalScore: 0,
            inventoryValueScore: 0,
            provenanceScore: 0,
            visualTruthScore: 0,
            documentationScore: 0,
            rank: 'Novice Collector',
            nextRankThreshold: 200,
        };
    }

    // 1. Inventory Value Score (0-250 points)
    // Based on total value with diminishing returns
    const totalValue = items.reduce((sum, item) => {
        const value = item.currentValue || item.marketValue || item.purchasePrice || 0;
        return sum + value;
    }, 0);
    const normalizedValue = Math.min(totalValue / totalValueCap, 1);
    const inventoryValueScore = Math.round(Math.sqrt(normalizedValue) * 250);

    // 2. Provenance Score (0-300 points)
    // Based on provenance event count and verification rate
    const itemsWithProvenance = items.filter(
        (item) => item.provenance && item.provenance.length > 0
    );
    const provenanceCoverage = itemsWithProvenance.length / items.length;

    const verifiedEvents = items.reduce((count, item) => {
        if (!item.provenance) return count;
        return count + item.provenance.filter((e) => e.verified).length;
    }, 0);
    const totalEvents = items.reduce((count, item) => {
        return count + (item.provenance?.length || 0);
    }, 0);
    const verificationRate = totalEvents > 0 ? verifiedEvents / totalEvents : 0;

    const provenanceScore = Math.round(
        provenanceCoverage * 150 + verificationRate * 150
    );

    // 3. Visual Truth Score (0-250 points)
    // Based on image verification status
    const verifiedItems = items.filter((item) => item.visualTruthVerified === true);
    const itemsWithHashes = items.filter(
        (item) => item.imageHashes && item.imageHashes.length > 0
    );
    const visualTruthRate = items.length > 0 ? verifiedItems.length / items.length : 0;
    const hashCoverage = items.length > 0 ? itemsWithHashes.length / items.length : 0;

    const visualTruthScore = Math.round(
        visualTruthRate * 200 + hashCoverage * 50
    );

    // 4. Documentation Score (0-200 points)
    // Based on receipts, documents, and image quality
    const itemsWithReceipts = items.filter((item) => item.receiptUrl);
    const itemsWithDocs = items.filter(
        (item) => item.documents && item.documents.length > 0
    );
    const itemsWithMultipleImages = items.filter(
        (item) => item.additionalImages && item.additionalImages.length >= 2
    );

    const receiptRate = itemsWithReceipts.length / items.length;
    const docRate = itemsWithDocs.length / items.length;
    const imageRate = itemsWithMultipleImages.length / items.length;

    const documentationScore = Math.round(
        receiptRate * 80 + docRate * 60 + imageRate * 60
    );

    // Total Score (0-1000)
    const totalScore =
        inventoryValueScore +
        provenanceScore +
        visualTruthScore +
        documentationScore;

    // Determine Rank
    const rankEntry = RANK_THRESHOLDS.find((r) => totalScore >= r.minScore) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
    const nextRankEntry = RANK_THRESHOLDS.find(
        (r) => r.minScore > totalScore
    );
    const nextRankThreshold = nextRankEntry?.minScore || 1000;

    return {
        totalScore,
        inventoryValueScore,
        provenanceScore,
        visualTruthScore,
        documentationScore,
        rank: rankEntry.rank,
        nextRankThreshold,
    };
}

/**
 * Get score improvement suggestions
 */
export function getScoreImprovementTips(
    breakdown: CollectorScoreBreakdown
): string[] {
    const tips: string[] = [];

    if (breakdown.inventoryValueScore < 150) {
        tips.push('Add more items to your inventory to increase your value score');
    }

    if (breakdown.provenanceScore < 200) {
        tips.push('Add provenance events to your items and verify them with documentation');
    }

    if (breakdown.visualTruthScore < 150) {
        tips.push('Enable Visual Truth verification on your items to prove authenticity');
    }

    if (breakdown.documentationScore < 120) {
        tips.push('Upload receipts and additional photos for your items');
    }

    const pointsToNextRank = breakdown.nextRankThreshold - breakdown.totalScore;
    if (pointsToNextRank > 0 && pointsToNextRank <= 100) {
        tips.push(`You're only ${pointsToNextRank} points away from the next rank!`);
    }

    return tips;
}

/**
 * Format score for display
 */
export function formatCollectorScore(score: number): string {
    return score.toLocaleString();
}

export default calculateCollectorScore;
