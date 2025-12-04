import { describe, it, expect, jest } from '@jest/globals';

// Mock Genkit flow execution
jest.mock('@/ai/genkit', () => ({
    ai: {
        definePrompt: () => async (input: any) => ({
            output: {
                documentType: 'receipt',
                purchaseDate: '2023-01-01',
                purchasePrice: 100,
                currency: 'USD',
                storeName: 'Test Store',
                summary: 'Receipt for Test Item',
            }
        }),
        defineFlow: (config: any, handler: any) => handler,
    },
}));

// Import after mock
const { documentExtraction } = require('@/ai/flows/document-extraction');

describe('Document Extraction', () => {
    it('should extract data from receipt', async () => {
        const input = {
            documentUrl: 'data:image/jpeg;base64,mockdoc',
            documentType: 'receipt' as const,
        };

        const result = await documentExtraction(input);

        expect(result).toBeDefined();
        expect(result.documentType).toBe('receipt');
        expect(result.purchasePrice).toBe(100);
        expect(result.storeName).toBe('Test Store');
    });
});
