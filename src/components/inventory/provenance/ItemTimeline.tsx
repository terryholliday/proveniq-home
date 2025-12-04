'use client';

import { InventoryItem } from '@/lib/types';
import { ProvenanceEngine, ProvenanceTimelineItem } from '@/ai/provenance_engine';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, Circle, ArrowDown } from 'lucide-react';

interface ItemTimelineProps {
    item: InventoryItem;
}

export function ItemTimeline({ item }: ItemTimelineProps) {
    const engine = useMemo(() => new ProvenanceEngine(), []);
    const summary = useMemo(() => engine.analyze(item), [item, engine]);

    const getIcon = (type: string, verified: boolean, gap: boolean) => {
        if (gap) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        if (verified) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        return <Circle className="h-5 w-5 text-gray-400" />;
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'acquisition': return 'default';
            case 'ownership_change': return 'secondary';
            case 'appraisal': return 'outline';
            case 'repair': return 'destructive'; // Or a custom color
            default: return 'secondary';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Provenance History</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Confidence Score:</span>
                        <Badge variant={summary.confidenceScore > 70 ? 'default' : summary.confidenceScore > 40 ? 'secondary' : 'destructive'}>
                            {summary.confidenceScore}/100
                        </Badge>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{summary.narrative}</p>
            </CardHeader>
            <CardContent>
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
                    {summary.timeline.map((event, index) => (
                        <div key={index} className="ml-6 relative">
                            {/* Icon */}
                            <div className="absolute -left-[35px] bg-white p-1 rounded-full border border-gray-100">
                                {getIcon(event.type, event.verified, !!event.gap)}
                            </div>

                            {/* Content */}
                            <div className={`flex flex-col ${event.gap ? 'bg-amber-50 p-3 rounded-md border border-amber-100' : ''}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {event.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.date).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>

                                {!event.gap && (
                                    <div className="flex gap-2">
                                        <Badge variant={getBadgeVariant(event.type)} className="text-xs">
                                            {event.type.replace('_', ' ')}
                                        </Badge>
                                        {event.verified && (
                                            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {event.gap && (
                                    <div className="text-xs text-amber-700 font-medium">
                                        {event.gapDurationYears?.toFixed(1)} years unaccounted for
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {summary.timeline.length === 0 && (
                        <div className="ml-6 text-sm text-gray-500 italic">
                            No history recorded yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
