export async function submitServiceRequest(data: any) {
  console.log("Service request submitted:", data);
  return { success: true };
}

export async function generateRepairEstimate(item: any, issue: string) {
  return {
    costEstimateMin: 50,
    costEstimateMax: 150,
    commissionRate: 15,
    reasoning: `Estimated repair cost for ${item} based on description: ${issue}`
  };
}

export async function generateBundleAd(items: any[], platformId: string) {
  const itemNames = items.map((i) => i.name || 'item').join(', ');
  return {
    adCopy: `Listing ${itemNames} on ${platformId}. Great condition, priced to move!`,
    suggestedPrice: Math.max(50, items.length * 25)
  };
}

export async function auditRoom(
  frameImage: string,
  location: string,
  itemsInLocation: any[],
  allItems: any[]
) {
  // Stubbed room audit that returns no anomalies.
  return [];
}
