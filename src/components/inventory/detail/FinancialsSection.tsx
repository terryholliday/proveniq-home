'use client';

import { useState } from 'react';
import { InventoryItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { ExternalLink, Receipt } from 'lucide-react';
import { Section, Field } from './Section';

interface FinancialsSectionProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function FinancialsSection({ item, onUpdate }: FinancialsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(item.purchasePrice?.toString() || '');
  const [date, setDate] = useState(item.purchaseDate || '');

  const handleSave = () => {
    onUpdate({ 
      purchasePrice: price ? parseFloat(price) : undefined,
      purchaseDate: date || undefined
    });
    setIsEditing(false);
  };

  return (
    <Section title="Financials" isEditing={isEditing} onEditToggle={setIsEditing} onSave={handleSave}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Purchase Price">
          {isEditing ? (
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 199.99"/>
          ) : (
            <p className="font-semibold text-lg text-foreground">{item.purchasePrice ? `$${item.purchasePrice.toLocaleString()}` : 'N/A'}</p>
          )}
        </Field>
        <Field label="Purchase Date">
          {isEditing ? (
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          ) : (
            <p className="font-semibold text-lg text-foreground">{item.purchaseDate || 'N/A'}</p>
          )}
        </Field>
      </div>
      {item.receiptUrl && !isEditing && (
        <div className="mt-4 pt-4 border-t">
            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Receipt size={16} /> View Attached Receipt <ExternalLink size={14} className="text-muted-foreground"/>
            </a>
        </div>
      )}
    </Section>
  );
}
