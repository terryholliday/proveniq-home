import taxonomyData from './taxonomy.json';
import { AIMetadata } from './types';

// Types for the taxonomy data structure
interface TaxonomyNode {
    subcategories: Record<string, string[]>;
}
type Taxonomy = Record<string, TaxonomyNode>;


// Variant Model Mapping Dictionary
const VARIANT_MAPPINGS: Record<string, string> = {
    "fender strat": "Fender Stratocaster",
    "strat": "Fender Stratocaster",
    "gibson lp": "Gibson Les Paul",
    "lp": "Gibson Les Paul",
    "macbook pro 16": "MacBook Pro 16-inch",
    "mbp": "MacBook Pro",
    "ps5": "PlayStation 5",
    "playstation 5": "PlayStation 5",
};

export class MetadataNormalizer {
    private taxonomy: Taxonomy;

    constructor() {
        this.taxonomy = (taxonomyData as { taxonomy: Taxonomy }).taxonomy;
    }

    /**
     * Normalizes a raw model name to its canonical form.
     */
    normalizeModelName(rawName: string): string {
        if (!rawName) return '';
        const lower = rawName.toLowerCase().trim();
        return VARIANT_MAPPINGS[lower] || rawName;
    }

    /**
     * Detects category and subcategory from a text string (title/description).
     */
    detectCategory(text: string): { category: string; subcategory: string; confidence: number } {
        const lowerText = text.toLowerCase();
        let bestMatch = { category: "Unknown", subcategory: "Unknown", confidence: 0.0 };

        for (const [catName, catData] of Object.entries(this.taxonomy)) {
            // Check subcategories
            for (const [subName, keywords] of Object.entries(catData.subcategories)) {
                // Check if subcategory name itself is in text
                if (lowerText.includes(subName.toLowerCase())) {
                    // Boost if specific keywords are also found
                    bestMatch = { category: catName, subcategory: subName, confidence: 0.8 };
                }

                for (const keyword of keywords) {
                    if (lowerText.includes(keyword.toLowerCase())) {
                        // Found a keyword match
                        if (0.7 > bestMatch.confidence) {
                            bestMatch = { category: catName, subcategory: subName, confidence: 0.7 };
                        }
                    }
                }
            }
        }
        return bestMatch;
    }

    /**
     * Main normalization pipeline.
     */
    normalize(
        rawTitle: string,
        rawDescription: string,
        detectedAttributes: Record<string, string | number | boolean> = {},
        userOverrides: Record<string, string | number | boolean> = {}
    ): AIMetadata {
        // 1. Detect Category
        const detection = this.detectCategory(rawTitle + " " + rawDescription);

        // 2. Normalize Model Name
        const modelName = (userOverrides['model'] as string) || (detectedAttributes['model'] as string) || rawTitle;
        const canonicalModel = this.normalizeModelName(modelName);

        // 3. Merge Attributes
        // Priority: User > Vision/Doc (detected)
        const attributes: Record<string, string | number | boolean> = { ...detectedAttributes, ...userOverrides };

        // Ensure canonical model is used
        if (canonicalModel) {
            attributes['model'] = canonicalModel;
        }

        // 4. Determine Sources
        const sources: string[] = [];
        if (Object.keys(userOverrides).length > 0) sources.push('user');
        if (Object.keys(detectedAttributes).length > 0) sources.push('vision/doc');
        if (detection.confidence > 0) sources.push('inference');

        return {
            category: detection.category,
            subcategory: detection.subcategory,
            brand: (attributes['brand'] as string) || (attributes['Brand'] as string),
            model: canonicalModel,
            attributes: attributes,
            confidence: detection.confidence * 100, // Scale to 0-100
            sources: sources
        };
    }
}
