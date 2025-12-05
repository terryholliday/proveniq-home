import { logger } from './logger';
import { TenantContext } from './tenancy';

export interface ArkEvent<T = any> {
    type: string;
    source: string;
    data: T;
    context: TenantContext; // Events carry the tenant context!
    version: string;
}

/**
 * EventBus Abstraction.
 * In production, this pushes to Google Cloud Pub/Sub.
 * In local dev, it might just log or use an in-memory emulator.
 */
class EventBus {

    async publish<T>(topic: string, event: ArkEvent<T>): Promise<void> {
        // Validation (simplified)
        if (!event.type || !event.data) {
            throw new Error('Invalid event structure');
        }

        // 1. Log the emission (Traceability)
        logger.info(`Event Published: ${event.type}`, {
            topic,
            source: event.source,
            tenantId: event.context.tenantId
        });

        // 2. Publish to Infrastructure (Mock)
        // await pubsub.topic(topic).publishMessage({ json: event });

        // Simulating async behavior for local dev
        await Promise.resolve();
    }

    /**
     * Factory for creating standard lifecycle events
     */
    createEvent<T>(
        type: string,
        data: T,
        context: TenantContext,
        source = 'monolith'
    ): ArkEvent<T> {
        return {
            type,
            source,
            data,
            context,
            version: '1.0'
        };
    }
}

export const eventBus = new EventBus();
