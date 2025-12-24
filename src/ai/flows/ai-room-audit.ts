'use server';

/**
 * @fileOverview This file defines the AI Room Audit flow, which compares items detected in a room image against the user's inventory.
 * 
 * Supports two modes:
 * - Owner mode: All detected items are personal property
 * - Renter mode: Unexpected items are classified as likely personal or landlord fixtures
 *
 * @exports {
 *   aiRoomAudit,
 *   aiRoomAuditRenterMode,
 *   AiRoomAuditInput,
 *   AiRoomAuditOutput,
 *   AiRoomAuditRenterInput,
 *   AiRoomAuditRenterOutput,
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

// --- RENTER MODE SCHEMAS ---

const AiRoomAuditRenterInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the room, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
  inventory: z.string().describe('The user\'s personal inventory data in JSON format.'),
  landlordFixtures: z.string().optional().describe('Known landlord fixtures from Properties sync (JSON format).'),
  roomType: z.string().optional().describe('Type of room being scanned (kitchen, bedroom, bathroom, etc.)'),
});
export type AiRoomAuditRenterInput = z.infer<typeof AiRoomAuditRenterInputSchema>;

const UnexpectedItemClassificationSchema = z.object({
  name: z.string().describe('Name of the detected item'),
  likelyOwnership: z.enum(['personal', 'landlord_fixture']).describe('Whether the item is likely personal property or a landlord fixture'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the classification'),
  reasoning: z.string().describe('Brief explanation for the classification'),
});

const AiRoomAuditRenterOutputSchema = z.object({
  missingItems: z.array(z.string()).describe('Personal items in inventory not detected in the room.'),
  misplacedItems: z.array(z.string()).describe('Personal items detected but in wrong location.'),
  confirmedPersonalItems: z.array(z.string()).describe('Items matched to user inventory.'),
  confirmedLandlordFixtures: z.array(z.string()).describe('Items matched to known landlord fixtures.'),
  unexpectedItems: z.array(UnexpectedItemClassificationSchema).describe('Items not in inventory, classified by likely ownership.'),
});
export type AiRoomAuditRenterOutput = z.infer<typeof AiRoomAuditRenterOutputSchema>;

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
      const message = e instanceof Error ? e.message : 'unknown error';
      throw new Error('Invalid inventory JSON: ' + message);
    }
    const {output} = await aiRoomAuditPrompt(input);
    return output!;
  }
);

// --- RENTER MODE FLOW ---

export async function aiRoomAuditRenterMode(input: AiRoomAuditRenterInput): Promise<AiRoomAuditRenterOutput> {
  return aiRoomAuditRenterFlow(input);
}

const aiRoomAuditRenterPrompt = ai.definePrompt({
  name: 'aiRoomAuditRenterPrompt',
  input: {schema: AiRoomAuditRenterInputSchema},
  output: {schema: AiRoomAuditRenterOutputSchema},
  prompt: `You are an AI assistant helping a RENTER audit their rental unit. Your task is to identify items in the room and classify them by ownership.

CONTEXT:
- The user RENTS their home (does not own it)
- Some items belong to the user (personal property)
- Some items belong to the landlord (fixtures that stay with the unit)

CLASSIFICATION RULES for unexpected items:
Items likely to be LANDLORD FIXTURES (high confidence):
- Built-in appliances (refrigerator, stove, oven, dishwasher, microwave if built-in)
- HVAC systems, water heater, furnace
- Light fixtures (ceiling lights, chandeliers)
- Window treatments if matching throughout
- Built-in shelving, cabinets
- Smoke detectors, carbon monoxide detectors
- Garbage disposal
- Ceiling fans

Items likely to be PERSONAL PROPERTY (high confidence):
- Electronics (TV, gaming consoles, computers)
- Furniture (sofas, beds, tables, chairs) - unless unit is furnished
- Decorations, art, photos
- Kitchen items (pots, pans, dishes, small appliances)
- Clothing, shoes
- Books, games, toys
- Personal care items

Items that NEED USER CONFIRMATION (medium/low confidence):
- Washer/dryer (could be either)
- Window AC units
- Rugs (could be either)
- Curtains/blinds
- Furniture in furnished units

Room being scanned: {{roomType}}

User's Personal Inventory:
{{inventory}}

{{#if landlordFixtures}}
Known Landlord Fixtures (from landlord's records):
{{landlordFixtures}}
{{/if}}

Room Image:
{{media url=photoDataUri}}

Analyze the image and return:
1. missingItems: Personal items from inventory not visible
2. misplacedItems: Personal items in wrong location
3. confirmedPersonalItems: Items matched to user inventory
4. confirmedLandlordFixtures: Items matched to known landlord fixtures list
5. unexpectedItems: Items not in either list - classify each with:
   - name: Item name
   - likelyOwnership: "personal" or "landlord_fixture"
   - confidence: "high", "medium", or "low"
   - reasoning: Brief explanation

Return results in JSON format.
`,
});

const aiRoomAuditRenterFlow = ai.defineFlow(
  {
    name: 'aiRoomAuditRenterFlow',
    inputSchema: AiRoomAuditRenterInputSchema,
    outputSchema: AiRoomAuditRenterOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.inventory);
      if (input.landlordFixtures) {
        JSON.parse(input.landlordFixtures);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown error';
      throw new Error('Invalid JSON input: ' + message);
    }
    const {output} = await aiRoomAuditRenterPrompt(input);
    return output!;
  }
);
