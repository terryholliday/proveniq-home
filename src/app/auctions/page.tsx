'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { fetchMyAuctions } from '@/services/arkiveClient';
import type { AuctionListing } from '@/lib/auction-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AuctionsPage() {
  const auth = useAuth();
  const { user } = useUser();
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!auth || !user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyAuctions(auth, user.uid);
        setAuctions(data.auctions ?? data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load auctions';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth, user]);

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
          <h1 className="text-2xl font-bold">My myarkauctions Listings</h1>
          <p className="text-sm text-muted-foreground">Listings tied to your MyARK account.</p>
        </div>
        <Link href="/inventory">
          <Button variant="secondary">Back to Inventory</Button>
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your auctions...
        </div>
      )}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && !error && auctions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No auctions yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Start from an item detail page and click “Sell via myarkauctions” to publish your first listing.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {auctions.map((auction) => (
          <Card key={auction.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{auction.title}</CardTitle>
              <Badge variant="secondary">{auction.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">{auction.description}</p>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current bid:</span>{' '}
                  <span className="font-semibold">${(auction.currentBid ?? auction.startingBid).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Starts:</span>{' '}
                  <span>{auction.startsAt ? new Date(auction.startsAt).toLocaleString() : 'TBD'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ends:</span>{' '}
                  <span>{auction.endsAt ? new Date(auction.endsAt).toLocaleString() : 'TBD'}</span>
                </div>
              </div>
              {auction.id && (
                <Button variant="link" asChild className="px-0">
                  <Link href={`/auctions/${auction.id}`} target="_blank">
                    View on myarkauctions
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
