export interface AIImageAnalysis {
    description: string;
    objects: {
        label: string;
        confidence: number;
        box?: { x: number; y: number; w: number; h: number };
    }[];
    quality: {
        score: number; // 0-100
        issues: string[]; // e.g., 'blurry', 'dark'
    };
    condition?: {
        score: number; // 0-100
        details: string[];
    };
    extractedText?: string[];
}

export interface AIDocumentAnalysis {
    documentType: 'receipt' | 'appraisal' | 'certificate' | 'manual' | 'other';
    extractedData: Record<string, unknown>;
    confidence: number;
    summary: string;
}

export interface AIMetadata {
    category: string;
    subcategory: string;
    brand?: string;
    model?: string;
    attributes: Record<string, unknown>;
    confidence: number; // 0-100
    sources: string[]; // e.g., ['image', 'document']
}

export interface AIValuation {
    estimatedValue: {
        min: number;
        max: number;
        currency: string;
    };
    confidenceScore: number;
    factors: {
        brand: number;
        condition: number;
        age: number;
        materials: number;
        market: number;
    };
    explanation: string;
    modelBreakdown: {
        aiDescription?: number;
        priceHistory?: number;
        marketComparison?: number;
        conditionAdjusted?: number;
    };
    depreciationCurve?: {
        year: number;
        value: number;
    }[];
}

import { ProvenanceEventType } from '@/lib/types';

export interface AIProvenance {
    timeline: {
        date: string;
        title: string;
        type: ProvenanceEventType;
        description: string;
        verified: boolean;
    }[];
    confidenceScore: number;
    gapDetected: boolean;
    narrative: string;
    merkleRoot?: string;
}

export interface AIProcessingResult {
    itemId: string;
    workflowId: string;
    timestamp: string;
    imageAnalysis?: AIImageAnalysis;
    documentAnalysis?: AIDocumentAnalysis;
    metadata: AIMetadata;
    valuation: AIValuation;
    provenance: AIProvenance;
    status: 'success' | 'partial' | 'failed';
    errors?: string[];
}
