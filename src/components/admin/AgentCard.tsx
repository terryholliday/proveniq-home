'use client';

import { LeadershipAgentWithSource } from '@/types/leadership-agent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Target, TrendingUp, Users } from 'lucide-react';

interface AgentCardProps {
    agent: LeadershipAgentWithSource;
    isHighlighted?: boolean;
}

export function AgentCard({ agent, isHighlighted = false }: AgentCardProps) {
    const phaseColor = agent.phase === 0 ? 'bg-purple-500' : 'bg-blue-500';
    const phaseLabel = agent.phase === 0 ? 'Phase 0 - Strategic' : 'Phase 3 - Operational';

    return (
        <Card className={`h-full transition-all hover:shadow-lg ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {agent.agent_name}
                            {isHighlighted && <Badge variant="default">You</Badge>}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">{agent.role}</CardDescription>
                    </div>
                    <Badge className={`${phaseColor} text-white shrink-0`}>
                        P{agent.phase}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Goals Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Goals</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {agent.goals.map((goal, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <Circle className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tasks Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Key Tasks ({agent.tasks.length})</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {agent.tasks.slice(0, 3).map((task, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span className="line-clamp-2">{task}</span>
                            </li>
                        ))}
                        {agent.tasks.length > 3 && (
                            <li className="text-xs italic">+ {agent.tasks.length - 3} more tasks...</li>
                        )}
                    </ul>
                </div>

                {/* Deliverables Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-sm">Deliverables</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        {agent.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span className="text-muted-foreground">→</span>
                                <span>{deliverable}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Dependencies */}
                {agent.dependencies.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h4 className="font-semibold text-sm">Dependencies</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {agent.dependencies.map((dep, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {dep}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Success Metrics */}
                <div className="pt-3 border-t">
                    <h4 className="font-semibold text-sm mb-2">Success Metrics</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                        {agent.success_metrics.map((metric, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                                <span>✓</span>
                                <span>{metric}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
