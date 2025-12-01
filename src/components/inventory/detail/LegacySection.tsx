'use client';

import { useState } from 'react';
import { InventoryItem, Beneficiary, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Section, Field } from './Section';
import { checkPermission, PERMISSIONS } from '@/lib/subscription-service';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

interface LegacySectionProps {
  item: InventoryItem;
  beneficiaries: Beneficiary[];
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onUpgradeReq: (feature: string) => void;
}

// Mock user for permission check
const mockUser: User = { id: '1', name: 'Test User', email: 'test@user.com', settings: { tier: 'pro' }};

export function LegacySection({ item, beneficiaries, onUpdate, onUpgradeReq }: LegacySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState(item.beneficiaryId || '');
  const [note, setNote] = useState(item.legacyNote || '');
  const hasPermission = checkPermission(mockUser, PERMISSIONS.LEGACY_PLANNING);

  const handleSave = () => {
    if (!hasPermission) {
        onUpgradeReq('Legacy Planning');
        return;
    }
    onUpdate({ 
      beneficiaryId: beneficiaryId || undefined,
      legacyNote: note || undefined
    });
    setIsEditing(false);
  };

  const assignedBeneficiary = beneficiaries.find(b => b.id === item.beneficiaryId);
  
  if (!hasPermission && !item.beneficiaryId && !item.legacyNote) {
      return null; 
  }

  return (
    <Section title="Legacy & Inheritance" icon={<Gift className="h-5 w-5"/>} isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave} showEditButton={hasPermission}>
      {!hasPermission && <Badge variant="secondary" className="mb-2">PRO FEATURE</Badge>}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Assigned Beneficiary">
          {isEditing && hasPermission ? (
            <Select value={beneficiaryId} onValueChange={setBeneficiaryId}>
              <SelectTrigger>
                  <SelectValue placeholder="Select a beneficiary..." />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {beneficiaries.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <p className="font-semibold text-lg text-foreground">{assignedBeneficiary?.name || 'N/A'}</p>
          )}
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Private Note for Beneficiary">
          {isEditing && hasPermission ? (
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="This is a special gift because..."/>
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap italic">{item.legacyNote || 'No private note.'}</p>
          )}
        </Field>
      </div>
    </Section>
  );
}