'use server';

/**
 * @fileOverview Generates sales ad copy for items based on target audience and a specified tone.
 *
 * - generateTonedSalesAd - A function that generates sales ad copy with a specific tone.
 * - GenerateTonedSalesAdInput - The input type for the generateTonedSalesAd function.
 * - GenerateTonedSalesAdOutput - The return type for the generateTonedSalesAd function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTonedSalesAdInputSchema = z.object({
  itemName: z.string().describe('The name of the item for sale.'),
  itemDescription: z.string().describe('Detailed description of the item for sale.'),
  targetAudience: z.string().describe('The target audience for the sales ad (e.g., collectors, casual buyers, etc.).'),
  tone: z.string().describe('The desired tone of the sales ad (e.g., humorous, formal, enthusiastic, witty, etc.).'),
});
export type GenerateTonedSalesAdInput = z.infer<typeof GenerateTonedSalesAdInputSchema>;

const GenerateTonedSalesAdOutputSchema = z.object({
  salesAdCopy: z.string().describe('The generated sales ad copy in the specified tone.'),
});
export type GenerateTonedSalesAdOutput = z.infer<typeof GenerateTonedSalesAdOutputSchema>;

export async function generateTonedSalesAd(input: GenerateTonedSalesAdInput): Promise<GenerateTonedSalesAdOutput> {
  return generateTonedSalesAdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTonedSalesAdPrompt',
  input: { schema: GenerateTonedSalesAdInputSchema },
  output: { schema: GenerateTonedSalesAdOutputSchema },
  prompt: `You are an expert marketing copywriter. Generate compelling sales ad copy for the following item.

SAFETY & COMPLIANCE RULES:
1. Do NOT make any legal claims or guarantees.
2. Do NOT make safety guarantees.
3. Do NOT generate misleading descriptions.

Item Name: {{{itemName}}}
Item Description: {{{itemDescription}}}
Target Audience: {{{targetAudience}}}

The ad copy should be written in a {{{tone}}} tone.

Generate the sales ad copy now:`,
});

const generateTonedSalesAdFlow = ai.defineFlow(
  {
    name: 'generateTonedSalesAdFlow',
    inputSchema: GenerateTonedSalesAdInputSchema,
    outputSchema: GenerateTonedSalesAdOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
