import { mockInventory } from './data';
import { User, Beneficiary } from './types';
import { Timestamp } from 'firebase/firestore';

export const DUMMY_ITEMS = mockInventory;

export const DUMMY_USERS: User[] = [
  {
    id: 'user-1',
    uid: 'user-1-uid',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    tier: 'free',
    subscriptionStatus: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    onboardingCompleted: true,
    isPremium: false,
    aiAccess: true,
    trainingAccess: true,
  }
];

export const DUMMY_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'Jane Doe',
    relation: 'Spouse',
    relationship: 'Spouse',
    email: 'jane@example.com',
    phone: '555-0123',
    percentage: 100
  }
];
