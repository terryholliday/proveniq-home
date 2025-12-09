
import { User } from '@/lib/types';

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
    metadata?: Record<string, any>;
    ipAddress?: string; // In a real app, captured from request
};

class AuditServiceImpl {
    private async persistLog(event: AuditEvent) {
        // In strict Phase 4, this goes to Firestore/BigQuery.
        // In Phase 3, console.log + mock persistence is sufficient to satisfy the architecture.
        console.log(`[AUDIT] ${event.timestamp} | ${event.actorId} | ${event.action} | ${event.resourceType}:${event.resourceId || 'N/A'}`, event.metadata || '');

        // TODO: Write to 'audit_logs' collection in Firestore
    }

    async log(actor: User | { uid: string }, action: AuditAction, resourceType: string, resourceId?: string, metadata?: Record<string, any>) {
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
