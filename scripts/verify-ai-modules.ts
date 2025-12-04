import { MetadataNormalizer } from '../src/ai/flows/metadata-normalization';
import { ValuationEngine } from '../src/ai/flows/valuation-engine';
import { InventoryItem } from '../src/lib/types';

// Mock InventoryItem for testing
const mockItems: InventoryItem[] = [
    {
        id: "item-1",
        name: "Fender Strat",
        description: "A nice electric guitar from 2018.",
        category: "Musical Instruments",
        subcategory: "Guitars",
        purchasePrice: 1200,
        purchaseDate: "2018-05-20",
        condition: "Good",
        location: "Studio",
        userId: "user-1",
        quantity: 1

    },
    {
        id: "item-2",
        name: "MacBook Pro 16",
        description: "Used laptop for work.",
        category: "Electronics",
        subcategory: "Computers",
        purchasePrice: 2500,
        purchaseDate: "2021-01-15",
        condition: "Like New",
        location: "Office",
        userId: "user-1",
        quantity: 1

    },
    {
        id: "item-3",
        name: "Vintage Comic Collection",
        description: "Box of old comics.",
        category: "Collectibles",
        subcategory: "Comics",
        purchasePrice: 500,
        purchaseDate: "2010-01-01",
        condition: "Fair",
        location: "Attic",
        userId: "user-1",
        quantity: 1

    }
];

async function runVerification() {
    console.log("Starting Verification of AI Modules...\n");

    // 1. Test Metadata Normalization
    console.log("--- Metadata Normalization Traces ---");
    const normalizer = new MetadataNormalizer();

    for (const item of mockItems) {
        console.log(`\nProcessing: "${item.name}"`);
        const normalized = normalizer.normalizeItem(item.name, item.description || "");

        console.log(`  -> Detected Category: ${normalized.category.value} (${normalized.category.confidence})`);
        console.log(`  -> Detected Subcategory: ${normalized.subcategory.value} (${normalized.subcategory.confidence})`);

        if (normalized.variantMapping) {
            console.log(`  -> Variant Mapping: "${normalized.variantMapping.original}" -> "${normalized.variantMapping.canonical}"`);
        }

        if (normalized.attributes['Model']) {
            console.log(`  -> Canonical Model: ${normalized.attributes['Model'].value}`);
        }
    }

    // 2. Test Valuation Engine
    console.log("\n\n--- Valuation Engine Traces ---");
    const valuationEngine = new ValuationEngine();

    for (const item of mockItems) {
        console.log(`\nValuating: "${item.name}"`);
        const result = valuationEngine.estimateValue(item);

        console.log(`  -> Original Price: $${item.purchasePrice}`);
        console.log(`  -> Estimated Value: $${result.estimatedValue}`);
        console.log(`  -> Explanation: ${result.explanation}`);
        console.log(`  -> Market Trend: ${result.marketTrend?.direction} (${result.marketTrend?.percentage.toFixed(1)}%)`);
    }

    // 3. Test Bulk Revaluation & Alerts
    console.log("\n\n--- Bulk Revaluation & Alerts ---");
    // Simulate a year passing and price drop for item-2
    const oldValuation = 2000; // Hypothetical previous value for MacBook
    const currentValuation = valuationEngine.estimateValue(mockItems[1]).estimatedValue;

    const alert = valuationEngine.checkValuationAlerts(mockItems[1], oldValuation, currentValuation);
    if (alert) {
        console.log(`[ALERT TRIGGERED] ${alert.message}`);
        console.log(`  Old: $${alert.oldValue}, New: $${alert.newValue}, Change: ${alert.percentChange.toFixed(1)}%`);
    } else {
        console.log("No significant change detected.");
    }
}

runVerification().catch(console.error);
