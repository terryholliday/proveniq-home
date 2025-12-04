import { InventoryItem, PackingPlan } from '@/lib/types';

export async function generatePackingPlan(items: InventoryItem[]): Promise<PackingPlan> {
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay

  const groups = [];
  const locations = Array.from(new Set(items.map(i => i.location)));

  for (const loc of locations) {
    const itemsInLoc = items.filter(i => i.location === loc);
    if (itemsInLoc.length > 0) {
      groups.push({
        id: `group-${Date.now()}-${loc}`,
        name: `${loc} Items`,
        reason: `Items found in ${loc}`,
        itemIds: itemsInLoc.map(i => i.id),
        // Compatibility
        groupName: `${loc} Items`,
        reasoning: `Items found in ${loc}`,
        itemNames: itemsInLoc.map(i => i.name),
      });
    }
  }

  return {
    groups,
    priority: [],
    declutter: []
  };
}
