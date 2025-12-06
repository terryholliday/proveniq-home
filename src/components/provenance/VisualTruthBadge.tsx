'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export type VisualTruthStatus = 'verified' | 'tampered' | 'pending' | 'unknown';

interface VisualTruthBadgeProps {
    status: VisualTruthStatus;
    verifiedAt?: string;
    imageHash?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
};

const badgeConfig: Record<
    VisualTruthStatus,
    { icon: React.ElementType; label: string; className: string; description: string }
> = {
    verified: {
        icon: ShieldCheck,
        label: 'Verified',
        className: 'text-emerald-500',
        description: 'Image authenticity confirmed via Visual Truth',
    },
    tampered: {
        icon: ShieldAlert,
        label: 'Tampered',
        className: 'text-destructive',
        description: 'Image modification detected - may not be authentic',
    },
    pending: {
        icon: Loader2,
        label: 'Verifying',
        className: 'text-amber-500 animate-spin',
        description: 'Visual Truth verification in progress',
    },
    unknown: {
        icon: ShieldQuestion,
        label: 'Unverified',
        className: 'text-muted-foreground',
        description: 'Image has not been verified yet',
    },
};

export function VisualTruthBadge({
    status,
    verifiedAt,
    imageHash,
    className,
    size = 'md',
}: VisualTruthBadgeProps) {
    const config = badgeConfig[status];
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            'inline-flex items-center gap-1.5 cursor-help',
                            className
                        )}
                    >
                        <Icon className={cn(sizeClasses[size], config.className)} />
                        {size !== 'sm' && (
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    config.className
                                )}
                            >
                                {config.label}
                            </span>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">
                            {config.description}
                        </p>
                        {verifiedAt && (
                            <p className="text-xs text-muted-foreground">
                                Verified: {formatDateTime(verifiedAt)}
                            </p>
                        )}
                        {imageHash && (
                            <p className="text-xs font-mono text-muted-foreground truncate">
                                Hash: {imageHash.substring(0, 16)}...
                            </p>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function formatDateTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
}

/**
 * Helper to determine Visual Truth status from item data
 */
export function getVisualTruthStatus(item: {
    visualTruthVerified?: boolean;
    imageHashes?: string[];
}): VisualTruthStatus {
    if (item.visualTruthVerified === true) {
        return 'verified';
    }
    if (item.visualTruthVerified === false) {
        return 'tampered';
    }
    if (item.imageHashes && item.imageHashes.length > 0) {
        return 'pending';
    }
    return 'unknown';
}

export default VisualTruthBadge;
