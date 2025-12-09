import { NextRequest, NextResponse } from 'next/server';
import { withTenancy } from '@/lib/tenancy';
import { ValuationEngine } from '@/ai/valuation_engine';
import { logger } from '@/lib/logger';

// Initialize Engine (Singleton-ish)
const engine = new ValuationEngine();

// Next.js App Router Wrapper for withTenancy
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

    // SECURITY FIX: Sanitize headers to prevent privilege escalation via 'x-myark-internal'
    const safeHeaders = { ...Object.fromEntries(req.headers) };
    delete safeHeaders['x-myark-internal'];

    // SECURITY FIX: Do not blindly trust 'x-tenant-id' from client.
    // We enforce 'consumer' context by default for this API route unless a verified server token is present.
    // In a full production app, this would verify the Firebase ID Token.
    const compatibleReq = {
        headers: safeHeaders,
        body,
        auth: {
            token: {
                tid: 'consumer' // Force safe default
            }
        }
    };

    return securePost(compatibleReq as any);
}
