'use server';

/**
 * @fileOverview Vision Pipeline V2 for advanced image analysis.
 * Handles multi-image reasoning, quality assessment, categorization, and extraction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createHash } from 'crypto';

// --- SCHEMAS ---

export const ImageInputSchema = z.object({
    url: z.string().describe('URL or Base64 data URI of the image'),
    id: z.string().describe('Unique identifier for the image'),
});

export const VisionPipelineInputSchema = z.object({
    images: z.array(ImageInputSchema).describe('List of images to analyze'),
    itemContext: z.string().optional().describe('Optional context about the item'),
});

export type VisionPipelineInput = z.infer<typeof VisionPipelineInputSchema>;

// Sub-result schemas
const ImageQualitySchema = z.object({
    imageId: z.string(),
    sharpness: z.number().describe('0.0 to 1.0'),
    lighting: z.number().describe('0.0 to 1.0'),
    issues: z.array(z.string()).describe('List of quality issues'),
    isAcceptable: z.boolean(),
});

const ImageCategorySchema = z.object({
    imageId: z.string(),
    category: z.enum(['front', 'back', 'label', 'close-up', 'context', 'unknown']),
    confidence: z.number(),
});

const SmartCropSchema = z.object({
    imageId: z.string(),
    cropRegion: z.object({
        ymin: z.number(),
        xmin: z.number(),
        ymax: z.number(),
        xmax: z.number(),
    }),
});

const ImageHashSchema = z.object({
    imageId: z.string(),
    hash: z.string().describe('SHA-256 hash of the image'),
});

export const VisionPipelineOutputSchema = z.object({
    quality: z.array(ImageQualitySchema),
    categories: z.array(ImageCategorySchema),
    smartCrops: z.array(SmartCropSchema),
    hashes: z.array(ImageHashSchema),
    visualTruth: z.array(z.object({
        imageId: z.string(),
        imageHash: z.string(),
        verifiedAt: z.string(),
        method: z.enum(['client-side-hash', 'server-side-hash']),
        status: z.enum(['verified', 'tampered', 'unknown'])
    })).optional(),
    details: z.object({
        brand: z.string().optional(),
        modelNumber: z.string().optional(),
        serialNumber: z.string().optional(),
        material: z.string().optional(),
        color: z.string().optional(),
        dimensions: z.object({
            width: z.string().optional(),
            height: z.string().optional(),
            depth: z.string().optional(),
            unit: z.string().optional(),
        }).optional(),
    }),
    condition: z.object({
        overallScore: z.number().describe('0-100'),
        defects: z.array(z.string()),
        wearLevel: z.enum(['new', 'like-new', 'good', 'fair', 'poor']),
    }),
});

export type VisionPipelineOutput = z.infer<typeof VisionPipelineOutputSchema>;

// --- PROMPTS ---

const qualityPrompt = ai.definePrompt({
    name: 'visionQualityPrompt',
    input: { schema: z.object({ url: z.string() }) },
    output: { schema: z.object({ sharpness: z.number(), lighting: z.number(), issues: z.array(z.string()), isAcceptable: z.boolean() }) },
    prompt: `
    Analyze this image for quality suitable for inventory cataloging.
    Rate sharpness and lighting (0.0-1.0).
    Identify issues (blurry, dark, glare).
    Determine if acceptable.
    
    Image: {{media url=url}}
    `,
});

const categoryPrompt = ai.definePrompt({
    name: 'visionCategoryPrompt',
    input: { schema: z.object({ url: z.string() }) },
    output: { schema: z.object({ category: z.enum(['front', 'back', 'label', 'close-up', 'context', 'unknown']), confidence: z.number() }) },
    prompt: `
    Classify the viewpoint: 'front', 'back', 'label', 'close-up', 'context', 'unknown'.
    
    Image: {{media url=url}}
    `,
});

const smartCropPrompt = ai.definePrompt({
    name: 'visionSmartCropPrompt',
    input: { schema: z.object({ url: z.string() }) },
    output: { schema: z.object({ ymin: z.number(), xmin: z.number(), ymax: z.number(), xmax: z.number() }) },
    prompt: `
    Identify the bounding box for the main subject. Return normalized coordinates (0.0-1.0).
    
    Image: {{media url=url}}
    `,
});

const analysisPrompt = ai.definePrompt({
    name: 'visionAnalysisPrompt',
    input: { schema: z.object({ images: z.array(z.string()), context: z.string().optional() }) },
    output: {
        schema: z.object({
            details: VisionPipelineOutputSchema.shape.details,
            condition: VisionPipelineOutputSchema.shape.condition
        })
    },
    prompt: `
    Analyze these images of an inventory item.
    Context: {{context}}

    Extract details: Brand, Model, Serial, Material, Color, Dimensions.
    Assess condition: Score (0-100), Defects, Wear Level.

    Images:
    {{#each images}}
    {{media url=this}}
    {{/each}}
    `,
});

// --- FLOW ---

export const visionPipelineV2 = ai.defineFlow(
    {
        name: 'visionPipelineV2',
        inputSchema: VisionPipelineInputSchema,
        outputSchema: VisionPipelineOutputSchema,
    },
    async (input) => {
        const { images, itemContext } = input;

        // 1. Parallel Image Processing (Quality, Category, Crop, Hash)
        const imageTasks = images.map(async (img) => {
            // Calculate SHA-256 hash of the image URL/Data
            let hash = '';
            try {
                // Try to fetch the image to hash the content
                const response = await fetch(img.url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    hash = createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');
                } else {
                    console.warn(`Failed to fetch image for hashing: ${img.url}`);
                    hash = createHash('sha256').update(img.url).digest('hex');
                }
            } catch (error) {
                console.warn(`Error fetching image for hashing: ${img.url}`, error);
                hash = createHash('sha256').update(img.url).digest('hex');
            }

            const [q, c, s] = await Promise.all([
                qualityPrompt({ url: img.url }),
                categoryPrompt({ url: img.url }),
                smartCropPrompt({ url: img.url })
            ]);

            return {
                id: img.id,
                quality: q.output,
                category: c.output,
                crop: s.output,
                hash
            };
        });

        const processedImages = await Promise.all(imageTasks);

        // Filter usable images for synthesis
        const usableImages = processedImages.filter(p => p.quality?.isAcceptable).map(p => images.find(i => i.id === p.id)!.url);

        // If no usable images, try to use all (fallback) or throw
        const imagesForAnalysis = usableImages.length > 0 ? usableImages : images.map(i => i.url);

        // 2. Synthesize Details & Condition
        const analysis = await analysisPrompt({
            images: imagesForAnalysis,
            context: itemContext
        });

        return {
            quality: processedImages.map(p => ({ imageId: p.id, ...p.quality! })),
            categories: processedImages.map(p => ({ imageId: p.id, ...p.category! })),
            smartCrops: processedImages.map(p => ({ imageId: p.id, cropRegion: p.crop! })),
            hashes: processedImages.map(p => ({ imageId: p.id, hash: p.hash })),
            visualTruth: processedImages.map(p => ({
                imageId: p.id,
                imageHash: p.hash,
                verifiedAt: new Date().toISOString(),
                method: 'server-side-hash' as const,
                status: 'verified' as const
            })),
            details: analysis.output?.details || {},
            condition: analysis.output?.condition || { overallScore: 0, defects: [], wearLevel: 'poor' }
        };
    }
);
