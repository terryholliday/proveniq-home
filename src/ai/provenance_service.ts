import { ProvenanceEngine, ProvenanceSummary } from './provenance_engine';
import { InventoryItem } from '@/lib/types';
import { adminDb } from '@/lib/firebase-admin';
import { ProvenanceLog, VisualTruthVerification } from '@/lib/types/proveniq-ledger';

export class ProvenanceService {
    private engine: ProvenanceEngine;

    constructor() {
        this.engine = new ProvenanceEngine();
    }

    async analyzeAndLog(item: InventoryItem, visualTruth?: VisualTruthVerification[]): Promise<ProvenanceSummary> {
        const summary = this.engine.analyze(item);

        // [TrueLedger] Log to Firestore
        if (summary.merkleRoot && item.id) {
            try {
                // Reconstruct event strings for logging
                const eventStrings = summary.timeline.map(t => `${t.date}:${t.type}:${t.title}:${t.description}`);

                const logEntry: ProvenanceLog = {
                    itemId: item.id,
                    merkleRoot: summary.merkleRoot,
                    events: eventStrings,
                    timestamp: new Date(),
                    eventCount: summary.timeline.length,
                    visualTruth: visualTruth
                };

                await adminDb.collection('provenance_logs').add(logEntry);
            } catch (error) {
                console.error('Failed to log provenance to Proveniq Ledger:', error);
                // Non-blocking error
            }
        }

        return summary;
    }
}

export const provenanceService = new ProvenanceService();
