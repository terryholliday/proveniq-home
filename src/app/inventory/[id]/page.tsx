'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { DUMMY_ITEMS, DUMMY_USERS, DUMMY_BENEFICIARIES } from '@/lib/dummy-data';
import { InventoryItem, User, Beneficiary } from '@/lib/types';
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
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [upgradeModal, setUpgradeModal] = useState<{ isOpen: boolean, feature: string }>({ isOpen: false, feature: '' });
  const [showAuctionWizard, setShowAuctionWizard] = useState(false);
  const [isSendingToAuction, setIsSendingToAuction] = useState(false);

  useEffect(() => {
    params.then(setUnwrappedParams);
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams) return;
    const foundItem = DUMMY_ITEMS.find(i => i.id === unwrappedParams.id);
    setItem(foundItem || null);
    setUser(DUMMY_USERS[0]); // Mock current user
    setBeneficiaries(DUMMY_BENEFICIARIES); // Mock beneficiaries
    setLoading(false);
  }, [unwrappedParams]);

  const [provenanceSummary, setProvenanceSummary] = useState<ProvenanceSummary | null>(null);

  useEffect(() => {
    if (item) {
      const engine = new ProvenanceEngine();
      const summary = engine.analyze(item);
      setProvenanceSummary(summary);
    }
  }, [item]);

  const handleUpdate = (updates: Partial<InventoryItem>) => {
    if (!item) return;
    const updatedItem = { ...item, ...updates };
    setItem(updatedItem);
    // Here you would typically also make an API call to persist the changes
    toast({ title: "Item Updated", description: `Changes to ${item.name} have been saved.` });
  };

  const handleDelete = () => {
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
      // Here you would make an API call to delete the item
      toast({ title: "Item Deleted", description: `${item.name} has been removed from your inventory.` });
      // Redirect or update UI state after deletion
      // For now, we'll just log it
      console.log("Item deleted");
    }
  };

  const handleUpgradeRequest = (feature: string) => {
    setUpgradeModal({ isOpen: true, feature });
  }

  const handleSendToAuction = async () => {
    if (!item || !user) return;
    try {
      setIsSendingToAuction(true);
      await sendToAuction(item, user);
      toast({ title: "Success", description: "Item sent to auction platform." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingToAuction(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with a proper skeleton loader
  }

  if (!item || !user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ItemHeader item={item} onUpdate={handleUpdate} />

        <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <ItemImageGallery item={item} onBack={() => window.history.back()} onUpdate={handleUpdate} />
            <LendingInfo item={item} onUpdate={handleUpdate} />
            <div className="md:hidden">
              <ItemQuickActions item={item} user={user} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            </div>
            <div className="md:hidden space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setShowAuctionWizard(true)}>
                Sell via myarkauctions
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendToAuction}
                disabled={isSendingToAuction}
              >
                {isSendingToAuction ? "Sending..." : "Send to Auction"}
              </Button>
            </div>
            <DescriptionSection item={item} onUpdate={handleUpdate} />
            <FinancialsSection item={item} onUpdate={handleUpdate} />
            <LocationSection item={item} onUpdate={handleUpdate} />
            <MaintenanceSection item={item} user={user} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            {provenanceSummary && <ProvenanceTimeline summary={provenanceSummary} />}
            <SalesTools item={item} user={user} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <LegacySection item={item} beneficiaries={beneficiaries} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <QRCodeSection item={item} />
          </div>
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-6">
              <ItemQuickActions item={item} user={user} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
              <div className="space-y-2">
                <Button variant="secondary" className="w-full" onClick={() => setShowAuctionWizard(true)}>
                  Sell via myarkauctions
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSendToAuction}
                  disabled={isSendingToAuction}
                >
                  {isSendingToAuction ? "Sending..." : "Send to Auction"}
                </Button>
              </div>
            </div>
          </aside>
        </main>
      </div>
      {upgradeModal.isOpen && (
        <UpgradeModal
          feature={upgradeModal.feature}
          onClose={() => setUpgradeModal({ isOpen: false, feature: '' })}
        />
      )}
      {showAuctionWizard && (
        <AuctionWizard
          item={item}
          onClose={() => setShowAuctionWizard(false)}
          onComplete={(auctionId) => {
            toast({ title: "Auction created", description: `Listing ${auctionId} published via myarkauctions.` });
            setShowAuctionWizard(false);
          }}
        />
      )}
    </div>
  );
}
