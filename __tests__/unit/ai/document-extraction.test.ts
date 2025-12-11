import { describe, it, expect, jest } from '@jest/globals';

// Mock Genkit flow execution
jest.mock('@/ai/genkit', () => ({
    ai: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        definePrompt: () => async (_input: unknown) => ({
            output: {
                documentType: 'receipt',
                purchaseDate: '2023-01-01',
                purchasePrice: 100,
                currency: 'USD',
                storeName: 'Test Store',
                summary: 'Receipt for Test Item',
            }
        }),
        defineFlow: (_config: unknown, handler: unknown) => handler,
    },
}));

// Import after mock - require is needed for Jest mocking to work
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
