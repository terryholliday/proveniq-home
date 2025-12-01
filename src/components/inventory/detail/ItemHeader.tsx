'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/lib/types';
import { getCategories } from '@/lib/item-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, HandCoins, Tag } from 'lucide-react';

interface ItemHeaderProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
}

export function ItemHeader({ item, onUpdate }: ItemHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editCategory, setEditCategory] = useState(item.category || '');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    setEditName(item.name);
    setEditCategory(item.category || '');
    setAvailableCategories(getCategories());
  }, [item]);

  const handleSave = () => {
    onUpdate({ name: editName, category: editCategory });
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div className="space-y-2 p-3 bg-muted border rounded-xl animate-fade-in">
          <Input 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)} 
            className="text-2xl font-bold h-auto p-1" 
          />
          <div className="flex gap-2 items-center">
            <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                    {availableCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X className="h-4 w-4"/></Button>
            <Button size="icon" variant="ghost" onClick={handleSave}><Save className="h-4 w-4 text-green-600"/></Button>
          </div>
        </div>
      ) : (
        <div className="group">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {item.category && (
              <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <Tag size={12}/> {item.category}
              </span>
            )}
            {item.isLent && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                <HandCoins size={12}/> Lent Out
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight flex items-center gap-2">
            {item.name}
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4"/>
            </Button>
          </h1>
        </div>
      )}
    </div>
  );
}