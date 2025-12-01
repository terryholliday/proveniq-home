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

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [upgradeModal, setUpgradeModal] = useState<{isOpen: boolean, feature: string}>({ isOpen: false, feature: '' });

  useEffect(() => {
    const foundItem = DUMMY_ITEMS.find(i => i.id === params.id);
    setItem(foundItem || null);
    setUser(DUMMY_USERS[0]); // Mock current user
    setBeneficiaries(DUMMY_BENEFICIARIES); // Mock beneficiaries
    setLoading(false);
  }, [params.id]);

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
            <ItemImageGallery images={item.images || []} />
            <LendingInfo item={item} onUpdate={handleUpdate} />
            <div className="md:hidden">
                <ItemQuickActions item={item} user={user} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            </div>
            <DescriptionSection item={item} onUpdate={handleUpdate} />
            <FinancialsSection item={item} onUpdate={handleUpdate} />
            <LocationSection item={item} onUpdate={handleUpdate} />
            <MaintenanceSection item={item} user={user} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <SalesTools item={item} user={user} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <LegacySection item={item} beneficiaries={beneficiaries} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            <QRCodeSection item={item} />
          </div>
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-6">
              <ItemQuickActions item={item} user={user} onDelete={handleDelete} onUpdate={handleUpdate} onUpgradeReq={handleUpgradeRequest} />
            </div>
          </aside>
        </main>
      </div>
      {upgradeModal.isOpen && (
          <UpgradeModal 
            feature={upgradeModal.feature} 
            onClose={() => setUpgradeModal({isOpen: false, feature: ''})} 
          />
      )}
    </div>
  );
}
