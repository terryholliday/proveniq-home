'use server';
/**
 * @fileOverview Generates auction titles, descriptions, and starting bids for private auctions.
 *
 * - generateAuctionDetails - A function that generates auction details.
 * - GenerateAuctionDetailsInput - The input type for the generateAuctionDetails function.
 * - GenerateAuctionDetailsOutput - The return type for the generateAuctionDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAuctionDetailsInputSchema = z.object({
  itemDescription: z.string().describe('A detailed description of the item being auctioned.'),
  targetAudience: z.string().describe('The target audience for the auction (e.g., collectors, enthusiasts, general public).'),
  desiredTone: z.string().describe('The desired tone for the auction listing (e.g., professional, humorous, enthusiastic).'),
});
export type GenerateAuctionDetailsInput = z.infer<typeof GenerateAuctionDetailsInputSchema>;

const GenerateAuctionDetailsOutputSchema = z.object({
  auctionTitle: z.string().describe('A compelling title for the auction.'),
  auctionDescription: z.string().describe('An engaging description of the item for the auction listing.'),
  startingBid: z.number().describe('A suggested starting bid price for the item in USD.'),
});
export type GenerateAuctionDetailsOutput = z.infer<typeof GenerateAuctionDetailsOutputSchema>;

export async function generateAuctionDetails(input: GenerateAuctionDetailsInput): Promise<GenerateAuctionDetailsOutput> {
  return generateAuctionDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAuctionDetailsPrompt',
  input: { schema: GenerateAuctionDetailsInputSchema },
  output: { schema: GenerateAuctionDetailsOutputSchema },
  prompt: `You are an expert auction listing creator. Given the item description, target audience, and desired tone, generate a compelling auction title, an engaging auction description, and a reasonable starting bid price (in USD).

SAFETY & COMPLIANCE RULES:
1. Do NOT make any legal claims or guarantees (e.g., "This item is legal to own in all 50 states").
2. Do NOT make safety guarantees (e.g., "This car is perfectly safe").
3. Include a standard disclaimer if the item seems hazardous or regulated.
4. Do NOT generate misleading descriptions.

Item Description: {{{itemDescription}}}
Target Audience: {{{targetAudience}}}
Desired Tone: {{{desiredTone}}}

Ensure the title is concise and attention-grabbing. The description should highlight the item's key features and benefits to potential bidders. The starting bid should be appropriate for the item's value and the target audience.
`,
});

const generateAuctionDetailsFlow = ai.defineFlow(
  {
    name: 'generateAuctionDetailsFlow',
    inputSchema: GenerateAuctionDetailsInputSchema,
    outputSchema: GenerateAuctionDetailsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
