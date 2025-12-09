import { logger } from './logger';

export interface TenantContext {
    tenantId: string;
    userId?: string;
    roles: string[];
    isSystem: boolean;
    traceId?: string;
}

/**
 * Standardizes the extraction of TenantContext from different sources (HTTP headers, CallableContext).
 */
export function extractTenantContext(auth: any | undefined, headers?: Record<string, string>): TenantContext {
    const traceId = headers?.['x-trace-id'] || headers?.['x-request-id'];

    // 1. System / Internal calls (e.g. PubSub cron) may not have auth, assume system if specific header present
    if (headers?.['x-myark-internal'] === 'true') {
        return { tenantId: 'system', isSystem: true, roles: ['admin'], traceId };
    }

    // 2. Authenticated User / API Client
    if (auth?.token) {
        // Custom key 'tid' in JWT for partners, else default to 'consumer'
        const tenantId = auth.token.tid || 'consumer';
        return {
            tenantId,
            userId: auth.uid,
            roles: auth.token.roles || [],
            isSystem: false,
            traceId
        };
    }

    // 3. Fallback (Guest/Public) - usually restricted
    return { tenantId: 'public', isSystem: false, roles: [], traceId };
}

/**
 * HOF to enforce Tenancy on a function handler.
 * usage: export const myFunc = withTenancy(async (data, ctx) => { ... });
 */
export function withTenancy<T>(
    handler: (data: any, context: TenantContext) => Promise<T>
) {
    return async (req: any, res?: any) => { // Abstraction for HTTP/Callable
        let context: TenantContext;

        try {
            // Simplified extraction logic for demo
            const auth = req.auth || req.context?.auth;
            context = extractTenantContext(auth, req.headers);

            if (context.tenantId === 'public') {
                logger.warn('Public access attempt to protected tenant function');
                throw new Error('Unauthorized');
            }

            // Log the tenant context for every operation (Audit)
            logger.info('Executing operation', {
                tenantId: context.tenantId,
                userId: context.userId
            });

            return await handler(req.body || req.data, context);

        } catch (error) {
            logger.error('Tenancy enforcement failed', error as Error);
            throw error;
        }
    };
}
