# Item Multi-Image Model

This document describes the data model and reasoning logic for analyzing multiple images of an inventory item.

## Concept
An inventory item is rarely fully described by a single image. To build a complete understanding, we analyze a set of images, categorizing them by viewpoint and extracting specific details from each.

## Image Categories (Viewpoints)
We classify each image into one of the following roles:
- **Front**: The primary view of the item.
- **Back**: The rear view, often containing ports, labels, or additional details.
- **Label**: A close-up of a tag, serial number, or specification sticker.
- **Close-up**: A detailed view of a specific feature or defect.
- **Context**: The item in its environment (less useful for strict analysis but good for scale).
- **Unknown**: Unclassified.

## Structured Data Model
The vision pipeline extracts the following structured data:

```typescript
interface VisionAnalysisResult {
  // Classification of the image set
  imageCategories: Record<string, 'front' | 'back' | 'label' | 'close-up' | 'context' | 'unknown'>;
  
  // Extracted Item Details
  itemDetails: {
    brand?: string;
    modelNumber?: string;
    serialNumber?: string;
    material?: string;
    color?: string;
    dimensions?: {
      width?: string;
      height?: string;
      depth?: string;
      unit?: string;
    };
  };

  // Condition Assessment
  condition: {
    overallScore: number; // 0-100
    defects: string[]; // e.g., "scratch on screen", "dent on corner"
    wearLevel: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  };

  // Image Quality (per image)
  qualityScores: Record<string, {
    sharpness: number; // 0-1
    lighting: number; // 0-1
    overall: number; // 0-1
    issues: string[]; // e.g., "blurry", "too dark"
  }>;

  // Embeddings for similarity search
  embedding?: number[];
}
```

## Reasoning Pipeline
1. **Ingest**: Receive a list of image URLs or base64 data.
2. **Quality Check**: Assess each image for usability. Reject or warn if quality is too low.
3. **Categorize**: Determine the viewpoint of each image.
4. **Extract (Per Image)**:
    - *Label images*: OCR for text (S/N, Model).
    - *Front/Back*: Object detection, brand identification, material analysis.
    - *Close-up*: Defect detection.
5. **Synthesize**: Combine findings from all images into a single `VisionAnalysisResult`.
    - Conflict resolution: If Image A says "Brand X" and Image B says "Brand Y", prefer the one with higher confidence or from a 'Label' view.
6. **Diff (Optional)**: If comparing to a previous state, compute the difference in condition or details.
