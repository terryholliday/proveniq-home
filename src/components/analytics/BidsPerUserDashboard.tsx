'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for demonstration until API is available
const mockData = [
    { name: 'User A', bids: 12 },
    { name: 'User B', bids: 8 },
    { name: 'User C', bids: 15 },
    { name: 'User D', bids: 3 },
    { name: 'User E', bids: 7 },
];

export function BidsPerUserDashboard() {
    return (
        <Card className="w-full h-[400px]">
            <CardHeader>
                <CardTitle>Bids per User</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bids" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
