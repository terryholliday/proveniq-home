/**
 * @fileOverview Structured logging abstraction for MyARK.
 * Logs domain events in JSON format for production observability.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
    event: string;
    [key: string]: unknown;
}

/**
 * Logs a structured event. In production, this would integrate with
 * a log aggregation service (e.g., Cloud Logging, Datadog).
 */
function log(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, ...sanitize(payload) };

    const output = JSON.stringify(logEntry);

    switch (level) {
        case 'error':
            console.error(output);
            break;
        case 'warn':
            console.warn(output);
            break;
        case 'debug':
            if (process.env.NODE_ENV === 'development') {
                console.debug(output);
            }
            break;
        default:
            console.info(output);
    }
}

/**
 * Sanitizes log payload to prevent sensitive data leakage.
 */
function sanitize(payload: LogPayload): LogPayload {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    const result = { ...payload };

    for (const key of Object.keys(result)) {
        if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
            result[key] = '[REDACTED]';
        }
        // Truncate long strings
        if (typeof result[key] === 'string' && (result[key] as string).length > 500) {
            result[key] = (result[key] as string).slice(0, 500) + '…';
        }
    }

    return result;
}

// Domain event loggers
export const logger = {
    // User lifecycle events
    userSignedUp: (userId: string) =>
        log('info', { event: 'USER_SIGNED_UP', userId }),

    userSignedIn: (userId: string) =>
        log('info', { event: 'USER_SIGNED_IN', userId }),

    // Household events
    householdCreated: (userId: string, householdId: string) =>
        log('info', { event: 'HOUSEHOLD_CREATED', userId, householdId }),

    // Inventory events
    itemCreated: (userId: string, itemId: string, category: string) =>
        log('info', { event: 'ITEM_CREATED', userId, itemId, category }),

    itemUpdated: (userId: string, itemId: string) =>
        log('info', { event: 'ITEM_UPDATED', userId, itemId }),

    itemDeleted: (userId: string, itemId: string) =>
        log('info', { event: 'ITEM_DELETED', userId, itemId }),

    // AI events
    aiValuationRequested: (userId: string, itemId: string) =>
        log('info', { event: 'AI_VALUATION_REQUESTED', userId, itemId }),

    aiValuationFailed: (userId: string, itemId: string, error: string) =>
        log('error', { event: 'AI_VALUATION_FAILED', userId, itemId, error }),

    aiValuationCompleted: (userId: string, itemId: string, latencyMs: number) =>
        log('info', { event: 'AI_VALUATION_COMPLETED', userId, itemId, latencyMs }),

    // Auction events
    auctionCreated: (userId: string, auctionId: string) =>
        log('info', { event: 'AUCTION_CREATED', userId, auctionId }),

    bidPlaced: (userId: string, auctionId: string, amount: number) =>
        log('info', { event: 'BID_PLACED', userId, auctionId, amount }),

    // Error logging
    error: (event: string, error: Error | string, extras?: Record<string, unknown>) =>
        log('error', {
            event,
            message: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            ...extras
        }),

    // Generic logging
    info: (event: string, data?: Record<string, unknown>) =>
        log('info', { event, ...data }),

    warn: (event: string, data?: Record<string, unknown>) =>
        log('warn', { event, ...data }),

    debug: (event: string, data?: Record<string, unknown>) =>
        log('debug', { event, ...data }),
};
