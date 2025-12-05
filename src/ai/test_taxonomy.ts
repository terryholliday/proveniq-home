import { MetadataNormalizer } from './metadata_normalizer';
import taxonomyData from './taxonomy.json';

async function testTaxonomy() {
    console.log('--- Testing Taxonomy Loading ---');
    if (taxonomyData.taxonomy.Electronics) {
        console.log('SUCCESS: Taxonomy loaded correctly.');
    } else {
        console.error('FAILURE: Taxonomy not loaded.');
    }

    const normalizer = new MetadataNormalizer();
    console.log('\n--- Testing Metadata Normalization ---');

    const testCases = [
        {
            input: { title: 'MacBook Pro 16', desc: 'Powerful laptop' },
            expected: { category: 'Electronics', subcategory: 'Computers', model: 'MacBook Pro 16-inch' }
        },
        {
            input: { title: 'Fender Strat', desc: 'Electric guitar in red' },
            expected: { category: 'Musical Instruments', subcategory: 'Guitars', model: 'Fender Stratocaster' }
        },
        {
            input: { title: 'Unknown Widget', desc: 'Something weird' },
            expected: { category: 'Unknown', subcategory: 'Unknown' }
        }
    ];

    for (const test of testCases) {
        const result = normalizer.normalize(test.input.title, test.input.desc);
        console.log(`Input: "${test.input.title}"`);
        console.log(`  -> Category: ${result.category} / ${result.subcategory}`);
        console.log(`  -> Model: ${result.model}`);

        if (result.category === test.expected.category &&
            result.subcategory === test.expected.subcategory &&
            (!test.expected.model || result.model === test.expected.model)) {
            console.log('  [PASS]');
        } else {
            console.error('  [FAIL]');
        }
    }
}

testTaxonomy();
