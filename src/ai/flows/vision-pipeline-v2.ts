// ... imports (keep existing)
import { ai } from '@/ai/genkit';
import { createHash } from 'crypto';
import { z } from 'zod';

// Schemas
const VisionPipelineInputSchema = z.object({
    images: z.array(z.object({
        id: z.string(),
        url: z.string()
    })),
    itemContext: z.any().optional()
});

const VisionPipelineOutputSchema = z.object({
    quality: z.array(z.any()),
    categories: z.array(z.any()),
    smartCrops: z.array(z.any()),
    hashes: z.array(z.object({
        imageId: z.string(),
        hash: z.string()
    })),
    visualTruth: z.array(z.object({
        imageId: z.string(),
        imageHash: z.string(),
        verifiedAt: z.string(),
        method: z.literal('server-side-hash'),
        status: z.enum(['verified', 'unknown', 'tampered'])
    })),
    details: z.any(),
    condition: z.any()
});

// Placeholder prompts - replace with actual AI prompts
const qualityPrompt = async (input: { url: string }) => ({ output: { isAcceptable: true, sharpness: 0.9, issues: [] } });
const categoryPrompt = async (input: { url: string }) => ({ output: { category: 'front', confidence: 0.95 } });
const smartCropPrompt = async (input: { url: string }) => ({ output: { ymin: 0.1, xmin: 0.1, ymax: 0.9, xmax: 0.9 } });
const analysisPrompt = async (input: { images: string[], context?: unknown }) => ({
    output: {
        details: { brand: 'TestBrand', modelNumber: 'TB-123' },
        condition: { overallScore: 90, defects: [], wearLevel: 'like-new' }
    }
});

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
            let verificationStatus: 'verified' | 'unknown' | 'tampered' = 'unknown';

            try {
                // Try to fetch the image to hash the content
                const response = await fetch(img.url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    hash = createHash('sha256').update(Buffer.from(arrayBuffer)).digest('hex');
                    verificationStatus = 'verified';
                } else {
                    console.warn(`Failed to fetch image for hashing: ${img.url}`);
                    // FIX: Do NOT hash the URL as a fallback. Leave hash empty.
                    verificationStatus = 'unknown';
                }
            } catch (error) {
                console.warn(`Error fetching image for hashing: ${img.url}`, error);
                verificationStatus = 'unknown';
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
                hash,
                verificationStatus
            };
        });

        const processedImages = await Promise.all(imageTasks);

        // ... rest of the synthesis logic (keep existing) ...
        const usableImages = processedImages.filter(p => p.quality?.isAcceptable).map(p => images.find(i => i.id === p.id)!.url);
        const imagesForAnalysis = usableImages.length > 0 ? usableImages : images.map(i => i.url);

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
                status: p.verificationStatus // Use the actual calculated status
            })),
            details: analysis.output?.details || {},
            condition: analysis.output?.condition || { overallScore: 0, defects: [], wearLevel: 'poor' }
        };
    }
);
