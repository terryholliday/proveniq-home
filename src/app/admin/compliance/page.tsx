'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { SEED_LEGAL_DOCS, SEED_COMPLIANCE_TASKS } from '@/lib/compliance-seed';

export default function ComplianceDashboard() {
    // In a real app, fetch from Firestore
    const [docs, setDocs] = useState(SEED_LEGAL_DOCS);
    const [tasks, setTasks] = useState(SEED_COMPLIANCE_TASKS);

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-indigo-600" />
                        Compliance Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage legal documents, consents, and compliance tasks.</p>
                </div>
                <Button>Generate Report</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'pending').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Published Docs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{docs.filter(d => d.status === 'published').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Audit Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Compliant
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tasks">
                <TabsList>
                    <TabsTrigger value="tasks">Compliance Tasks</TabsTrigger>
                    <TabsTrigger value="docs">Legal Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                    {tasks.map((task, i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{task.title}</h3>
                                        {task.priority === 'critical' && <Badge variant="destructive">Critical</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-right">
                                        <div className="font-medium">Due: {task.dueDate?.toDate ? task.dueDate.toDate().toLocaleDateString() : 'Soon'}</div>
                                        <div className="text-muted-foreground capitalize">{task.status}</div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                    {docs.map((doc, i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{doc.title}</h3>
                                        <p className="text-sm text-muted-foreground">Version {doc.version} • Updated {doc.lastUpdated?.toDate ? doc.lastUpdated.toDate().toLocaleDateString() : 'Recently'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>{doc.status}</Badge>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
