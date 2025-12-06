
export interface DocumentAnalysisResult {
    date?: string;
    type?: 'acquisition' | 'appraisal' | 'repair' | 'other';
    cost?: number;
    provider?: string;
    description?: string;
    confidence: number;
    piiDetected?: boolean;
    piiRedacted?: boolean;
    redactedFields?: string[];
}

// PII patterns for detection/redaction
const PII_PATTERNS = {
    ssn: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    dob: /\b(?:0[1-9]|1[0-2])[-\/](?:0[1-9]|[12][0-9]|3[01])[-\/](?:19|20)\d{2}\b/g,
    driverLicense: /\b[A-Z]{1,2}\d{6,8}\b/g,
    bankAccount: /\b\d{8,17}\b/g,
};

/**
 * Detect PII in text content
 */
export function detectPII(text: string): { detected: boolean; types: string[] } {
    const detectedTypes: string[] = [];

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.test(text)) {
            detectedTypes.push(type);
        }
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
    }

    return {
        detected: detectedTypes.length > 0,
        types: detectedTypes,
    };
}

/**
 * Redact PII from text content
 */
export function redactPII(text: string): { redacted: string; types: string[] } {
    let redacted = text;
    const redactedTypes: string[] = [];

    const redactionMap: Record<string, string> = {
        ssn: '[SSN REDACTED]',
        creditCard: '[CARD REDACTED]',
        email: '[EMAIL REDACTED]',
        phone: '[PHONE REDACTED]',
        dob: '[DOB REDACTED]',
        driverLicense: '[LICENSE REDACTED]',
        bankAccount: '[ACCOUNT REDACTED]',
    };

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.test(redacted)) {
            redactedTypes.push(type);
            redacted = redacted.replace(pattern, redactionMap[type] || '[REDACTED]');
        }
        pattern.lastIndex = 0;
    }

    return { redacted, types: redactedTypes };
}

export async function analyzeDocument(url: string): Promise<DocumentAnalysisResult> {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic based on keywords in URL or random
    // In a real implementation, this would call Google Cloud Document AI or similar

    const isReceipt = url.toLowerCase().includes('receipt') || url.toLowerCase().includes('invoice');
    const isAppraisal = url.toLowerCase().includes('appraisal') || url.toLowerCase().includes('valuation');

    // Simulate extracted text (in production, from OCR)
    const mockExtractedText = "Invoice #12345 for John Doe, SSN: 123-45-6789, Card: 4111-1111-1111-1111";

    // PII Detection & Redaction (AI Safety requirement)
    const piiCheck = detectPII(mockExtractedText);
    let description = '';
    let redactedFields: string[] = [];

    if (piiCheck.detected) {
        const { redacted, types } = redactPII(mockExtractedText);
        description = `Document contains sensitive data. ${types.length} PII fields redacted.`;
        redactedFields = types;
        console.warn(`[PII SAFETY] Detected and redacted PII types: ${types.join(', ')}`);
    }

    if (isReceipt) {
        return {
            date: new Date().toISOString(),
            type: 'acquisition',
            cost: Math.floor(Math.random() * 1000) + 100,
            provider: 'Unknown Vendor',
            description: description || 'Purchase receipt detected.',
            confidence: 0.85,
            piiDetected: piiCheck.detected,
            piiRedacted: piiCheck.detected,
            redactedFields,
        };
    }

    if (isAppraisal) {
        return {
            date: new Date().toISOString(),
            type: 'appraisal',
            cost: 150, // Cost of the appraisal itself
            provider: 'Certified Appraiser',
            description: description || 'Official appraisal document.',
            confidence: 0.92,
            piiDetected: piiCheck.detected,
            piiRedacted: piiCheck.detected,
            redactedFields,
        };
    }

    return {
        date: new Date().toISOString(),
        type: 'other',
        description: description || 'Document analyzed but type uncertain.',
        confidence: 0.4,
        piiDetected: piiCheck.detected,
        piiRedacted: piiCheck.detected,
        redactedFields,
    };
}

