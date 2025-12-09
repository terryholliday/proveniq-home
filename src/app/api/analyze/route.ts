import { NextRequest, NextResponse } from 'next/server';
import { withTenancy } from '@/lib/tenancy';
import { ValuationEngine } from '@/ai/valuation_engine';
import { logger } from '@/lib/logger';

const engine = new ValuationEngine();

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
    let body;
    try {
        body = await req.json();
    } catch (e) {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // SECURITY FIX: Sanitize headers to prevent privilege escalation
    const safeHeaders = { ...Object.fromEntries(req.headers) };
    delete safeHeaders['x-myark-internal'];

    // SECURITY FIX: Enforce safe default for auth
    const compatibleReq = {
        headers: safeHeaders,
        body,
        auth: {
            token: { tid: 'consumer' } // Safe default, do not read from headers
        }
    };

    return securePost(compatibleReq as any);
}
