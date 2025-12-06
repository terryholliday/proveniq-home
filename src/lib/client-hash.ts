/**
 * Client-Side Image Hashing Module
 * 
 * Uses Web Crypto API to generate SHA-256 hashes of images
 * in the browser for Visual Truth anti-tamper verification.
 */

/**
 * Calculate SHA-256 hash of an image file using Web Crypto API
 */
export async function hashImageFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    return hashArrayBuffer(arrayBuffer);
}

/**
 * Calculate SHA-256 hash of an ArrayBuffer
 */
export async function hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate SHA-256 hash of an image from URL (fetches first)
 */
export async function hashImageUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return hashArrayBuffer(arrayBuffer);
}

/**
 * Calculate SHA-256 hash of a Base64 image data URI
 */
export async function hashBase64Image(dataUri: string): Promise<string> {
    // Extract base64 content from data URI
    const base64Match = dataUri.match(/^data:image\/[^;]+;base64,(.+)$/);
    if (!base64Match) {
        throw new Error('Invalid base64 image data URI');
    }

    const binaryString = atob(base64Match[1]);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return hashArrayBuffer(bytes.buffer);
}

export interface VisualTruthHashResult {
    hash: string;
    timestamp: string;
    method: 'client-side-hash';
    size: number;
    mimeType?: string;
}

/**
 * Generate Visual Truth hash data for an image
 */
export async function generateVisualTruthHash(
    source: File | string,
    options?: { includeMimeType?: boolean }
): Promise<VisualTruthHashResult> {
    let hash: string;
    let size: number;
    let mimeType: string | undefined;

    if (source instanceof File) {
        hash = await hashImageFile(source);
        size = source.size;
        mimeType = options?.includeMimeType ? source.type : undefined;
    } else if (source.startsWith('data:')) {
        hash = await hashBase64Image(source);
        size = Math.round((source.length * 3) / 4); // Approximate size from base64
        const typeMatch = source.match(/^data:([^;]+);/);
        mimeType = options?.includeMimeType && typeMatch ? typeMatch[1] : undefined;
    } else {
        hash = await hashImageUrl(source);
        size = 0; // Unknown for URL
    }

    return {
        hash,
        timestamp: new Date().toISOString(),
        method: 'client-side-hash',
        size,
        mimeType,
    };
}

/**
 * Compare client hash with server hash for tamper detection
 */
export function verifyHash(
    clientHash: string,
    serverHash: string
): { verified: boolean; match: boolean } {
    const match = clientHash.toLowerCase() === serverHash.toLowerCase();
    return {
        verified: true,
        match,
    };
}

/**
 * React hook for image hashing (optional - if React is available)
 */
export function useImageHash() {
    const hashFile = async (file: File): Promise<VisualTruthHashResult> => {
        return generateVisualTruthHash(file, { includeMimeType: true });
    };

    const compareHash = (
        clientHash: string,
        serverHash: string
    ): boolean => {
        return clientHash.toLowerCase() === serverHash.toLowerCase();
    };

    return { hashFile, compareHash };
}

export default generateVisualTruthHash;
