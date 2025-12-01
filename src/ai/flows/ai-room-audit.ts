'use server';

/**
 * @fileOverview This file defines the AI Room Audit flow, which compares items detected in a room image against the user's inventory.
 *
 * @exports {
 *   aiRoomAudit,
 *   AiRoomAuditInput,
 *   AiRoomAuditOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiRoomAuditInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  inventory: z.string().describe('The user\'s inventory data in JSON format.'),
});
export type AiRoomAuditInput = z.infer<typeof AiRoomAuditInputSchema>;

const AiRoomAuditOutputSchema = z.object({
  missingItems: z.array(z.string()).describe('Items in the inventory that are not detected in the room.'),
  misplacedItems: z
    .array(z.string())
    .describe('Items detected in the room that are not in the room\'s designated location according to the inventory.'),
  unexpectedItems: z.array(z.string()).describe('Items detected in the room that are not in the inventory.'),
});
export type AiRoomAuditOutput = z.infer<typeof AiRoomAuditOutputSchema>;

export async function aiRoomAudit(input: AiRoomAuditInput): Promise<AiRoomAuditOutput> {
  return aiRoomAuditFlow(input);
}

const aiRoomAuditPrompt = ai.definePrompt({
  name: 'aiRoomAuditPrompt',
  input: {schema: AiRoomAuditInputSchema},
  output: {schema: AiRoomAuditOutputSchema},
  prompt: `You are an AI assistant that helps users audit a room against their inventory.

  Analyze the image provided by the user and compare the visible items against their inventory data (provided in JSON format).

  Identify the following:
  - Missing items: Items present in the inventory but not visible in the image.
  - Misplaced items: Items visible in the image but located in a different room than specified in the inventory.
  - Unexpected items: Items visible in the image but not present in the inventory.

  Inventory:
  {{inventory}}

  Room Image:
  {{media url=photoDataUri}}

  Return the results in JSON format.
  `,
});

const aiRoomAuditFlow = ai.defineFlow(
  {
    name: 'aiRoomAuditFlow',
    inputSchema: AiRoomAuditInputSchema,
    outputSchema: AiRoomAuditOutputSchema,
  },
  async input => {
    try {
      // Attempt to parse the inventory. If this fails, the prompt won't be called.
      JSON.parse(input.inventory);
    } catch (e) {
      throw new Error('Invalid inventory JSON: ' + (e as any).message);
    }
    const {output} = await aiRoomAuditPrompt(input);
    return output!;
  }
);
