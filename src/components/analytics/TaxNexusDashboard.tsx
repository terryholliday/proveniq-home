'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StateTaxData {
    state: string;
    totalSales: number;
    threshold: number;
    status: 'compliant' | 'approaching' | 'breached';
}

const MOCK_DATA: StateTaxData[] = [
    { state: 'California', totalSales: 450000, threshold: 500000, status: 'approaching' },
    { state: 'New York', totalSales: 120000, threshold: 500000, status: 'compliant' },
    { state: 'Texas', totalSales: 520000, threshold: 500000, status: 'breached' },
    { state: 'Florida', totalSales: 80000, threshold: 100000, status: 'approaching' },
];

export function TaxNexusDashboard() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Tax Nexus Monitoring</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_DATA.map((data) => (
                    <Card key={data.state}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {data.state}
                            </CardTitle>
                            <Badge variant={
                                data.status === 'breached' ? 'destructive' :
                                    data.status === 'approaching' ? 'secondary' : 'outline'
                            }>
                                {data.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${data.totalSales.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                of ${data.threshold.toLocaleString()} threshold
                            </p>
                            <Progress
                                value={(data.totalSales / data.threshold) * 100}
                                className="mt-3 h-2"
                                indicatorClassName={
                                    data.status === 'breached' ? 'bg-red-500' :
                                        data.status === 'approaching' ? 'bg-yellow-500' : 'bg-green-500'
                                }
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
