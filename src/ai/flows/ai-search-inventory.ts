'use server';

/**
 * @fileOverview An AI-powered search for the user's inventory.
 *
 * - aiSearchInventory - A function that handles the AI-powered search process.
 * - AiSearchInventoryInput - The input type for the aiSearchInventory function.
 * - AiSearchInventoryOutput - The return type for the aiSearchInventory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiSearchInventoryInputSchema = z.object({
  query: z.string().describe('The natural language search query.'),
  inventoryData: z.string().describe('The user inventory data as a stringified JSON array of objects.'),
});
export type AiSearchInventoryInput = z.infer<typeof AiSearchInventoryInputSchema>;

const AiSearchInventoryOutputSchema = z.array(z.record(z.any())).describe('The filtered list of inventory items matching the query.');
export type AiSearchInventoryOutput = z.infer<typeof AiSearchInventoryOutputSchema>;

export async function aiSearchInventory(input: AiSearchInventoryInput): Promise<AiSearchInventoryOutput> {
  return aiSearchInventoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSearchInventoryPrompt',
  input: { schema: AiSearchInventoryInputSchema },
  output: { schema: AiSearchInventoryOutputSchema },
  prompt: `You are an AI assistant designed to search through a user's inventory data based on their natural language query.  The inventory data is in JSON format.  You must return a JSON array of objects representing the matching inventory items.  The returned array should only include items that closely match the intent of the user's query.

SAFETY & COMPLIANCE RULES:
1. DO NOT provide legal advice, medical advice, or financial planning advice.
2. If the user asks a question that requires professional licensure (e.g., "Is my will valid?", "How do I avoid probate?"), ignore the question and strictly search for items matching the keywords.
3. If no items match, return an empty array. Do not hallucinate items.
4. Do not infer or generate legal documents.

User Query: {{{query}}}

Inventory Data: {{{inventoryData}}}


Return the filtered inventory items in a JSON array:
`,
});

const aiSearchInventoryFlow = ai.defineFlow(
  {
    name: 'aiSearchInventoryFlow',
    inputSchema: AiSearchInventoryInputSchema,
    outputSchema: AiSearchInventoryOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);

      if (!output) {
        console.warn('No output from prompt, returning empty array.');
        return [];
      }

      try {
        // Attempt to parse the output as JSON. If it fails, return an empty array to avoid crashing the app.
        const asString = typeof output === 'string' ? output : JSON.stringify(output);
        return JSON.parse(asString);
      } catch (error) {
        console.error('Failed to parse LLM output as JSON:', error);
        return []; // Return an empty array in case of parsing failure
      }

    } catch (e) {
      console.error('Error during AI search:', e);
      return [];
    }
  }
);
