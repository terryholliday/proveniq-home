'use client';

import { useState, useEffect } from 'react';
import { LeadershipAgent, LeadershipAgentWithSource, PHASE_0_AGENTS, PHASE_3_AGENTS } from '@/types/leadership-agent';
import { AgentCard } from './AgentCard';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Briefcase, Shield } from 'lucide-react';

export function LeadershipDashboard() {
    const [agents, setAgents] = useState<LeadershipAgentWithSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAgents() {
            try {
                const loadedAgents: LeadershipAgentWithSource[] = [];

                // Load Phase 0 agents
                for (const agentFile of PHASE_0_AGENTS) {
                    try {
                        const response = await fetch(`/leadership/${agentFile}.json`);
                        if (response.ok) {
                            const data: LeadershipAgent = await response.json();
                            loadedAgents.push({
                                ...data,
                                source: 'phase-0',
                                fileName: agentFile
                            });
                        }
                    } catch (err) {
                        console.error(`Failed to load ${agentFile}:`, err);
                    }
                }

                // Load Phase 3 agents
                for (const agentFile of PHASE_3_AGENTS) {
                    try {
                        const response = await fetch(`/phase-3/leadership/${agentFile}.json`);
                        if (response.ok) {
                            const data: LeadershipAgent = await response.json();
                            loadedAgents.push({
                                ...data,
                                source: 'phase-3',
                                fileName: agentFile
                            });
                        }
                    } catch (err) {
                        console.error(`Failed to load ${agentFile}:`, err);
                    }
                }

                setAgents(loadedAgents);
                setLoading(false);
            } catch (err) {
                console.error('Error loading agents:', err);
                setError('Failed to load leadership agents');
                setLoading(false);
            }
        }

        loadAgents();
    }, []);

    const phase0Agents = agents.filter(a => a.phase === 0);
    const phase3Agents = agents.filter(a => a.phase === 3);
    const ceoAgent = agents.find(a => a.agent_name === 'CEO');

    const filteredPhase0 = phase0Agents.filter(agent =>
        agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPhase3 = phase3Agents.filter(agent =>
        agent.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading leadership agents...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-destructive">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Leadership Dashboard"
                description="Track all leadership roles, responsibilities, and deliverables across the MyARK ecosystem."
            />

            <div className="container py-8 space-y-8">
                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Total Agents</h3>
                        </div>
                        <p className="text-3xl font-bold">{agents.length}</p>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-5 w-5 text-purple-500" />
                            <h3 className="font-semibold">Phase 0</h3>
                        </div>
                        <p className="text-3xl font-bold">{phase0Agents.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Strategic Foundation</p>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                            <h3 className="font-semibold">Phase 3</h3>
                        </div>
                        <p className="text-3xl font-bold">{phase3Agents.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Early Scale</p>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-green-500" />
                            <h3 className="font-semibold">Dependencies</h3>
                        </div>
                        <p className="text-3xl font-bold">
                            {new Set(agents.flatMap(a => a.dependencies)).size}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Unique Roles</p>
                    </div>
                </div>

                {/* CEO Highlight */}
                {ceoAgent && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">Your Role</h2>
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                Primary Leadership
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1">
                            <AgentCard agent={ceoAgent} isHighlighted={true} />
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents by name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Agents by Phase */}
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">All Agents</TabsTrigger>
                        <TabsTrigger value="phase0">Phase 0 ({phase0Agents.length})</TabsTrigger>
                        <TabsTrigger value="phase3">Phase 3 ({phase3Agents.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-8">
                        {/* Phase 0 Section */}
                        {filteredPhase0.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-purple-500" />
                                    <h2 className="text-xl font-bold">Phase 0 - Strategic Foundation</h2>
                                    <Badge variant="outline" className="border-purple-500 text-purple-500">
                                        {filteredPhase0.length} agents
                                    </Badge>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredPhase0.filter(a => a.agent_name !== 'CEO').map((agent) => (
                                        <AgentCard key={agent.fileName} agent={agent} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Phase 3 Section */}
                        {filteredPhase3.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-500" />
                                    <h2 className="text-xl font-bold">Phase 3 - Early Scale & Proof of Value</h2>
                                    <Badge variant="outline" className="border-blue-500 text-blue-500">
                                        {filteredPhase3.length} agents
                                    </Badge>
                                </div>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredPhase3.map((agent) => (
                                        <AgentCard key={agent.fileName} agent={agent} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="phase0">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPhase0.filter(a => a.agent_name !== 'CEO').map((agent) => (
                                <AgentCard key={agent.fileName} agent={agent} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="phase3">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPhase3.map((agent) => (
                                <AgentCard key={agent.fileName} agent={agent} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
