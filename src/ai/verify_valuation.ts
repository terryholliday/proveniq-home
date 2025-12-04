
import { ValuationEngine, ValuationInput } from './valuation_engine';

async function runTraces() {
    const engine = new ValuationEngine();

    const scenarios: Record<string, ValuationInput> = {
        'Vintage Guitar': {
            category: 'Guitar',
            brand: 'Fender',
            model: 'Stratocaster',
            condition: 'Good',
            ageYears: 15,
            description: '1970s style Stratocaster with some wear and tear but plays great.',
            originalPrice: 1200
        },
        'Modern Laptop': {
            category: 'Electronics',
            brand: 'Apple',
            model: 'MacBook Pro',
            condition: 'Excellent',
            ageYears: 2,
            description: 'M1 MacBook Pro, barely used.',
            originalPrice: 2000
        },
        'Antique Chair': {
            category: 'Furniture',
            condition: 'Fair',
            ageYears: 50,
            description: 'Old wooden chair, needs reupholstering.',
            materials: ['Wood', 'Fabric']
        }
    };

    console.log('# Valuation Traces\n');

    for (const [name, input] of Object.entries(scenarios)) {
        console.log(`## Scenario: ${name}`);
        console.log('**Input:**');
        console.log('```json');
        console.log(JSON.stringify(input, null, 2));
        console.log('```');

        const result = await engine.evaluate(input);

        console.log('**Output:**');
        console.log('```json');
        console.log(JSON.stringify(result, null, 2));
        console.log('```');
        console.log('---\n');
    }
}

runTraces().catch(console.error);
