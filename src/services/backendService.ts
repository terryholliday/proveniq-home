import { InventoryItem, Anomaly } from "@/lib/types";

export async function submitServiceRequest(data: {
  item: InventoryItem;
  problem: string;
  preferredDates?: string[];
}) {
  const requestId = `sr-${Date.now()}`;
  console.log("Service request submitted:", { requestId, ...data });
  return { success: true, requestId };
}

export async function generateRepairEstimate(item: InventoryItem | string, issue: string) {
  const base = typeof item === "string" ? 120 : item.marketValue ?? item.purchasePrice ?? 120;
  const severity = issue.toLowerCase().includes("crack") ? 0.35 : 0.2;
  const delta = Math.max(40, Math.round(base * severity));
  return {
    costEstimateMin: Math.max(50, delta),
    costEstimateMax: Math.max(75, delta + 100),
    commissionRate: 15,
    reasoning: `Estimate for ${typeof item === "string" ? item : item.name}: based on issue "${issue}".`,
  };
}

export async function generateBundleAd(items: InventoryItem[], platformId: string) {
  const itemNames = items.map((i) => i.name || "item").join(", ");
  const suggestedPrice = Math.max(
    50,
    items.reduce((sum, i) => sum + (i.currentValue ?? i.marketValue ?? i.purchasePrice ?? 50) * 0.5, 0)
  );
  return {
    adCopy: `Selling bundle: ${itemNames}. All items are in ${items[0]?.condition || "good"} condition. Discounted price for quick pickup on ${platformId}.`,
    suggestedPrice: Math.round(suggestedPrice),
  };
}

export async function auditRoom(
  frameImage: string,
  location: string,
  itemsInLocation: InventoryItem[],
  allItems: InventoryItem[]
): Promise<Anomaly[]> {
  // Simple heuristic: report items assigned to this location but not present, and unexpected items.
  const expected = new Set(allItems.filter((i) => i.location === location).map((i) => i.name.toLowerCase()));
  const present = new Set(itemsInLocation.map((i) => i.name.toLowerCase()));

  const missing: Anomaly[] = [...expected]
    .filter((name) => !present.has(name))
    .map((name) => ({
      type: "missing",
      itemName: name,
      description: `${name} is recorded for ${location} but not detected.`,
    }));

  const unexpected: Anomaly[] = [...present]
    .filter((name) => !expected.has(name))
    .map((name) => ({
      type: "unexpected",
      itemName: name,
      description: `${name} appears in ${location} but is not assigned there.`,
    }));

  return [...missing, ...unexpected];
}
