import { NextRequest, NextResponse } from 'next/server';
import { withTenancy } from '@/lib/tenancy';
import { ValuationEngine } from '@/ai/valuation_engine';
import { logger } from '@/lib/logger';

// Initialize Engine (Singleton-ish)
const engine = new ValuationEngine();

// Next.js App Router Wrapper for withTenancy
// Ad-hoc adapter since the lib function was generic
const securePost = withTenancy(async (data: any, context) => {
    logger.info('Valuation Requested', {
        tenantId: context.tenantId,
        itemCategory: data.category
    });

    const result = await engine.evaluate(data);

    return NextResponse.json({
        data: result,
        meta: {
            tenantId: context.tenantId,
            traceId: context.traceId
        }
    });
});

export async function POST(req: NextRequest) {
    // Adapter to parse body and headers for the generic middleware
    const body = await req.json();

    // We mock the 'req' object expected by withTenancy generic
    // In a real app we'd make the middleware strictly typed for NextRequest
    const compatibleReq = {
        headers: Object.fromEntries(req.headers),
        body,
        auth: {
            // Mock auth extraction - in real Internal API this comes from Gateway/Middleware
            token: { tid: req.headers.get('x-tenant-id') }
        }
    };

    return securePost(compatibleReq as any);
}
