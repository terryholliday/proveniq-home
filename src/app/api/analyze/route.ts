import { NextRequest, NextResponse } from 'next/server';
import { withTenancy } from '@/lib/tenancy';
import { ValuationEngine } from '@/ai/valuation_engine';
import { logger } from '@/lib/logger';
import { adminAuth } from '@/lib/firebase-admin';

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
    // SECURITY FIX: Verify Firebase Auth token instead of trusting x-tenant-id header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: Missing bearer token' }, { status: 401 });
    }

    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Extract tenant ID from verified token claims or fallback to uid
        const tenantId = decodedToken.tid || decodedToken.uid;

        const body = await req.json();

        // Build request with verified tenant ID
        const compatibleReq = {
            headers: Object.fromEntries(req.headers),
            body,
            auth: {
                token: { tid: tenantId, uid: decodedToken.uid }
            }
        };

        return securePost(compatibleReq as any);
    } catch (error: any) {
        logger.error('API Auth Error', error);
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
}

