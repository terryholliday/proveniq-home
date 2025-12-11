'use client';

import { useMemo, useState } from 'react';
import { formatISO, addDays } from 'date-fns';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem } from '@/lib/types';
import { createAuctionListing } from '@/services/proveniqBidsClient';
import type { CreateAuctionInput } from '@/lib/auction-types';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

type WizardStep = 'confirm' | 'pricing' | 'review' | 'done';

interface AuctionWizardProps {
  item: InventoryItem;
  onClose: () => void;
  onComplete?: (auctionId: string) => void;
}

export function AuctionWizard({ item, onClose, onComplete }: AuctionWizardProps) {
  const auth = useAuth();
  const { user } = useUser();
  const [step, setStep] = useState<WizardStep>('confirm');
  const [title, setTitle] = useState(item.name || '');
  const [description, setDescription] = useState(item.description || '');
  const [startingBid, setStartingBid] = useState<number>(Math.max(item.marketValue || item.purchasePrice || 0, 0));
  const [reservePrice, setReservePrice] = useState<number | undefined>(undefined);
  const [durationDays, setDurationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const startsAt = useMemo(() => formatISO(new Date()), []);
  const endsAt = useMemo(() => formatISO(addDays(new Date(), durationDays)), [durationDays]);

  const proceed = async () => {
    if (step === 'confirm') return setStep('pricing');
    if (step === 'pricing') return setStep('review');
    if (step !== 'review') return;

    if (!user) {
      setError('You must be signed in to publish an auction.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CreateAuctionInput = {
        ownerUid: user.uid,
        itemId: item.id,
        title: title.trim() || item.name,
        description: description.trim() || item.description || '',
        startingBid: Math.max(0, Number(startingBid) || 0),
        reservePrice: reservePrice !== undefined ? Math.max(0, reservePrice) : undefined,
        startsAt,
        endsAt,
        exif: item.exif,
        authenticity: {
          photoVerified: Boolean(item.exif),
          geoVerified: Boolean(item.exif?.GPSLatitude && item.exif?.GPSLongitude),
        },
      };
      const res = await createAuctionListing(auth, payload);
      setCreatedId(res.auctionId);
      setStep('done');
      onComplete?.(res.auctionId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to publish auction';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Confirm item details</h3>
            <p className="text-sm text-muted-foreground">Listing will use your golden record from Proveniq Home.</p>
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-sm">Estimated value: ${((item.marketValue ?? item.purchasePrice) || 0).toLocaleString()}</p>
            </div>
            <div className="grid gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Auction Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
                <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Pricing & Timing</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Starting bid</label>
                <Input
                  type="number"
                  min={0}
                  value={startingBid}
                  onChange={(e) => setStartingBid(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Reserve price (optional)</label>
                <Input
                  type="number"
                  min={0}
                  value={reservePrice ?? ''}
                  placeholder="Leave blank for no reserve"
                  onChange={(e) => setReservePrice(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground">Duration (days)</label>
                <Input type="number" min={1} max={30} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Starts: {new Date(startsAt).toLocaleString()}</p>
                <p>Ends: {new Date(endsAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Review & Publish</h3>
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <p className="font-semibold">{title || item.name}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{description || item.description}</p>
              <p className="text-sm">Starting bid: ${Math.max(0, Number(startingBid) || 0).toLocaleString()}</p>
              {reservePrice !== undefined && <p className="text-sm">Reserve: ${Math.max(0, reservePrice).toLocaleString()}</p>}
              <p className="text-sm">Starts: {new Date(startsAt).toLocaleString()}</p>
              <p className="text-sm">Ends: {new Date(endsAt).toLocaleString()}</p>
            </div>
          </div>
        );
      case 'done':
        return (
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            <CheckCircle2 className="text-green-500" size={48} />
            <h3 className="text-xl font-bold">Auction published</h3>
            <p className="text-sm text-muted-foreground">Auction ID: {createdId}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-6 relative">
        {renderStep()}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          {step !== 'done' ? (
            <Button onClick={proceed} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {step === 'review' ? 'Publish listing' : 'Next'}
            </Button>
          ) : (
            <Button onClick={onClose}>Done</Button>
          )}
        </div>
      </div>
    </div>
  );
}
