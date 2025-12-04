'use server';

/**
 * @fileOverview Schemas for Item Multi-Image Model.
 */

import { z } from 'genkit';

export const ItemMultiImageInputSchema = z.object({
    imageUrls: z.array(z.string()).describe('List of image URLs for the item'),
    itemContext: z.string().optional().describe('Optional context about the item'),
});

export type ItemMultiImageInput = z.infer<typeof ItemMultiImageInputSchema>;

export const ItemMultiImageOutputSchema = z.object({
    compositeDescription: z.string().describe('Comprehensive description derived from all images'),
    consistencyScore: z.number().describe('Score (0-1) indicating if images appear to be of the same item'),
    bestThumbnailIndex: z.number().describe('Index of the image best suited for a thumbnail'),
});

export type ItemMultiImageOutput = z.infer<typeof ItemMultiImageOutputSchema>;
