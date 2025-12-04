import { InventoryItem, ProvenanceEvent, ProvenanceEventType } from '@/lib/types';

export interface ProvenanceTimelineItem {
    date: string;
    title: string;
    description: string;
    type: ProvenanceEventType;
    verified: boolean;
    gap?: boolean; // If this item represents a detected gap
    gapDurationYears?: number;
}

export interface ProvenanceSummary {
    timeline: ProvenanceTimelineItem[];
    confidenceScore: number;
    gapDetected: boolean;
    narrative: string;
}

export class ProvenanceEngine {

    generateTimeline(item: InventoryItem): ProvenanceTimelineItem[] {
        const events: ProvenanceEvent[] = item.provenance || [];

        // 1. Convert explicit events to timeline items
        let timeline: ProvenanceTimelineItem[] = events.map(e => ({
            date: e.date,
            title: this.formatTitle(e.type),
            description: e.description,
            type: e.type,
            verified: e.verified
        }));

        // 2. Infer events from other item fields if missing
        if (item.purchaseDate && !events.some(e => e.type === 'acquisition')) {
            timeline.push({
                date: item.purchaseDate,
                title: 'Acquired',
                description: `Purchased for ${item.purchasePrice ? '$' + item.purchasePrice : 'unknown amount'}`,
                type: 'acquisition',
                verified: !!item.receiptUrl
            });
        }

        // Sort by date descending (newest first)
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return timeline;
    }

    detectGaps(timeline: ProvenanceTimelineItem[]): ProvenanceTimelineItem[] {
        const GAP_THRESHOLD_YEARS = 5;
        const enrichedTimeline = [...timeline];

        // Sort ascending for gap check
        const sorted = [...timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < sorted.length - 1; i++) {
            const current = new Date(sorted[i].date);
            const next = new Date(sorted[i + 1].date);
            const diffYears = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24 * 365);

            if (diffYears > GAP_THRESHOLD_YEARS) {
                // Insert gap marker in the original timeline (which is descending)
                // We need to find where to insert it in the descending list
                // It goes between next (newer) and current (older)
                enrichedTimeline.push({
                    date: sorted[i].date, // Anchor to older date for sorting, but display as range
                    title: 'Provenance Gap',
                    description: `No recorded history for ${diffYears.toFixed(1)} years.`,
                    type: 'other',
                    verified: false,
                    gap: true,
                    gapDurationYears: diffYears
                });
            }
        }

        // Re-sort descending
        enrichedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return enrichedTimeline;
    }

    calculateConfidence(item: InventoryItem, timeline: ProvenanceTimelineItem[]): number {
        let score = 50; // Base score

        // 1. Verification Bonus
        const verifiedCount = timeline.filter(t => t.verified).length;
        score += verifiedCount * 10;

        // 2. Gap Penalty
        const gaps = timeline.filter(t => t.gap).length;
        score -= gaps * 15;

        // 3. Origin Bonus
        const hasOrigin = timeline.some(t => t.type === 'acquisition');
        if (hasOrigin) score += 10;

        // 4. Documentation Bonus
        if (item.receiptUrl) score += 10;
        if (item.documents && item.documents.length > 0) score += 5 * item.documents.length;

        return Math.max(0, Math.min(100, score));
    }

    generateNarrative(item: InventoryItem, timeline: ProvenanceTimelineItem[]): string {
        if (timeline.length === 0) {
            return `No provenance history recorded for ${item.name}.`;
        }

        const newest = timeline.find(t => !t.gap);
        const oldest = timeline[timeline.length - 1]; // Last one since sorted descending
        const verifiedCount = timeline.filter(t => t.verified).length;

        let text = `${item.name} has ${timeline.length} recorded events`;
        if (oldest && !oldest.gap) {
            text += `, dating back to ${new Date(oldest.date).getFullYear()}`;
        }
        text += `. ${verifiedCount} events are verified with documentation.`;

        if (timeline.some(t => t.gap)) {
            text += ` Attention: There are gaps in the ownership history that may require investigation.`;
        }

        return text;
    }

    analyze(item: InventoryItem): ProvenanceSummary {
        let timeline = this.generateTimeline(item);
        timeline = this.detectGaps(timeline);
        const confidenceScore = this.calculateConfidence(item, timeline);
        const narrative = this.generateNarrative(item, timeline);

        return {
            timeline,
            confidenceScore,
            gapDetected: timeline.some(t => t.gap),
            narrative
        };
    }

    private formatTitle(type: ProvenanceEventType): string {
        switch (type) {
            case 'acquisition': return 'Acquired';
            case 'ownership_change': return 'Ownership Change';
            case 'market_valuation': return 'Valuation';
            default: return type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
}
