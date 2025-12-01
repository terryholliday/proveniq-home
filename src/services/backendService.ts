export async function submitServiceRequest(data: any) {
  console.log("Service request submitted:", data);
  return { success: true };
}

export async function generateRepairEstimate(item: any, issue: string) {
  return { min: 50, max: 150 };
}
