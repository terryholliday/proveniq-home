import { logger } from '../lib/logger';

interface AnalyticsEvent {
    eventName: string;
    properties: Record<string, unknown>;
    tenantId: string;
    userId?: string;
}

/**
 * Analytics Partitioner
 * Ensures Data Isolation in the Analytics Pipeline.
 * 
 * Strategy:
 * - Consumers -> 'events_consumer_global'
 * - Partners -> 'events_partner_{partnerId}'
 */
export class AnalyticsPartitioner {

    /**
     * Routes the event to the correct table name.
     */
    getDestinationTable(tenantId: string): string {
        if (tenantId === 'consumer' || !tenantId) {
            return 'events_consumer_global';
        }

        // Sanitize logic to prevent injection
        const safeTenantId = tenantId.replace(/[^a-z0-9_]/gi, '');
        return `events_partner_${safeTenantId}`;
    }

    /**
     * Ingests an event and routes it.
     */
    async ingest(event: AnalyticsEvent) {
        const table = this.getDestinationTable(event.tenantId);

        // Log locally for debugging
        logger.debug(`[Analytics] Routing '${event.eventName}' to table '${table}'`, {
            tenantId: event.tenantId,
            table
        });

        // In production: await BigQuery.insert(table, event);
    }
}
