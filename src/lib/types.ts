import { Timestamp } from 'firebase/firestore';

export type ItemCondition = 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair' | 'For Parts/Not Working';

// --- USER & COMPLIANCE CORE ---

export type ConsentRecord = {
  accepted: boolean;
  acceptedAt: Timestamp;
  policyVersion: string; // e.g. "2.0-cloud-migration"
  ipAddress?: string;
};

export type LegacyContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: 'spouse' | 'child' | 'attorney' | 'other';
  // [COMPLIANCE] RUFADAA Granularity
  accessAssets: boolean;
  accessContent: boolean; // Requires affirmative act
  designatedDate: string;
};

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  onboardingCompleted: boolean;
  isPremium: boolean;
  aiAccess: boolean;
  trainingAccess: boolean;
  legacyContact?: LegacyContact;
  consents?: {
    cloudStorage?: ConsentRecord;
    marketing?: boolean;
  };
  // New fields made optional for compatibility with existing mocks - REMOVED DUPLICATES
  // Existing fields to preserve compatibility
  profilePicture?: string;
  oauthProvider?: string;
  oauthId?: string;
  permissions?: {
    camera?: 'granted' | 'denied' | 'prompt';
    microphone?: 'granted' | 'denied' | 'prompt';
    location?: 'granted' | 'denied' | 'prompt';
  };
};

// --- EMPLOYEE & IP PROTECTION ---

export type PiiaStatus = {
  signed: boolean;
  signedAt: string;
  exhibitA_filed: boolean;
  ipTransferAgreement?: boolean;
};

export type EmployeeProfile = UserProfile & {
  role: 'contractor' | 'employee' | 'founder';
  piia: PiiaStatus;
  department: string;
  accessLevel: 'l1_general' | 'l2_sensitive' | 'l3_trade_secrets';
};

export type CompanyAssetMetadata = {
  createdById: string;
  createdAt: string;
  copyrightHolder: 'MyARK Inc.';
  inventionType: 'code' | 'algorithm' | 'process' | 'list';
  isProprietary: boolean;
};

// --- LEGAL CMS & TASKS ---

export type LegalDocType =
  // Public Policies
  | 'tos'
  | 'privacy'
  | 'eula'
  // Corporate Governance (Internal)
  | 'corporate_bylaws'
  | 'board_consent_initial'
  | 'tech_transfer'
  | 'compliance_notice'
  | 'business_plan'
  // Strategic Memos
  | 'legal_strategy_memo'
  | 'security_roadmap'
  | 'trademark_strategy'
  | 'legacy_strategy'
  | 'tax_compliance_strategy'
  | 'upl_strategy_memo'
  // HR & Templates
  | 'piia_template'
  | 'piia_wfh_template'
  | 'ica_template'
  | 'rspa_template'
  // Legacy status types for compatibility (optional, if needed)
  | 'internal_only'
  | 'published'
  | 'archived';

export type LegalDocument = {
  id: LegalDocType;
  title: string;
  content: string;
  lastUpdated: Timestamp;
  updatedBy: string;
  version: string;
  status: 'draft' | 'published' | 'internal_only' | 'pending' | 'notarized' | 'archived';
  // Existing fields
  name?: string; // Kept for compatibility
};

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplianceTask = {
  id: string;
  title: string;
  description?: string;
  dueDate: Timestamp;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: TaskPriority;
  assignedTo?: string;
  relatedDocId?: LegalDocType;
  createdAt: Timestamp;
  tags?: string[];
};

// --- APP DOMAIN TYPES (Existing) ---

export type RufadaaClass = 'asset' | 'content' | 'catalogue';

export type LentDetails = {
  lentTo: string;
  contact: string;
  lentDate: string;
  expectedReturnDate: string;
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
  // Existing fields
  GPSLatitude?: number;
  GPSLongitude?: number;
};

// --- PROVENANCE & OWNERSHIP ---

export type ProvenanceEventType =
  | 'acquisition'
  | 'ownership_change'
  | 'appraisal'
  | 'repair'
  | 'restoration'
  | 'cleaning'
  | 'market_valuation'
  | 'other';

