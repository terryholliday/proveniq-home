'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { SEED_LEGAL_DOCS, SEED_COMPLIANCE_TASKS } from '@/lib/compliance-seed';
import { SEED_ROLES } from '@/lib/admin-seed';
import { useFirestore } from '@/firebase/provider';
import { collection, onSnapshot, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { LegalDocument, ComplianceTask, LeadershipRole } from '@/lib/types';
import { RoleCard } from '@/components/admin/RoleCard';

export default function ComplianceDashboard() {
    const firestore = useFirestore();
    const [docs, setDocs] = useState<Partial<LegalDocument>[]>([]);
    const [tasks, setTasks] = useState<Partial<ComplianceTask>[]>([]);
    const [roles, setRoles] = useState<LeadershipRole[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (!firestore) return;

        const unsubDocs = onSnapshot(collection(firestore, 'legal_documents'), (snapshot) => {
            setDocs(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Partial<LegalDocument>)));
        });

        const unsubTasks = onSnapshot(collection(firestore, 'compliance_tasks'), (snapshot) => {
            setTasks(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Partial<ComplianceTask>)));
        });

        const unsubRoles = onSnapshot(collection(firestore, 'leadership_roles'), (snapshot) => {
            setRoles(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as LeadershipRole)));
        });

        return () => {
            unsubDocs();
            unsubTasks();
            unsubRoles();
        };
    }, [firestore]);

    const handleSync = async () => {
        if (!firestore) return;
        setIsSyncing(true);
        try {
            const batch = writeBatch(firestore);

            SEED_LEGAL_DOCS.forEach(d => {
                if (d.id) {
                    batch.set(doc(firestore, 'legal_documents', d.id), d);
                }
            });

            SEED_COMPLIANCE_TASKS.forEach(t => {
                // Generate a deterministic ID based on title to prevent duplicates
                const id = t.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'unknown-task';
                batch.set(doc(firestore, 'compliance_tasks', id), t);
            });

            SEED_ROLES.forEach(r => {
                batch.set(doc(firestore, 'leadership_roles', r.id), r);
            });

            await batch.commit();
            // alert('Synced successfully!'); // Removed alert for better UX, maybe add toast later
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGenerateReport = () => {
        const reportContent = `
MYARK COMPLIANCE REPORT
Generated: ${new Date().toLocaleString()}

--- EXECUTIVE SUMMARY ---
Total Roles: ${roles.length}
Active Roles: ${roles.filter(r => r.status === 'active').length}

--- COMPLIANCE STATUS ---
Pending Tasks: ${tasks.filter(t => t.status === 'pending').length}
Published Documents: ${docs.filter(d => d.status === 'published').length}
Audit Status: Compliant

--- ROLES & RESPONSIBILITIES ---
${roles.map(r => `
[${r.title}] (${r.status.toUpperCase()})
- Assignee: ${r.assigneeName || 'Unassigned'}
- Responsibilities: ${r.responsibilities.join(', ')}
`).join('')}

--- PENDING TASKS ---
${tasks.filter(t => t.status === 'pending').map(t => `
[${t.priority?.toUpperCase()}] ${t.title} - Due: ${t.dueDate instanceof Timestamp ? t.dueDate.toDate().toLocaleDateString() : 'N/A'}
`).join('')}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance_report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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
                <div className="flex gap-2">
                    <Button onClick={handleSync} disabled={isSyncing} variant="outline">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Seed Data'}
                    </Button>
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                </div>
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
                    <TabsTrigger value="roles">Roles & Responsibilities</TabsTrigger>
                    <TabsTrigger value="docs">Legal Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-4">
                    {tasks.length === 0 && <p className="text-muted-foreground p-4">No tasks found. Sync seed data to get started.</p>}
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
                                        <div className="font-medium">Due: {task.dueDate instanceof Timestamp ? task.dueDate.toDate().toLocaleDateString() : 'Soon'}</div>
                                        <div className="text-muted-foreground capitalize">{task.status}</div>
                                    </div>
                                    <Button variant="outline" size="sm">View</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    {roles.length === 0 && <p className="text-muted-foreground p-4">No roles defined. Sync seed data to get started.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role) => (
                            <RoleCard key={role.id} role={role} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="docs" className="space-y-4">
                    {docs.length === 0 && <p className="text-muted-foreground p-4">No documents found. Sync seed data to get started.</p>}
                    {docs.map((doc, i) => (
                        <Card key={i}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 rounded-lg">
                                        <FileText className="h-6 w-6 text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{doc.title}</h3>
                                        <p className="text-sm text-muted-foreground">Version {doc.version} • Updated {doc.lastUpdated instanceof Timestamp ? doc.lastUpdated.toDate().toLocaleDateString() : 'Recently'}</p>
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
