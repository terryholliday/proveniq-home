'use client';

import { useState } from 'react';
import { InventoryItem, User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Section, Field } from './Section';
import { checkPermission, PERMISSIONS } from '@/lib/subscription-service';
import { Badge } from '@/components/ui/badge';

interface MaintenanceSectionProps {
  item: InventoryItem;
  user: User;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onUpgradeReq: (feature: string) => void;
}

export function MaintenanceSection({ item, user, onUpdate, onUpgradeReq }: MaintenanceSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lastDate, setLastDate] = useState(item.lastMaintenanceDate || '');
  const [nextDate, setNextDate] = useState(item.nextMaintenanceDate || '');
  const [notes, setNotes] = useState(item.maintenanceNotes || '');
  const hasPermission = checkPermission(user, PERMISSIONS.MAINTENANCE_SCHEDULES);

  const handleSave = () => {
    if (!hasPermission) {
        onUpgradeReq('Maintenance Schedules');
        return;
    }
    onUpdate({ 
      lastMaintenanceDate: lastDate || undefined,
      nextMaintenanceDate: nextDate || undefined,
      maintenanceNotes: notes || undefined
    });
    setIsEditing(false);
  };
  
  if (!hasPermission && !item.lastMaintenanceDate && !item.nextMaintenanceDate && !item.maintenanceNotes) {
      return null; // Don't show section if user has no permission and no data exists
  }

  return (
    <Section title="Maintenance" isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave} showEditButton={hasPermission}>
        {!hasPermission && <Badge variant="secondary" className="mb-2">PRO FEATURE</Badge>}
        <div className="grid md:grid-cols-2 gap-4">
            <Field label="Last Service Date">
            {isEditing && hasPermission ? (
                <Input type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} />
            ) : (
                <p className="font-semibold text-lg text-foreground">{item.lastMaintenanceDate || 'N/A'}</p>
            )}
            </Field>
            <Field label="Next Service Due">
            {isEditing && hasPermission ? (
                <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
            ) : (
                <p className="font-semibold text-lg text-foreground">{item.nextMaintenanceDate || 'N/A'}</p>
            )}
            </Field>
        </div>
        <div className="mt-4">
            <Field label="Maintenance Notes">
            {isEditing && hasPermission ? (
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Oil change, filter replacement..."/>
            ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">{item.maintenanceNotes || 'No notes.'}</p>
            )}
            </Field>
        </div>
    </Section>
  );
}
