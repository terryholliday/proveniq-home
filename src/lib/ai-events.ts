import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type AIEvent = {
    eventType: 'start' | 'success' | 'failure' | 'fallback' | 'circuit_break';
    workflowId: string;
    stepName: string;
    itemId?: string;
    metadata?: Record<string, any>;
    error?: string;
    timestamp?: any;
};

const EVENTS_COLLECTION = 'ai_events';

export async function logAIEvent(event: Omit<AIEvent, 'timestamp'>) {
    try {
        // Ensure no PII is logged - strictly metadata and IDs
        const safeMetadata = event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : {};

        // Simple PII scrubber (expand as needed)
        const scrubPII = (obj: any) => {
            if (typeof obj !== 'object' || obj === null) return;
            for (const key in obj) {
                if (['email', 'phone', 'address', 'name'].includes(key.toLowerCase())) {
                    obj[key] = '[REDACTED]';
                } else if (typeof obj[key] === 'object') {
                    scrubPII(obj[key]);
                }
            }
        };
        scrubPII(safeMetadata);

        if (adminDb) {
            const logPromise = adminDb.collection(EVENTS_COLLECTION).add({
                ...event,
                metadata: safeMetadata,
                timestamp: FieldValue.serverTimestamp(),
            });

            // Timeout after 2 seconds to prevent hanging
            await Promise.race([
                logPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Logging timed out')), 2000))
            ]);
        } else {
            console.warn('Firebase Admin DB not initialized, skipping log');
        }
    } catch (error) {
        console.error('Failed to log AI event:', error);
        // Fail silently to not disrupt the app flow
    }
}
