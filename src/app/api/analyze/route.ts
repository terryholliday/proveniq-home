import { NextRequest, NextResponse } from 'next/server';
import { ValuationEngine } from '@/ai/valuation_engine';

const engine = new ValuationEngine();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const tenantId = req.headers.get('x-tenant-id') ?? 'consumer';

    const result = await engine.evaluate(body);

    return NextResponse.json({
        data: result,
        meta: { tenantId }
    });
}
