'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { Loader2, Users, TrendingUp, ShoppingCart, FileCheck } from 'lucide-react';

interface BidData {
    bidderUid: string;
    amount: number;
    timestamp: Timestamp;
}

interface AggregatedBidder {
    name: string;
    bids: number;
    totalValue: number;
}

interface ConsentMetrics {
    viewed: number;
    accepted: number;
    dropOff: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

export default function GrowthDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [bidderData, setBidderData] = useState<AggregatedBidder[]>([]);
    const [totalBids, setTotalBids] = useState(0);
    const [activeBidders, setActiveBidders] = useState(0);
    const [recentActivity, setRecentActivity] = useState<{ date: string; bids: number }[]>([]);
    const [consentMetrics, setConsentMetrics] = useState<ConsentMetrics>({ viewed: 0, accepted: 0, dropOff: 0 });

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const db = getFirestore();

                // Fetch recent bids from audit_logs (bid events)
                const bidsQuery = query(
                    collection(db, 'audit_logs'),
                    where('action', '==', 'bid'),
                    orderBy('timestamp', 'desc'),
                    limit(100)
                );

                const bidsSnapshot = await getDocs(bidsQuery);
                const bids: BidData[] = [];
                const bidderMap = new Map<string, { count: number; total: number }>();

                bidsSnapshot.forEach(doc => {
                    const data = doc.data();
                    bids.push({
                        bidderUid: data.userId || 'anonymous',
                        amount: data.details?.amount || 0,
                        timestamp: data.timestamp
                    });

                    const uid = data.userId || 'anonymous';
                    const existing = bidderMap.get(uid) || { count: 0, total: 0 };
                    bidderMap.set(uid, {
                        count: existing.count + 1,
                        total: existing.total + (data.details?.amount || 0)
                    });
                });

                // Convert to chart data
                const aggregated: AggregatedBidder[] = Array.from(bidderMap.entries())
                    .map(([uid, data], index) => ({
                        name: `User ${index + 1}`,
                        bids: data.count,
                        totalValue: data.total
                    }))
                    .sort((a, b) => b.bids - a.bids)
                    .slice(0, 10);

                setBidderData(aggregated);
                setTotalBids(bids.length);
                setActiveBidders(bidderMap.size);

                // Aggregate by day for trend line
                const dayMap = new Map<string, number>();
                bids.forEach(bid => {
                    if (bid.timestamp) {
                        const date = bid.timestamp.toDate().toISOString().split('T')[0];
                        dayMap.set(date, (dayMap.get(date) || 0) + 1);
                    }
                });
                const activityData = Array.from(dayMap.entries())
                    .map(([date, count]) => ({ date, bids: count }))
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(-7);
                setRecentActivity(activityData);

                // Fetch consent metrics from users collection
                const usersQuery = query(collection(db, 'users'), limit(100));
                const usersSnapshot = await getDocs(usersQuery);
                let viewed = 0, accepted = 0;
                usersSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.consents?.cloudStorage) {
                        viewed++;
                        if (data.consents.cloudStorage.accepted) {
                            accepted++;
                        }
                    }
                });
                setConsentMetrics({
                    viewed,
                    accepted,
                    dropOff: viewed > 0 ? Math.round(((viewed - accepted) / viewed) * 100) : 0
                });

            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="container py-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const pieData = [
        { name: 'Accepted', value: consentMetrics.accepted },
        { name: 'Pending', value: Math.max(0, consentMetrics.viewed - consentMetrics.accepted) }
    ];

    return (
        <div className="container py-8 space-y-8">
            <PageHeader
                title="Growth Dashboard"
                description="Real-time analytics for user engagement, bidding activity, and consent metrics."
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBids}</div>
                        <p className="text-xs text-muted-foreground">From audit logs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bidders</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeBidders}</div>
                        <p className="text-xs text-muted-foreground">Unique users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Consent Rate</CardTitle>
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {consentMetrics.viewed > 0
                                ? `${Math.round((consentMetrics.accepted / consentMetrics.viewed) * 100)}%`
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">{consentMetrics.accepted}/{consentMetrics.viewed} users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Consent Drop-off</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{consentMetrics.dropOff}%</div>
                        <p className="text-xs text-muted-foreground">Users who viewed but didn&apos;t accept</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Bids per User Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bids per User</CardTitle>
                        <CardDescription>Top active users by number of bids placed.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            {bidderData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bidderData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="bids" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No bid data yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Consent Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Consent Status</CardTitle>
                        <CardDescription>Breakdown of user consent responses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {consentMetrics.viewed > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground">No consent data yet</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bidding Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Bidding Activity Trend</CardTitle>
                    <CardDescription>Daily bid volume over the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full">
                        {recentActivity.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={recentActivity}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="bids" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No trend data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
