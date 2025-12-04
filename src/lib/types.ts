export type ItemCondition = 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts/Not Working';

export type LentDetails = {
  lentTo: string;
  lentDate: string;
  expectedReturnDate: string;
  contact: string;
};

export type ExifData = {
  Make?: string;
  Model?: string;
  DateTimeOriginal?: string;
  LensModel?: string;
  FNumber?: number;
  FocalLength?: number;
  ISO?: number;
  ShutterSpeedValue?: number;
  GPSLatitude?: number;
  GPSLongitude?: number;
};

export type Beneficiary = {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
  percentage: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  quantity: number;
  purchasePrice: number;
  marketValue: number;
  condition: ItemCondition;
  location: string;
  addedDate: string;
  warrantyInfo?: string;
  // Optional media and flags
  favorite?: boolean;
  additionalImages?: string[];
  images?: string[];
  // Financials
  purchaseDate?: string;
  receiptUrl?: string;
  currentValue?: number;
  valueSource?: string;
  marketTrend?: 'up' | 'down';
  marketTrendPercentage?: number;
  lastMarketCheck?: string;
  comparableSales?: {
    title: string;
    price: number;
    url: string;
    date: string;
    source: string;
    imageUrl: string;
  }[];
  // Location
  container?: string;
  // Lending
  isLent?: boolean;
  lentTo?: string;
  lentToEmail?: string;
  lentToPhone?: string;
  lentDate?: string;
  expectedReturnDate?: string;
  lent?: LentDetails;
  // Maintenance
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  // Legacy
  beneficiaryId?: string;
  legacyNote?: string;
  // Vehicle
  vin?: string;
  exif?: ExifData;
  boxId?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  oauthProvider?: string;
  oauthId?: string;
  permissions?: {
    camera?: 'granted' | 'denied' | 'prompt';
    microphone?: 'granted' | 'denied' | 'prompt';
    location?: 'granted' | 'denied' | 'prompt';
  };
};

export type Move = {
  id: string;
  name: string;
  date: string;
};

export type Box = {
  id: string;
  name: string;
  moveId: string;
  destinationRoom?: string;
};

export type OrganizationSuggestion = {
  itemId: string;
  itemName: string;
  currentLocation: string;
  suggestedLocation: string;
  reasoning: string;
};

export type PrioritySuggestion = {
  itemName: string;
  priority: 'Pack First' | 'Pack Last';
  reasoning: string;
};

export type DeclutterSuggestion = {
  itemName: string;
  action: 'Sell' | 'Donate' | 'Discard';
  reasoning: string;
};

export type GroupingSuggestion = {
  groupName: string;
  reasoning: string;
  itemNames: string[];
  itemIds: string[];
};

export type PackingPlan = {
  priority?: PrioritySuggestion[];
  declutter?: DeclutterSuggestion[];
  groups?: GroupingSuggestion[];
};

export type AppView =
  | 'login'
  | 'landing'
  | 'dashboard'
  | 'inventory'
  | 'move-planner'
  | 'pitch-deck'
  | 'permissions'
  | 'legal-terms'
  | 'legal-privacy'
  | 'legal-eula';

export type SubscriptionTier = 'free' | 'plus' | 'pro';

export type User = UserProfile & {
  tier: SubscriptionTier;
  subscriptionStatus: 'active' | 'trial' | 'canceled';
  trialEndDate?: string;
  name?: string;
  preferences?: {
    enableSalesAds?: boolean;
  };
};

export type TourStep = {
  targetId: string;
  title: string;
  content: string;
  view: AppView;
  placement: 'top' | 'bottom' | 'left' | 'right';
};

export type Anomaly = {
  type: 'misplaced' | 'missing' | 'unexpected';
  itemName?: string;
  description: string;
  originalLocation?: string;
};

export type LegalDocument = {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'notarized';
};

export type ServiceProvider = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
};
