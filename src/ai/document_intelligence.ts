
export interface DocumentAnalysisResult {
    date?: string;
    type?: 'acquisition' | 'appraisal' | 'repair' | 'other';
    cost?: number;
    provider?: string;
    description?: string;
    confidence: number;
}

export async function analyzeDocument(url: string): Promise<DocumentAnalysisResult> {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic based on keywords in URL or random
    // In a real implementation, this would call Google Cloud Document AI or similar

    const isReceipt = url.toLowerCase().includes('receipt') || url.toLowerCase().includes('invoice');
    const isAppraisal = url.toLowerCase().includes('appraisal') || url.toLowerCase().includes('valuation');

    if (isReceipt) {
        return {
            date: new Date().toISOString(),
            type: 'acquisition',
            cost: Math.floor(Math.random() * 1000) + 100,
            provider: 'Unknown Vendor',
            description: 'Purchase receipt detected.',
            confidence: 0.85
        };
    }

    if (isAppraisal) {
        return {
            date: new Date().toISOString(),
            type: 'appraisal',
            cost: 150, // Cost of the appraisal itself
            provider: 'Certified Appraiser',
            description: 'Official appraisal document.',
            confidence: 0.92
        };
    }

    return {
        date: new Date().toISOString(),
        type: 'other',
        description: 'Document analyzed but type uncertain.',
        confidence: 0.4
    };
}
