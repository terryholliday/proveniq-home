'use client';

import React, { useState, useCallback } from 'react';
import { Share2, Copy, Check, Twitter, Facebook, Mail, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ShareAuctionProps {
    auctionId: string;
    title: string;
    description?: string;
    currentBid?: number;
    imageUrl?: string;
}

interface ShareLink {
    platform: 'twitter' | 'facebook' | 'email' | 'copy';
    icon: React.ElementType;
    label: string;
    color: string;
    getUrl: (baseUrl: string, title: string, description: string) => string;
}

const SHARE_LINKS: ShareLink[] = [
    {
        platform: 'twitter',
        icon: Twitter,
        label: 'Twitter / X',
        color: 'hover:bg-black hover:text-white',
        getUrl: (baseUrl, title, description) =>
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${title} - ${description}`
            )}&url=${encodeURIComponent(baseUrl)}`,
    },
    {
        platform: 'facebook',
        icon: Facebook,
        label: 'Facebook',
        color: 'hover:bg-blue-600 hover:text-white',
        getUrl: (baseUrl) =>
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`,
    },
    {
        platform: 'email',
        icon: Mail,
        label: 'Email',
        color: 'hover:bg-gray-600 hover:text-white',
        getUrl: (baseUrl, title, description) =>
            `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
                `${description}\n\nView auction: ${baseUrl}`
            )}`,
    },
];

/**
 * Generate a deep link URL for an auction
 */
export function generateAuctionDeepLink(auctionId: string): string {
    // In production, this would be the actual domain
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://proveniq.app';

    return `${baseUrl}/auctions/${auctionId}?ref=share`;
}

/**
 * Track share events for analytics
 */
async function trackShareEvent(
    auctionId: string,
    platform: string,
    userId?: string
): Promise<void> {
    // Analytics tracking - integrate with your analytics service
    console.log('Share event:', { auctionId, platform, userId, timestamp: new Date() });

    // In production, you'd call your analytics API here
    // await fetch('/api/analytics/share', { method: 'POST', body: JSON.stringify({ auctionId, platform }) });
}

export function ShareAuctionButton({
    auctionId,
    title,
    description,
    currentBid,
}: ShareAuctionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const deepLink = generateAuctionDeepLink(auctionId);
    const shareDescription = description || `Current bid: $${currentBid?.toLocaleString() || 'N/A'}`;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(deepLink);
            setCopied(true);
            trackShareEvent(auctionId, 'copy');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }, [deepLink, auctionId]);

    const handleShare = useCallback(
        (link: ShareLink) => {
            const url = link.getUrl(deepLink, title, shareDescription);
            trackShareEvent(auctionId, link.platform);

            if (link.platform === 'email') {
                window.location.href = url;
            } else {
                window.open(url, '_blank', 'width=600,height=400');
            }
        },
        [deepLink, title, shareDescription, auctionId]
    );

    // Use native share if available
    const handleNativeShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: shareDescription,
                    url: deepLink,
                });
                trackShareEvent(auctionId, 'native');
            } catch (err) {
                // User cancelled or error
                console.log('Share cancelled or failed:', err);
            }
        }
    }, [title, shareDescription, deepLink, auctionId]);

    // Check if native share is available
    const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Auction</DialogTitle>
                    <DialogDescription>
                        Share this auction with friends and collectors
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Auction Preview */}
                    <div className="rounded-lg border p-4 space-y-2">
                        <h3 className="font-semibold text-sm">{title}</h3>
                        {currentBid && (
                            <p className="text-lg font-bold text-primary">
                                ${currentBid.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        {hasNativeShare && (
                            <Button
                                variant="outline"
                                className="col-span-2 gap-2"
                                onClick={handleNativeShare}
                            >
                                <Share2 className="h-4 w-4" />
                                Share via Device
                            </Button>
                        )}

                        {SHARE_LINKS.map((link) => (
                            <Button
                                key={link.platform}
                                variant="outline"
                                className={cn('gap-2 transition-colors', link.color)}
                                onClick={() => handleShare(link)}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Button>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm truncate">
                            {deepLink}
                        </div>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleCopy}
                            className="shrink-0"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Compact share button for lists
 */
export function ShareAuctionIconButton({ auctionId, title }: Pick<ShareAuctionProps, 'auctionId' | 'title'>) {
    const handleQuickShare = useCallback(async () => {
        const deepLink = generateAuctionDeepLink(auctionId);

        if (navigator.share) {
            try {
                await navigator.share({ title, url: deepLink });
                trackShareEvent(auctionId, 'native');
            } catch {
                // Fallback to copy
                await navigator.clipboard.writeText(deepLink);
                trackShareEvent(auctionId, 'copy');
            }
        } else {
            await navigator.clipboard.writeText(deepLink);
            trackShareEvent(auctionId, 'copy');
        }
    }, [auctionId, title]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleQuickShare}
            className="h-8 w-8"
            title="Share auction"
        >
            <Link2 className="h-4 w-4" />
        </Button>
    );
}

export default ShareAuctionButton;
