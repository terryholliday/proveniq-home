import taxonomyData from '../../lib/taxonomy.json';

// Types for our metadata system
export interface AttributeValue {
    value: string | number | boolean;
    source: 'user' | 'vision' | 'ocr' | 'api' | 'inference' | 'default';
    confidence: number;
    timestamp: string;
}

export interface NormalizedItemMetadata {
    category: AttributeValue;
    subcategory: AttributeValue;
    attributes: Record<string, AttributeValue>;
    variantMapping?: {
        original: string;
        canonical: string;
    };
}

// Type for the taxonomy data structure
interface TaxonomyNode {
    subcategories: Record<string, string[]>;
}

type Taxonomy = Record<string, TaxonomyNode>;


// Confidence scores based on source (aligned with conflict rules)
const SOURCE_CONFIDENCE = {
    user: 1.0,
    api: 0.9,
    ocr: 0.8,
    vision: 0.7,
    inference: 0.5,
    default: 0.1,
};

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
        const lower = rawName.toLowerCase().trim();
        return VARIANT_MAPPINGS[lower] || rawName; // Return mapped or original
    }

    /**
     * Detects category and subcategory from a text string (title/description).
     * Simple keyword matching for V1.
     */
    detectCategory(text: string): { category: string; subcategory: string; confidence: number } {
        const lowerText = text.toLowerCase();
        let bestMatch = { category: "Unknown", subcategory: "Unknown", confidence: 0.0 };

        for (const [catName, category] of Object.entries(this.taxonomy)) {
            // Check subcategories
            for (const [subName, keywords] of Object.entries(category.subcategories)) {
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
     * Resolves conflicts between two attribute values based on source confidence.
     */
    resolveConflict(val1: AttributeValue, val2: AttributeValue): AttributeValue {
        if (val1.confidence > val2.confidence) return val1;
        if (val2.confidence > val1.confidence) return val2;
        // Tie-breaker: latest timestamp wins
        return new Date(val1.timestamp) > new Date(val2.timestamp) ? val1 : val2;
    }

    /**
     * Creates a standardized attribute object.
     */
    createAttribute(value: string | number | boolean, source: keyof typeof SOURCE_CONFIDENCE): AttributeValue {
        return {
            value,
            source,
            confidence: SOURCE_CONFIDENCE[source],
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Main normalization pipeline.
     */
    normalizeItem(
        rawTitle: string,
        rawDescription: string,
        detectedAttributes: Record<string, string | number | boolean> = {}, // from Vision/OCR
        userOverrides: Record<string, string | number | boolean> = {}
    ): NormalizedItemMetadata {

        // 1. Detect Category
        const detection = this.detectCategory(rawTitle + " " + rawDescription);

        const categoryAttr = this.createAttribute(detection.category, 'inference');
        // Adjust confidence if inference was weak
        categoryAttr.confidence = detection.confidence;

        const subcategoryAttr = this.createAttribute(detection.subcategory, 'inference');
        subcategoryAttr.confidence = detection.confidence;

        // 2. Normalize Model Name
        // Check if model is in detected attributes or title
        const modelName = (detectedAttributes['model'] as string) || rawTitle;
        const canonicalModel = this.normalizeModelName(modelName);

        const attributes: Record<string, AttributeValue> = {};

        // 3. Process Detected Attributes (Vision/OCR)
        for (const [key, val] of Object.entries(detectedAttributes)) {
            attributes[key] = this.createAttribute(val, 'vision'); // Defaulting to vision for this input bucket
        }

        // 4. Apply User Overrides (Highest Priority)
        for (const [key, val] of Object.entries(userOverrides)) {
            attributes[key] = this.createAttribute(val, 'user');
        }

        // 5. Store Variant Mapping if applicable
        let variantMapping = undefined;
        if (canonicalModel !== modelName) {
            variantMapping = { original: modelName, canonical: canonicalModel };
            // Update model attribute to canonical
            attributes['Model'] = this.createAttribute(canonicalModel, 'inference');
            attributes['Model'].confidence = 0.95; // High confidence on canonical mapping
        }

        return {
            category: categoryAttr,
            subcategory: subcategoryAttr,
            attributes,
            variantMapping
        };
    }
}
