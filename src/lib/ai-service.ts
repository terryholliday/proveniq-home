import { InventoryItem } from "./types";

const conditionFactor = (condition?: InventoryItem["condition"]) => {
  switch (condition) {
    case "New":
      return 1.05;
    case "Used - Like New":
      return 1;
    case "Used - Good":
      return 0.9;
    case "Used - Fair":
      return 0.75;
    case "For Parts/Not Working":
      return 0.3;
    default:
      return 0.85;
  }
};

export async function generateSalesAd(item: InventoryItem) {
  const headline = `${item.name} - ${item.condition}`;
  const body = `Selling ${item.name} (${item.category}). ${item.description?.slice(0, 160)}... Well cared for, stored in ${item.location}.`;
  const price = Math.round((item.currentValue ?? item.marketValue ?? item.purchasePrice ?? 100) * 0.95);
  return `${headline}\n\n${body}\n\nAsking $${price.toLocaleString()} OBO. Pickup in ${item.location}.`;
}

export async function estimateValue(item: InventoryItem) {
  const base = item.marketValue || item.purchasePrice || 100;
  const factor = conditionFactor(item.condition);
  return Math.max(Math.round(base * factor), 10);
}

export async function reevaluateValue(
  name: string,
  description: string,
  condition: InventoryItem["condition"],
  currentValue?: number,
  purchasePrice?: number
): Promise<{ newValue: number }> {
  const baseline = currentValue ?? purchasePrice ?? 100;
  const factor = conditionFactor(condition);
  return { newValue: Math.max(Math.round(baseline * factor), 10) };
}

export async function checkMarketValue(
  item: InventoryItem
): Promise<{
  currentValue: number;
  marketTrend: "up" | "down";
  marketTrendPercentage: number;
  comparableSales: {
    title: string;
    price: number;
    url: string;
    date: string;
    source: string;
    imageUrl: string;
  }[];
}> {
  const baseline = item.currentValue ?? item.marketValue ?? item.purchasePrice ?? 100;
  const swing = Math.max(2, Math.min(12, Math.round(baseline * 0.01)));
  const direction: "up" | "down" = baseline % 2 === 0 ? "up" : "down";
  const adjusted = direction === "up" ? baseline + swing : baseline - swing;
  const comparableSales = [
    {
      title: `${item.name} - recent sale`,
      price: adjusted,
      url: "#",
      date: new Date().toISOString(),
      source: "Marketplace",
      imageUrl: item.imageUrl,
    },
  ];
  return {
    currentValue: Math.max(adjusted, 10),
    marketTrend: direction,
    marketTrendPercentage: (swing / baseline) * 100,
    comparableSales,
  };
}
