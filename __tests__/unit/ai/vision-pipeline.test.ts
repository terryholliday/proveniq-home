import { describe, it, expect, jest } from '@jest/globals';

// Mock Genkit flow execution
jest.mock('@/ai/genkit', () => ({
    ai: {
        definePrompt: () => async (input: { url?: string }) => {
            // Mock different prompts based on input or just return a generic structure that satisfies the flow
            if (input.url) {
                // Quality, Category, or SmartCrop prompt
                return {
                    output: {
                        sharpness: 0.9,
                        lighting: 0.9,
                        issues: [],
                        isAcceptable: true,
                        category: 'front',
                        confidence: 0.95,
                        ymin: 0.1, xmin: 0.1, ymax: 0.9, xmax: 0.9
                    }
                };
            }
            // Analysis prompt
            return {
                output: {
                    details: {
                        brand: 'BrandX',
                        modelNumber: 'BX-100',
                        material: 'Plastic',
                        dimensions: { width: '10', height: '20', depth: '5', unit: 'cm' },
                    },
                    condition: {
                        overallScore: 95,
                        defects: [],
                        wearLevel: 'new',
                    }
                }
            };
        },
        defineFlow: (_config: unknown, handler: unknown) => handler,
    },
}));

// Import after mock - require is needed for Jest mocking to work
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { visionPipelineV2 } = require('@/ai/flows/vision-pipeline-v2');

// Mock global fetch for image hashing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
global.fetch = jest.fn((_url: string) =>
    Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    } as Response)
);

describe('Vision Pipeline V2', () => {
    it('should analyze images and return structured data', async () => {
        const input = {
            images: [
                { url: 'data:image/jpeg;base64,mockdata1', id: 'img1' },
                { url: 'data:image/jpeg;base64,mockdata2', id: 'img2' }
            ],
            itemContext: 'Test Item',
        };

        const result = await visionPipelineV2(input);

        expect(result).toBeDefined();
        expect(result.condition.wearLevel).toBe('like-new');
        expect(result.details.brand).toBe('TestBrand');
        expect(result.quality).toHaveLength(2);
    });
});
