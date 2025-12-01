import { mockInventory } from './data';
import { User, Beneficiary } from './types';

export const DUMMY_ITEMS = mockInventory;

export const DUMMY_USERS: User[] = [
  {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    tier: 'free',
    subscriptionStatus: 'active'
  }
];

export const DUMMY_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben-1',
    name: 'Jane Doe',
    relation: 'Spouse',
    email: 'jane@example.com',
    phone: '555-0123',
    percentage: 100
  }
];
