import { visionPipelineV2 } from './vision-pipeline-v2';

// Mock the ai instance from @/ai/genkit
jest.mock('@/ai/genkit', () => {
    return {
        ai: {
            definePrompt: jest.fn((config) => {
                // Return a mock function that simulates the prompt execution
                return jest.fn(async () => {
                    if (config.name === 'visionQualityPrompt') {
                        return { output: { isAcceptable: true, sharpness: 0.9, lighting: 0.8, issues: [] } };
                    }
                    if (config.name === 'visionCategoryPrompt') {
                        return { output: { category: 'front', confidence: 0.95 } };
                    }
                    if (config.name === 'visionSmartCropPrompt') {
                        return { output: { ymin: 0.1, xmin: 0.1, ymax: 0.9, xmax: 0.9 } };
                    }
                    if (config.name === 'visionAnalysisPrompt') {
                        return {
                            output: {
                                details: { brand: 'TestBrand', modelNumber: 'TB-123' },
                                condition: { overallScore: 90, defects: [], wearLevel: 'like-new' }
                            }
                        };
                    }
                    return { output: {} };
                });
            }),
            defineFlow: jest.fn((config, handler) => handler),
        },
    };
});

describe('visionPipelineV2', () => {
    it('should process images and return synthesized results', async () => {
        const input = {
            images: [
                { url: 'http://example.com/img1.jpg', id: 'img1' },
                { url: 'http://example.com/img2.jpg', id: 'img2' }
            ],
            itemContext: 'Test Item'
        };

        // Since we mocked defineFlow to return the handler, visionPipelineV2 is the handler function
        const handler = visionPipelineV2 as unknown as (payload: typeof input) => Promise<any>;
        const result = await handler(input);

        expect(result.quality).toHaveLength(2);
        expect(result.quality[0].sharpness).toBe(0.9);

        expect(result.categories).toHaveLength(2);
        expect(result.categories[0].category).toBe('front');

        expect(result.smartCrops).toHaveLength(2);

        expect(result.hashes).toHaveLength(2);
        expect(result.hashes[0].hash).toBeDefined();

        expect(result.details.brand).toBe('TestBrand');
        expect(result.condition.overallScore).toBe(90);
    });
});
