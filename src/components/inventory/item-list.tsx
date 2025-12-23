'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { InventoryItem } from '@/lib/types';
import { ItemCard } from './item-card';
import { aiSearchInventory } from '@/ai/flows/ai-search-inventory';
import { Skeleton } from '../ui/skeleton';
import { collection } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Loader2 } from 'lucide-react';

export function ItemList() {
    const [, startTransition] = useTransition();
    const { user } = useUser();
    const firestore = useFirestore();
    const [searchResults, setSearchResults] = useState<InventoryItem[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch items from Firestore
    const itemsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return collection(firestore, 'items');
    }, [firestore, user]);

    const { data: itemsData, isLoading: itemsLoading } = useCollection<InventoryItem>(itemsQuery);
    const firestoreItems = itemsData ?? [];
    
    // Filter to user's items
    const userItems = useMemo(() => {
        return firestoreItems.filter(item => item.userId === user?.uid || !item.userId);
    }, [firestoreItems, user]);

    // Use search results if available, otherwise use Firestore items
    const items = searchResults ?? userItems;

    useEffect(() => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;

        const handleSearch = (e: Event) => {
            const query = (e.target as HTMLInputElement).value;
            if (query.trim() === '') {
                setSearchResults(null);
                return;
            }

            startTransition(async () => {
                setIsSearching(true);
                const results = await aiSearchInventory({
                    query: query,
                    inventoryData: JSON.stringify(userItems),
                });
                setSearchResults(results as InventoryItem[]);
                setIsSearching(false);
            });
        };
        
        // Use keyup for a more responsive feel
        searchInput?.addEventListener('keyup', handleSearch);

        return () => {
            searchInput?.removeEventListener('keyup', handleSearch);
        };
    }, [userItems]);

    // Show loading state
    if (itemsLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show empty state
    if (items.length === 0 && !isSearching) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">No items in your inventory yet.</p>
                <p className="text-sm text-muted-foreground">Click "Add New Item" to get started.</p>
            </div>
        );
    }

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
