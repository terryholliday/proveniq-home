'use client';

import { useState, useEffect, useTransition } from 'react';
import type { InventoryItem } from '@/lib/types';
import { mockInventory } from '@/lib/data';
import { ItemCard } from './item-card';
import { aiSearchInventory } from '@/ai/flows/ai-search-inventory';
import { Skeleton } from '../ui/skeleton';

export function ItemList() {
    const [, startTransition] = useTransition();
    const [items, setItems] = useState<InventoryItem[]>(mockInventory);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;

        const handleSearch = (e: Event) => {
            const query = (e.target as HTMLInputElement).value;
            if (query.trim() === '') {
                setItems(mockInventory);
                return;
            }

            startTransition(async () => {
                setIsSearching(true);
                const results = await aiSearchInventory({
                    query: query,
                    inventoryData: JSON.stringify(mockInventory),
                });
                setItems(results as InventoryItem[]);
                setIsSearching(false);
            });
        };
        
        // Use keyup for a more responsive feel
        searchInput?.addEventListener('keyup', handleSearch);

        return () => {
            searchInput?.removeEventListener('keyup', handleSearch);
        };
    }, []);

    const displayItems = isSearching ? Array(8).fill(null) : items;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {displayItems.map((item, index) =>
                item ? (
                    <ItemCard key={item.id} item={item} />
                ) : (
                    <div key={index} className="flex flex-col space-y-3">
                        <Skeleton className="h-[225px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
