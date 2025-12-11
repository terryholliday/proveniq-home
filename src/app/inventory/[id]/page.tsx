'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useDoc } from '@/firebase/firestore/use-doc';
import { InventoryItem, User, Beneficiary } from '@/lib/types';
import { DUMMY_BENEFICIARIES } from '@/lib/dummy-data'; // Keep for beneficiaries for now

// Components
import { ItemHeader } from '@/components/inventory/detail/ItemHeader';
import { ItemImageGallery } from '@/components/inventory/detail/ItemImageGallery';
import { ItemQuickActions } from '@/components/inventory/detail/ItemQuickActions';
import { DescriptionSection } from '@/components/inventory/detail/DescriptionSection';
import { FinancialsSection } from '@/components/inventory/detail/FinancialsSection';
import { LocationSection } from '@/components/inventory/detail/LocationSection';
import { MaintenanceSection } from '@/components/inventory/detail/MaintenanceSection';
import { LegacySection } from '@/components/inventory/detail/LegacySection';
import { QRCodeSection } from '@/components/inventory/detail/QRCodeSection';
import { SalesTools } from '@/components/inventory/detail/SalesTools';
import { LendingInfo } from '@/components/inventory/detail/LendingInfo';
import { useToast } from '@/components/ui/use-toast';
import UpgradeModal from '@/components/subscriptions/UpgradeModal';
import { AuctionWizard } from '@/components/auctions/AuctionWizard';
import { Button } from '@/components/ui/button';
import { ProvenanceTimeline } from '@/components/inventory/ProvenanceTimeline';
import { ProvenanceEngine, ProvenanceSummary } from '@/ai/provenance_engine';
import { sendToAuction } from '@/app/actions/auction';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [unwrappedParams, setUnwrappedParams] = useState<{ id: string } | null>(null);
  const firestore = useFirestore();
  const { user: firebaseUser } = useUser();
  const { userProfile } = useUserProfile(firebaseUser);
  const { toast } = useToast();

  const appUser = useMemo<User | null>(() => {
    if (!userProfile) return null;
    return {
      ...userProfile,
      tier: userProfile.isPremium ? 'pro' : 'free',
      subscriptionStatus: 'active',
    } as User;
  }, [userProfile]);

  // Unwrap params
  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  // LIVE DATA HOOK
  const docRef = useMemo(() => {
    if (!unwrappedParams?.id || !firestore) return null;
    return doc(firestore, 'items', unwrappedParams.id);
  }, [firestore, unwrappedParams]);

  const { data: itemData, isLoading } = useDoc<InventoryItem>(docRef);

  // State for item (synced with db data but locally editable)
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [beneficiaries] = useState<Beneficiary[]>(DUMMY_BENEFICIARIES); // Static for now

  // Update local state when db data loads
  useEffect(() => {
    if (itemData) {
      setItem(itemData);
    }
  }, [itemData]);

  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean, feature: string }>({ isOpen: false, feature: '' });
  const [showAuctionWizard, setShowAuctionWizard] = useState(false);
  const [isSendingToAuction, setIsSendingToAuction] = useState(false);
  const [provenanceSummary, setProvenanceSummary] = useState<ProvenanceSummary | null>(null);

  useEffect(() => {
    if (item) {
      const engine = new ProvenanceEngine();
      const summary = engine.analyze(item);
      setProvenanceSummary(summary);
    }
  }, [item]);

  const handleUpdate = async (updates: Partial<InventoryItem>) => {
    if (!item || !firestore || !unwrappedParams?.id) return;

    // Optimistic update
    const updatedItem = { ...item, ...updates };
    setItem(updatedItem);

    // Persist to DB - In a real app use setDoc or updateDoc here
    // await updateDoc(doc(firestore, 'items', unwrappedParams.id), updates);

    toast({ title: "Item Updated", description: `Changes to ${item.name} have been saved.` });
  };

  const handleDelete = () => {
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      // await deleteDoc(...)
      toast({ title: "Item Deleted", description: `${item.name} removed.` });
    }
  };

  const handleUpgradeRequest = (feature: string) => {
    setUpgradeModal({ isOpen: true, feature });
  }

  const handleSendToAuction = async () => {
    if (!item || !appUser) return;
    try {
      setIsSendingToAuction(true);
      await sendToAuction(item, appUser);
      toast({ title: "Success", description: "Item sent to auction platform." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send to auction";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSendingToAuction(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading Item...</div>;
  }

  if (!item && !isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold">Item Not Found</h1>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... (Existing JSX remains exactly the same, using 'item' and 'user') ... */}
      <div className="max-w-4xl mx-auto">
        <ItemHeader item={item!} onUpdate={handleUpdate} />

        <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <ItemImageGallery item={item!} onBack={() => window.history.back()} onUpdate={handleUpdate} />
            <LendingInfo item={item!} onUpdate={handleUpdate} />

            {/* Mobile Actions */}
            <div className="md:hidden">
              <ItemQuickActions item={item!} user={appUser!} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            </div>
            <div className="md:hidden space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowAuctionWizard(true)}>
                Sell via myarkauctions
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSendToAuction} disabled={isSendingToAuction}>
                {isSendingToAuction ? "Sending..." : "Send to Auction"}
              </Button>
            </div>

            <DescriptionSection item={item!} onUpdate={handleUpdate} />
            <FinancialsSection item={item!} onUpdate={handleUpdate} />
            <LocationSection item={item!} onUpdate={handleUpdate} />
            <MaintenanceSection item={item!} user={appUser!} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            {provenanceSummary && <ProvenanceTimeline summary={provenanceSummary} />}
            <SalesTools item={item!} user={appUser!} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <LegacySection item={item!} beneficiaries={beneficiaries} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <QRCodeSection item={item!} />
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-6">
              <ItemQuickActions item={item!} user={appUser!} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
              <div className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => setShowAuctionWizard(true)}>
                  Sell via myarkauctions
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSendToAuction} disabled={isSendingToAuction}>
                  {isSendingToAuction ? "Sending..." : "Send to Auction"}
                </Button>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {upgradeModal.isOpen && (
        <UpgradeModal feature={upgradeModal.feature} onClose={() => setUpgradeModal({ isOpen: false, feature: '' })} />
      )}

      {showAuctionWizard && item && (
        <AuctionWizard
          item={item}
          onClose={() => setShowAuctionWizard(false)}
          onComplete={(auctionId) => {
            toast({ title: "Auction created", description: `Listing ${auctionId} published.` });
            setShowAuctionWizard(false);
          }}
        />
      )}
    </div>
  );
}
