export const PERMISSIONS = {
  HO3_CLAIMS: 'ho3_claims',
  INVENTORY_UNLIMITED: 'inventory_unlimited',
  AI_ASSISTANT: 'ai_assistant',
  MOVE_AI: 'move_ai',
  LEGACY_PLANNING: 'legacy_planning',
  MAINTENANCE_SCHEDULES: 'maintenance_schedules',
  SALES_ADS: 'sales_ads',
};

export function checkPermission(
  user: { subscriptionTier?: string; tier?: string; subscriptionStatus?: string } | null | undefined,
  _permission: string,
): boolean {
  void _permission;
  // Basic implementation: allow everything for now or based on user tier
  // For this fix, we'll assume all users have access to basic features, 
  // but you might want to restrict this based on user.subscriptionTier
  
  if (!user) return false;
  
  // Example logic:
  // if (user.subscriptionTier === 'premium') return true;
  
  return true; // Allow all for dev/fix purposes
}

export function getEffectiveTier(user: { tier?: string; subscriptionStatus?: string }) {
  return user?.tier ?? 'free';
}
