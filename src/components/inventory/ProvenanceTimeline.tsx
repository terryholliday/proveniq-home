'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, AlertCircle, Circle, ShieldCheck } from 'lucide-react';
import { ProvenanceSummary, ProvenanceTimelineItem } from '@/ai/provenance_engine';
import { cn } from '@/lib/utils';

interface ProvenanceTimelineProps {
    summary: ProvenanceSummary;
    className?: string;
}

export function ProvenanceTimeline({ summary, className }: ProvenanceTimelineProps) {
    const { timeline, merkleRoot, confidenceScore, gapDetected } = summary;

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Provenance History</CardTitle>
                <div className="flex items-center gap-2">
                    {merkleRoot && (
                        <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600 bg-green-50">
                            <ShieldCheck className="h-3 w-3" />
                            TrueLedger Verified
                        </Badge>
                    )}
                    <Badge variant={confidenceScore > 70 ? "default" : "secondary"}>
                        Confidence: {confidenceScore}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {merkleRoot && (
                    <div className="mb-4 p-2 bg-slate-50 rounded text-xs font-mono text-slate-500 break-all border border-slate-100">
                        <span className="font-semibold text-slate-700">Merkle Root:</span> {merkleRoot}
                    </div>
                )}

                {gapDetected && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-start gap-2 text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                        <p>Gaps detected in ownership history. Some events may be missing.</p>
                    </div>
                )}

                <ScrollArea className="h-[400px] pr-4">
                    <div className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
                        {timeline.map((item, index) => (
                            <TimelineItem key={index} item={item} />
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function TimelineItem({ item }: { item: ProvenanceTimelineItem }) {
    const isGap = item.gap;

    return (
        <div className="relative pl-6">
            {/* Dot indicator */}
            <div className={cn(
                "absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 bg-white",
                isGap ? "border-yellow-400 bg-yellow-50" : "border-slate-300",
                item.verified && "border-green-500 bg-green-500"
            )} />

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.verified && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                        {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <p className="text-sm text-slate-600">{item.description}</p>

                {isGap && item.gapDurationYears && (
                    <Badge variant="outline" className="w-fit mt-1 text-yellow-700 border-yellow-200 bg-yellow-50">
                        {item.gapDurationYears.toFixed(1)} year gap
                    </Badge>
                )}
            </div>
        </div>
    );
}
