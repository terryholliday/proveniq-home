
export interface VisualTruthVerification {
    imageId: string;
    imageHash: string; // SHA-256
    verifiedAt: string; // ISO Date
    method: 'client-side-hash' | 'server-side-hash';
    status: 'verified' | 'tampered' | 'unknown';
}

export interface ProvenanceLog {
    itemId: string;
    merkleRoot: string;
    events: string[]; // "date:type:title:description"
    visualTruth?: VisualTruthVerification[];
    timestamp: Date; // Server timestamp
    eventCount: number;
    signature?: string; // Digital signature of the merkle root (future proofing)
}
