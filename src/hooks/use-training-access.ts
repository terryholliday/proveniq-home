'use client';

import { useUser } from '@/firebase';
import { useUserProfile } from './use-user-profile';

export function useTrainingAccess() {
  const { user, isUserLoading } = useUser();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile(user);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return { hasAccess: false, isLoading: true };
  }

  if (!user || !userProfile) {
    return { hasAccess: false, isLoading: false };
  }

  const hasInternalEmail = user.email?.endsWith('@myark.internal') ?? false;

  // In a real app, this might check for a specific claim or role.
  // For now, we're just checking the email domain.
  const hasAccess = hasInternalEmail;

  return { hasAccess, isLoading: false };
}
