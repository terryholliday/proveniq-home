'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle, Clock, FileText, ShoppingBag, BarChart3 } from 'lucide-react';
import { ProvenanceTimelineItem } from '@/ai/provenance_engine';

interface ProvenanceTimelineProps {
    timeline: ProvenanceTimelineItem[];
    className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
    acquisition: <ShoppingBag className="h-4 w-4" />,
    ownership_change: <FileText className="h-4 w-4" />,
    market_valuation: <BarChart3 className="h-4 w-4" />,
    other: <Clock className="h-4 w-4" />,
};

export function ProvenanceTimeline({ timeline, className }: ProvenanceTimelineProps) {
    if (!timeline || timeline.length === 0) {
        return (
            <div className={cn('flex flex-col items-center justify-center py-8 text-muted-foreground', className)}>
                <Clock className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No provenance history recorded</p>
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
                {timeline.map((item, index) => (
                    <div key={`${item.date}-${index}`} className="relative flex gap-4">
                        {/* Icon circle */}
                        <div
                            className={cn(
                                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                                item.gap
                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                    : item.verified
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted-foreground/30 bg-background text-muted-foreground'
                            )}
                        >
                            {item.gap ? (
                                <AlertTriangle className="h-4 w-4" />
                            ) : item.verified ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                typeIcons[item.type] || <Clock className="h-4 w-4" />
                            )}
                        </div>

                        {/* Content */}
                        <div
                            className={cn(
                                'flex-1 rounded-lg border p-4',
                                item.gap
                                    ? 'border-destructive/50 bg-destructive/5'
                                    : 'border-border bg-card'
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4
                                        className={cn(
                                            'font-semibold',
                                            item.gap ? 'text-destructive' : 'text-foreground'
                                        )}
                                    >
                                        {item.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {item.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDate(item.date)}
                                    </time>
                                    {item.verified && !item.gap && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                            <Check className="h-3 w-3" />
                                            Verified
                                        </span>
                                    )}
                                    {item.gap && item.gapDurationYears && (
                                        <span className="text-xs font-medium text-destructive">
                                            {item.gapDurationYears.toFixed(1)} year gap
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
}

export default ProvenanceTimeline;
