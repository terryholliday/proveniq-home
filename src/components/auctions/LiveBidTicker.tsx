'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveBidTickerProps {
    currentBid: number;
    previousBid?: number;
    className?: string;
}

export function LiveBidTicker({ currentBid, previousBid, className }: LiveBidTickerProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayBid, setDisplayBid] = useState(currentBid);

    useEffect(() => {
        if (currentBid !== displayBid) {
            setIsAnimating(true);
            // Animate the number change
            const startBid = displayBid;
            const endBid = currentBid;
            const duration = 500; // ms
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

                const current = startBid + (endBid - startBid) * easedProgress;
                setDisplayBid(Math.round(current));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplayBid(endBid);
                    setTimeout(() => setIsAnimating(false), 1000);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [currentBid, displayBid]);

    const bidIncreased = previousBid !== undefined && currentBid > previousBid;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="text-muted-foreground text-sm">Current bid:</span>
            <div className="flex items-center gap-1">
                <span
                    className={cn(
                        "font-bold text-xl transition-all duration-300",
                        isAnimating && bidIncreased && "text-green-500 scale-110",
                        !isAnimating && "text-foreground"
                    )}
                >
                    ${displayBid.toLocaleString()}
                </span>
                {isAnimating && bidIncreased && (
                    <TrendingUp className="h-4 w-4 text-green-500 animate-bounce" />
                )}
            </div>
            {isAnimating && bidIncreased && (
                <span className="text-xs text-green-500 animate-pulse">
                    +${(currentBid - (previousBid || 0)).toLocaleString()}
                </span>
            )}
        </div>
    );
}
