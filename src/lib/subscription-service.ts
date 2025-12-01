import { User } from './types';

export const PERMISSIONS = {
  HO3_CLAIMS: 'ho3_claims',
  INVENTORY_UNLIMITED: 'inventory_unlimited',
  AI_ASSISTANT: 'ai_assistant',
  MOVE_AI: 'move_ai',
};

export function checkPermission(user: any, permission: string): boolean {
  // Basic implementation: allow everything for now or based on user tier
  // For this fix, we'll assume all users have access to basic features, 
  // but you might want to restrict this based on user.subscriptionTier
  
  if (!user) return false;
  
  // Example logic:
  // if (user.subscriptionTier === 'premium') return true;
  
  return true; // Allow all for dev/fix purposes
}
