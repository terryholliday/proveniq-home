'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_BID_DATA = [
    { hour: '00:00', bids: 12 },
    { hour: '04:00', bids: 5 },
    { hour: '08:00', bids: 45 },
    { hour: '12:00', bids: 120 },
    { hour: '16:00', bids: 150 },
    { hour: '20:00', bids: 80 },
];

export function BiddingPatternsDashboard() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Auction Bidding Patterns</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Bids by Time of Day</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_BID_DATA}>
                                <XAxis dataKey="hour" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Bar dataKey="bids" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Avg. Bids per User</span>
                            <span className="text-2xl font-bold">4.2</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Sniper Activity</span>
                            <span className="text-2xl font-bold text-yellow-600">12%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Conversion Rate</span>
                            <span className="text-2xl font-bold text-green-600">3.5%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
