'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Users, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
    return (
        <>
            <PageHeader
                title="Admin Dashboard"
                description="This is the central control panel for managing MyARK."
            />
            <div className="container py-8">
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold">Total Users</h3>
                        <p className="text-2xl font-bold">10,000+</p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold">Active Auctions</h3>
                        <p className="text-2xl font-bold">1,204</p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold">Pending Verifications</h3>
                        <p className="text-2xl font-bold">5</p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold">System Status</h3>
                        <p className="text-2xl font-bold text-green-500">Operational</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/admin/leadership">
                        <div className="rounded-xl border bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 transition-all p-6 cursor-pointer group">
                            <div className="flex items-center gap-3 mb-2">
                                <Users className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Leadership Dashboard</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Track all 16 leadership agents across Phase 0 and Phase 3
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                                View Dashboard →
                            </Button>
                        </div>
                    </Link>

                    <Link href="/admin/compliance">
                        <div className="rounded-xl border bg-card hover:bg-accent transition-all p-6 cursor-pointer group">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Compliance</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Review compliance documents and regulatory requirements
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                                View Compliance →
                            </Button>
                        </div>
                    </Link>

                    <Link href="/admin/growth">
                        <div className="rounded-xl border bg-card hover:bg-accent transition-all p-6 cursor-pointer group">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-lg">Growth Metrics</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Monitor user growth and engagement analytics
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                                View Growth →
                            </Button>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}