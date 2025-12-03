'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/types';
import { getLocations } from '@/lib/item-storage';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Archive } from 'lucide-react';
import { Section } from './Section';

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
    const fetchLocations = async () => {
      const locations = await getLocations();
      setAvailableLocations(locations);
    };
    setLocation(item.location || '');
    setContainer(item.container || '');
    fetchLocations();
  }, [item]);

  const handleSave = () => {
    onUpdate({
      location: location || undefined,
      container: container || undefined
    });
    setIsEditing(false);
  };

  // Helper component for display mode
  const Field = ({ label, value, icon }: { label: string; value?: string; icon: React.ReactNode }) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</label>
      <p className="flex items-center gap-2 mt-1 font-medium">
        {icon}
        {value || <span className="text-muted-foreground italic font-normal">Not set</span>}
      </p>
    </div>
  );

  return (
    <Section
      title="Location"
      isEditing={isEditing}
      onEditToggle={setIsEditing}
      onSave={handleSave}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Container / Room</label>
            <Input
              value={container}
              onChange={e => setContainer(e.target.value)}
              placeholder="e.g., Office Closet, Shelf A-2"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Location" value={item.location} icon={<MapPin size={16} className="text-muted-foreground" />} />
          <Field label="Container" value={item.container} icon={<Archive size={16} className="text-muted-foreground" />} />
        </div>
      )}
    </Section>
  );
}
