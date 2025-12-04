import { orchestrator } from './orchestrator';

const REAL_WORLD_ITEMS = [
    { id: 'item-1', image: 'image-url-1' },
    { id: 'item-2', image: 'image-url-2' },
    { id: 'demo-item-1', image: 'demo-image-url-1' }, // Should hit sandbox
    // Add more items...
];

async function runStressTest() {
    console.log('Starting AI Pipeline Stress Test...');

    const results = {
        success: 0,
        failure: 0,
        fallback: 0,
    };

    for (const item of REAL_WORLD_ITEMS) {
        console.log(`Processing item: ${item.id}`);
        try {
            const result = await orchestrator.executeChain(item.id, item.image);
            console.log(`Success for ${item.id}:`, result);
            results.success++;
        } catch (error: any) {
            console.error(`Failed for ${item.id}:`, error.message);
            if (error.message.includes('AI Service Unavailable')) {
                results.fallback++;
            } else {
                results.failure++;
            }
        }
    }

    console.log('Stress Test Complete.');
    console.log('Results:', results);
}

// Uncomment to run directly if needed, or call from a separate runner
runStressTest();

export { runStressTest };
