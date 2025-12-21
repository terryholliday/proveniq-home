'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
import { collection, query, where, orderBy, getFirestore } from 'firebase/firestore';
import { AuctionListing } from '@/lib/auction-types';
import { logAuctionListViewed } from '@/lib/analytics';
import { LiveBidTicker } from '@/components/auctions/LiveBidTicker';

export default function AuctionsPage() {
  const { user } = useUser();
  const firestore = getFirestore();

  useEffect(() => {
    logAuctionListViewed();
  }, []);

  const auctionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'auctions'),
      where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: auctions, isLoading: loading, error } = useCollection<AuctionListing>(auctionsQuery);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in to view your auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">You need to be authenticated to fetch your listings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">PROVENIQ Home Listings</h1>
          <p className="text-sm text-muted-foreground">Real-time view of your active listings.</p>
        </div>
        <Link href="/inventory">
          <Button variant="secondary">Back to Inventory</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to live auction feed...
        </div>
      )}
      {error && <p className="text-sm text-red-600 mb-4">{error instanceof Error ? error.message : 'Failed to load auctions'}</p>}

      {!loading && !error && (!auctions || auctions.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No auctions yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start from an item detail page and click "Sell via PROVENIQ Bids" to publish your first listing.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {auctions?.map((auction) => (
          <Card key={auction.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{auction.title}</CardTitle>
              <Badge variant={auction.status === 'live' ? 'default' : 'secondary'}>{auction.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">{auction.description}</p>
              <div className="flex gap-4 text-sm">
                <LiveBidTicker
                  currentBid={auction.currentBid ?? auction.startingBid}
                  previousBid={auction.startingBid}
                />
                <div>
                  <span className="text-muted-foreground">Starts:</span>{' '}
                  <span>{auction.startsAt ? new Date(auction.startsAt).toLocaleString() : 'TBD'}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Ends:</span>{' '}
                <span>{auction.endsAt ? new Date(auction.endsAt).toLocaleString() : 'TBD'}</span>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                  <span>Est. Tax (FL 7%):</span>
                  <span className="font-mono font-medium">
                    ${((auction.currentBid ?? auction.startingBid) * 0.07).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  *Tax is estimated based on Florida state rates. Final tax may vary by location.
                </p>
              </div>

              {auction.id && (
                <Button variant="link" asChild className="px-0 mt-2">
                  <Link href={`/auctions/${auction.id}`} target="_blank">
                    View Live Auction &rarr;
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
