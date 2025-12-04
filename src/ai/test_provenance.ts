import { ProvenanceEngine } from './provenance_engine';
import { InventoryItem } from '@/lib/types';

const mockItem: InventoryItem = {
    id: 'item-123',
    userId: 'user-1',
    name: 'Vintage Rolex Submariner',
    category: 'Jewelry',
    description: '1985 Rolex Submariner, good condition.',
    quantity: 1,
    purchaseDate: '2010-05-15',
    purchasePrice: 5000,
    receiptUrl: 'https://example.com/receipt.pdf',
    provenance: [
        {
            id: 'evt-1',
            date: '2015-08-20',
            type: 'repair',
            description: 'Serviced at authorized dealer',
            verified: true
        },
        {
            id: 'evt-2',
            date: '2023-01-10',
            type: 'appraisal',
            description: 'Appraised for insurance',
            verified: true
        }
    ]
};

const engine = new ProvenanceEngine();
const summary = engine.analyze(mockItem);

console.log('--- Provenance Analysis ---');
console.log(`Item: ${mockItem.name}`);
console.log(`Confidence Score: ${summary.confidenceScore}/100`);
console.log(`Narrative: ${summary.narrative}`);
console.log(`Gap Detected: ${summary.gapDetected}`);
console.log('\nTimeline:');
summary.timeline.forEach(t => {
    console.log(`- [${t.date}] ${t.title} (${t.type}) ${t.gap ? '[GAP]' : ''}`);
    if (t.gap) console.log(`  Duration: ${t.gapDurationYears?.toFixed(1)} years`);
});

// Test Gap Detection
console.log('\n--- Gap Detection Test ---');
// Gap between 2015 and 2023 is ~7.4 years. Should be detected.
if (summary.gapDetected) {
    console.log('SUCCESS: Gap detected correctly.');
} else {
    console.error('FAILURE: Gap NOT detected.');
}

// Test Score
if (summary.confidenceScore > 50) {
    console.log('SUCCESS: Confidence score seems reasonable.');
} else {
    console.warn('WARNING: Confidence score is low.');
}
