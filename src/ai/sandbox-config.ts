export const IS_SANDBOX = process.env.NEXT_PUBLIC_AI_SANDBOX === 'true';

export const SANDBOX_CONFIG = {
    enabled: IS_SANDBOX,
    latency: 0, // ms
    guaranteedOutputs: {
        'demo-item-1': {
            attributes: {
                brand: 'Rolex',
                model: 'Submariner',
                material: 'Stainless Steel',
                condition: 'Used - Like New',
            },
            description: 'A beautiful Rolex Submariner in excellent condition. Features a black dial and ceramic bezel.',
            valuation: {
                value: 12500,
                currency: 'USD',
                confidence: 0.95,
            },
            provenance: {
                history: ['Purchased 2020', 'Serviced 2023'],
                verified: true,
            },
        },
        'demo-item-2': {
            attributes: {
                brand: 'Herman Miller',
                model: 'Eames Lounge Chair',
                material: 'Leather & Rosewood',
                condition: 'Used - Good',
            },
            description: 'Classic Eames Lounge Chair and Ottoman. Leather shows some wear but overall in good condition.',
            valuation: {
                value: 4500,
                currency: 'USD',
                confidence: 0.88,
            },
            provenance: {
                history: ['Vintage 1970s model'],
                verified: false,
            },
        },
    },
};
