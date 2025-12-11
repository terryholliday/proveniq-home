import { NextRequest, NextResponse } from 'next/server';
import { withTenancy } from '@/lib/tenancy';
import { ValuationEngine } from '@/ai/valuation_engine';
import { logger } from '@/lib/logger';

const engine = new ValuationEngine();

const securePost = withTenancy(async (data: unknown, context) => {
    const inputData = data as { category?: string; condition?: string };
    logger.info('Valuation Requested', {
        tenantId: context.tenantId,
        itemCategory: inputData.category
    });

    // Map to ValuationInput with required fields
    const valuationInput = {
        category: inputData.category || 'Other',
        condition: inputData.condition || 'Good',
        ...inputData
    };
    const result = await engine.evaluate(valuationInput);

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
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // SECURITY FIX: Sanitize headers to prevent privilege escalation
    const safeHeaders = { ...Object.fromEntries(req.headers) };
    delete safeHeaders['x-proveniq-internal'];

    // SECURITY FIX: Enforce safe default for auth
    const compatibleReq = {
        headers: safeHeaders,
        body,
        data: body,
        auth: {
            uid: 'anonymous',
            token: { tid: 'consumer' } // Safe default, do not read from headers
        }
    };

    return securePost(compatibleReq);
}
