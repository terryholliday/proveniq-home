'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/types';
import { getLocations } from '@/lib/item-storage';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Section, Field } from './Section';

interface LocationSectionProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function LocationSection({ item, onUpdate }: LocationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [location, setLocation] = useState(item.location || '');
  const [container, setContainer] = useState(item.container || '');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
      setLocation(item.location || '');
      setContainer(item.container || '');
      setAvailableLocations(getLocations());
  }, [item]);

  const handleSave = () => {
    onUpdate({ 
      location: location || undefined,
      container: container || undefined
    });
    setIsEditing(false);
  };

  return (
    <Section title="Location &amp; Quantity" isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Location / Room">
          {isEditing ? (
             <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a room..." />
                </SelectTrigger>
                <SelectContent>
                    {availableLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    <SelectItem value="Other">Other (Specify)</SelectItem>
                </SelectContent>
            </Select>
          ) : (
            <p className="font-semibold text-lg text-foreground">{item.location || 'N/A'}</p>
          )}
        </Field>
        <Field label="Container / Box">
          {isEditing ? (
            <Input value={container} onChange={e => setContainer(e.target.value)} placeholder="e.g., Shelf, Drawer"/>
          ) : (
            <p className="font-semibold text-lg text-foreground">{item.container || 'N/A'}</p>
          )}
        </Field>
         {/* Add Quantity editing if needed */}
      </div>
    </Section>
  );
}