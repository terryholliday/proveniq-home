'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X } from 'lucide-react';
import { Section } from './Section';

interface DescriptionSectionProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function DescriptionSection({ item, onUpdate }: DescriptionSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(item.description || '');

  const handleSave = () => {
    onUpdate({ description });
    setIsEditing(false);
  };

  return (
    <Section title="Description">
      <div className="group relative">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              rows={4} 
              placeholder="Add a detailed description..."
            />
            <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground whitespace-pre-wrap">
            {item.description || "No description provided."}
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 absolute -top-1 -right-1" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4"/>
            </Button>
          </p>
        )}
      </div>
    </Section>
  );
}