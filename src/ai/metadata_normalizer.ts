import taxonomyData from './taxonomy.json';
import { AIMetadata } from './types';

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
    private taxonomy: any;

    constructor() {
        this.taxonomy = taxonomyData.taxonomy;
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
            const category = catData as any;
            // Check subcategories
            for (const [subName, keywords] of Object.entries(category.subcategories)) {
                const keywordList = keywords as string[];
                // Check if subcategory name itself is in text
                if (lowerText.includes(subName.toLowerCase())) {
                    // Boost if specific keywords are also found
                    bestMatch = { category: catName, subcategory: subName, confidence: 0.8 };
                }

                for (const keyword of keywordList) {
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
        detectedAttributes: Record<string, any> = {},
        userOverrides: Record<string, any> = {}
    ): AIMetadata {
        // 1. Detect Category
        const detection = this.detectCategory(rawTitle + " " + rawDescription);

        // 2. Normalize Model Name
        let modelName = userOverrides['model'] || detectedAttributes['model'] || rawTitle;
        const canonicalModel = this.normalizeModelName(modelName);

        // 3. Merge Attributes
        // Priority: User > Vision/Doc (detected)
        const attributes: Record<string, any> = { ...detectedAttributes, ...userOverrides };

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
            brand: attributes['brand'] || attributes['Brand'],
            model: canonicalModel,
            attributes: attributes,
            confidence: detection.confidence * 100, // Scale to 0-100
            sources: sources
        };
    }
}
