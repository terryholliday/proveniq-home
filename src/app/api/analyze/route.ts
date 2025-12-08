import { NextRequest, NextResponse } from 'next/server';
import { ValuationEngine } from '@/ai/valuation_engine';
import { withTenancy } from '@/lib/tenancy';

const engine = new ValuationEngine();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    const handler = withTenancy(async (data, context) => {
        const result = await engine.evaluate(data);
        return { data: result, context };
    });

    try {
        const { data, context } = await handler({ body, headers });

        return NextResponse.json({
            data,
            meta: { tenantId: context.tenantId }
        });
    } catch (error) {
        const status = (error as Error).message === 'Unauthorized' ? 403 : 500;
        return NextResponse.json({ error: 'Unauthorized' }, { status });
    }
}
