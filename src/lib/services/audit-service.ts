
import { User } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Ensure this initializes the app

export enum AuditAction {
    VIEW = 'view',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    EXPORT = 'export',
    LOGIN = 'login',
    VALUATION_PRODUCED = 'valuation_produced',
    DRIFT_DETECTED = 'drift_detected',
    BIAS_FLAGGED = 'bias_flagged'
}

export type AuditEvent = {
    id: string;
    timestamp: string;
    actorId: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string; // In a real app, captured from request
};

class AuditServiceImpl {
    private async persistLog(event: AuditEvent) {
        // Log to console for dev visibility
        console.log(`[AUDIT] ${event.timestamp} | ${event.actorId} | ${event.action} | ${event.resourceType}:${event.resourceId || 'N/A'}`, event.metadata || '');

        try {
            // Write to 'audit_logs' collection in Firestore
            // Initialize Firebase if not already (safe to call multiple times if handled correctly, 
            // but relying on app initialization at root is better. Here we assume Client SDK or Admin SDK context).
            // Since this file seems to be used in Client context (based on imports), we use Client SDK.
            const { firestore } = initializeFirebase();
            await addDoc(collection(firestore, 'audit_logs'), event);
        } catch (error) {
            console.error("Failed to persist audit log to Firestore:", error);
            // Don't throw, to avoid breaking the main flow
        }
    }

    async log(actor: User | { uid: string }, action: AuditAction, resourceType: string, resourceId?: string, metadata?: Record<string, unknown>) {
        const event: AuditEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            actorId: actor.uid,
            action,
            resourceType,
            resourceId,
            metadata
        };

        await this.persistLog(event);
    }
}

export const AuditService = new AuditServiceImpl();