export interface ProvenanceEvent {
  id: string;
  date: string; // ISO 8601
  type: ProvenanceEventType;
  description: string;
  provider?: string; // e.g. "Sotheby's", "Local Jeweler"
  cost?: number;
  documentUrl?: string; // URL to proof/receipt
  verified: boolean;
}

export type InventoryItem = {
  id: string;
  userId: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  imageUrl?: string;
  imageHint?: string;
  additionalImages?: string[];
  favorite?: boolean;
  quantity: number;
  purchasePrice?: number;
  purchaseDate?: string;
  receiptUrl?: string;
  marketValue?: number;
  condition?: string | ItemCondition; // Allow both for compatibility
  location?: string;
  container?: string;
  addedDate?: string;
  warrantyInfo?: string;
  lent?: LentDetails;
  exif?: ExifData;
  boxId?: string;
  beneficiaryId?: string;
  legacyNotes?: string;
  // [COMPLIANCE] Data tagging for estate export
  rufadaa_class?: RufadaaClass;
  // Existing fields to preserve compatibility
  images?: string[];
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
  isLent?: boolean;
  lentTo?: string;
  lentToEmail?: string;
  lentToPhone?: string;
  lentDate?: string;
  expectedReturnDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  legacyNote?: string; // Kept for compatibility
  vin?: string;
  // [VISION & DOCUMENT INTELLIGENCE]
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'cm' | 'in' | 'mm' | 'm';
  };
  material?: string;
  conditionDetails?: {
    scratches?: boolean;
    damage?: boolean;
    wearLevel?: 'none' | 'low' | 'medium' | 'high';
    notes?: string;
  };
  documents?: string[]; // IDs of linked documents
  // [PROVENANCE]
  provenance?: ProvenanceEvent[];
  provenanceScore?: number; // 0-100
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  timestamp: Timestamp;
  details?: Record<string, any>;
  rufadaa_class?: RufadaaClass;
};

export type Beneficiary = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  // Existing fields
  relation?: string; // Kept for compatibility (user used 'relationship', existing used 'relation')
  phone?: string;
  percentage?: number;
};

export type AIFlow = { id: string; name: string; description: string; inputSchema: any; outputSchema: any; companyMetadata?: CompanyAssetMetadata; };
export type SalesChannel = { id: string; name: string; platform: string; url?: string; apiKey?: string; status: 'active' | 'inactive'; createdAt: Timestamp; updatedAt: Timestamp; };
export type ServiceRequest = { id: string; itemId: string; itemSnapshot: InventoryItem; type: 'repair' | 'cleaning' | 'appraisal' | 'other'; description: string; status: 'pending' | 'in-progress' | 'completed' | 'cancelled'; requestedDate: Timestamp; completedDate?: Timestamp; serviceProvider?: string; cost?: number; notes?: string; attachments?: string[]; };
export type Claim = { id: string; itemId: string; itemSnapshot: InventoryItem; type: 'damage' | 'loss' | 'theft'; description: string; status: 'pending' | 'submitted' | 'approved' | 'rejected'; dateOfIncident: Timestamp; submittedDate?: Timestamp; resolutionDate?: Timestamp; payoutAmount?: number; notes?: string; attachments?: string[]; };
export type TrainingModule = { id: string; title: string; description: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; content: Array<{ heading: string; text?: string; imageUrl?: string; imageAlt?: string; videoUrl?: string; sections?: Array<{ heading: string; text: string; }>; }>; quiz?: { questions: Array<{ id: string; question: string; options: string[]; correctIndex: number; explanation: string; }>; }; roleplay?: { scenario: string; }; companyMetadata?: CompanyAssetMetadata; };
export type Box = {
  id: string;
  name: string;
  moveId: string;
  destinationRoom?: string;
};
export type Move = {
  id: string;
  name: string;
  date: string;
  origin?: string;
  destination?: string;
  status?: 'planning' | 'in-progress' | 'completed';
};
export type GroupingSuggestion = {
  id: string;
  name: string;
  itemIds: string[];
  reason: string;
  // Compatibility
  groupName?: string;
  reasoning?: string;
  itemNames?: string[];
};
export type PackingPlan = {
  groups: GroupingSuggestion[];
  // Compatibility
  priority?: PrioritySuggestion[];
  declutter?: DeclutterSuggestion[];
};

// Existing types that were not in the user snippet but should be kept
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

export type ServiceProvider = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
};
