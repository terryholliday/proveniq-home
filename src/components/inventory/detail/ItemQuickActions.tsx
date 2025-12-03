'use client';

import { useState } from 'react';
import { InventoryItem, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { checkPermission, PERMISSIONS } from '@/lib/subscription-service';
import ClaimModal from '@/components/claims/ClaimModal';
import ServiceRequestModal from '@/components/service/ServiceRequestModal';
import { LendModal } from './LendModal';

interface ItemQuickActionsProps {
  item: InventoryItem;
  user: User;
  onDelete: () => void;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onUpgradeReq: (feature: string) => void;
}

export function ItemQuickActions({ item, user, onDelete, onUpdate, onUpgradeReq }: ItemQuickActionsProps) {
  const [showLendModal, setShowLendModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimType, setClaimType] = useState<'warranty' | 'ho3' | 'auto' | null>(null);

  const handleOpenClaimModal = () => {
    if (!checkPermission(user, PERMISSIONS.HO3_CLAIMS)) {
      onUpgradeReq('Insurance Claims');
      return;
    }
    const category = (item.category || '').toLowerCase();
    const isVehicle = category === 'vehicle' || category === 'vehicles' || item.vin;
    setClaimType(isVehicle ? 'auto' : 'ho3');
    setShowClaimModal(true);
  };
  
  const handleReturnItem = () => {
      if (window.confirm(`Mark item as returned from ${item.lentTo}?`)) {
          onUpdate({ isLent: false, lentTo: undefined, lentDate: undefined, expectedReturnDate: undefined });
      }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-bold">
        {item.isLent ? (
            <Button variant="outline" onClick={handleReturnItem} className="h-auto py-3 text-blue-600 border-blue-300">Mark as Returned</Button>
        ) : (
            <Button variant="outline" onClick={() => setShowLendModal(true)} className="h-auto py-3">Lend Item</Button>
        )}
        <Button variant="outline" onClick={() => setShowServiceModal(true)} className="h-auto py-3">Request Service</Button>
        <Button variant="outline" onClick={handleOpenClaimModal} className="h-auto py-3">File a Claim</Button>
        <Button variant="destructive" onClick={onDelete} className="h-auto py-3">Delete Item</Button>
      </div>

      {showLendModal && <LendModal item={item} onClose={() => setShowLendModal(false)} onUpdate={onUpdate} />}
      {showServiceModal && <ServiceRequestModal item={item} user={user} onClose={() => setShowServiceModal(false)} />}
      {showClaimModal && claimType && (
        <ClaimModal 
          items={[item]} 
          claimType={claimType} 
          onClose={() => setShowClaimModal(false)} 
        />
      )}
    </>
  );
}
