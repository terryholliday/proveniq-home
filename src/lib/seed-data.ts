import { Timestamp } from 'firebase/firestore';
import { ComplianceTask, LegalDocument } from './types';

// Helper to create future dates
const daysFromNow = (n: number) => Timestamp.fromDate(new Date(Date.now() + n * 86400000));

// 1. EXTRACTED TASKS
export const SEED_TASKS: Omit<ComplianceTask, 'id'>[] = [
  // ... (Keep existing tasks from previous steps: 83b, Tech Transfer, etc.) ...
  {
    title: "File 83(b) Election",
    description: "CRITICAL: Mail 83(b) form to IRS within 30 days of signing RSPA. Send via USPS Certified Mail. Missing this is irreversible.",
    dueDate: daysFromNow(5),
    status: 'pending',
    priority: 'critical',
    tags: ['corp-gov', 'tax', 'day-1'],
    createdAt: Timestamp.now()
  },
  // ... (Keep other existing tasks) ...

  // --- NEW: RETROACTIVE PRIVACY REMEDIATION TASKS ---
  {
    title: "Update Privacy Policy (Cloud Disclosure)",
    description: "IMMEDIATE: Replace deceptive 'local storage' language with explicit disclosure of Google Cloud Firestore usage and data synchronization. Failure to do so invites FTC enforcement.",
    dueDate: daysFromNow(1), // Immediate priority
    status: 'pending',
    priority: 'critical',
    tags: ['legal', 'privacy', 'remediation'],
    createdAt: Timestamp.now()
  },
  {
    title: "Implement Just-in-Time Consent Modal",
    description: "Build a blocking modal for all users (new & existing) to affirmatively agree to cloud storage and auction data processing on next launch.",
    dueDate: daysFromNow(3),
    status: 'pending',
    priority: 'critical',
    tags: ['dev', 'privacy', 'ux'],
    createdAt: Timestamp.now()
  },
  {
    title: "Send Corrective Notice Email",
    description: "Send blast to all existing users: 'We are moving infrastructure to the cloud. Please accept new terms in-app.' Essential for FTC compliance.",
    dueDate: daysFromNow(5),
    status: 'pending',
    priority: 'high',
    tags: ['legal', 'communication'],
    createdAt: Timestamp.now()
  },
  {
    title: "Verify Consent Recording",
    description: "Audit Firestore 'users' collection to ensure 'consents.cloudStorage' timestamp is being correctly recorded for new sign-ins.",
    dueDate: daysFromNow(7),
    status: 'pending',
    priority: 'high',
    tags: ['audit', 'tech'],
    createdAt: Timestamp.now()
  },
  {
    title: "Google Play Data Safety Update",
    description: "URGENT: Update Data Safety form to declare collection of 'Photos/Videos' and 'Device IDs' (Firebase). Explicitly state 'Encrypted in transit'. Mismatch = Suspension.",
    dueDate: daysFromNow(2), // Immediate priority
    status: 'pending',
    priority: 'critical',
    tags: ['app-store', 'privacy', 'blocker'],
    createdAt: Timestamp.now()
  },
  {
    title: "Apple App Privacy Update",
    description: "Update App Store Connect 'App Privacy' section. Disclose 'User Content' and 'Identifiers' usage. Ensure Privacy Nutrition Label matches code.",
    dueDate: daysFromNow(2),
    status: 'pending',
    priority: 'critical',
    tags: ['app-store', 'privacy', 'blocker'],
    createdAt: Timestamp.now()
  }
];

// 2. EXTRACTED DOCUMENTS
export const SEED_DOCS: Partial<LegalDocument>[] = [
  // ... (Keep existing internal docs: Bylaws, Board Consent, etc.) ...
  {
    id: 'corporate_bylaws',
    title: 'BYLAWS OF TRUEARK TECHNOLOGIES, INC.',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>BYLAWS OF TRUEARK TECHNOLOGIES, INC.</h1><p><strong>(A Delaware Corporation)</strong></p><h2>ARTICLE I: OFFICES</h2><p>1.1 Registered Office. The registered office of the corporation shall be located in the State of Delaware...</p><h2>ARTICLE II: STOCKHOLDERS</h2><p>2.1 Annual Meeting. An annual meeting of stockholders shall be held for the election of directors...</p><p>2.5 Voting. Each stockholder shall be entitled to one vote for each share of capital stock held.</p><p><em>(Full text imported from 'BYLAWS OF TRUEARK TECHNOLOGIES, INC')</em></p>`
  },
  // ... (Keep existing Tax Strategy doc) ...

  // --- UPDATED PUBLIC POLICIES (CORRECTIVE) ---
  {
    id: 'privacy',
    title: 'Privacy Policy (Cloud-Native Revised)',
    status: 'published',
    version: '2.0',
    content: `<h1>Privacy Policy</h1>
    <p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p>
    
    <h3>1. Introduction</h3>
    <p>TrueArk Technologies, Inc. ("MyARK," "we," "us") values your privacy. This policy describes how we handle your personal inventory data, photos, and auction activity.</p>

    <h3>2. Data Storage and Synchronization</h3>
    <p><strong>Cloud-First Architecture:</strong> Unlike legacy applications that may store data solely on your device, MyARK uses <strong>Google Cloud Firestore</strong>, a secure cloud database provided by Google LLC, to store, synchronize, and backup your data. This allows you to access your inventory across multiple devices and participate in real-time auctions.</p>
    <p><strong>What This Means:</strong> Your inventory items, photos, and bid history are transmitted to and stored on servers located in the United States. While a copy may be cached on your device for offline use, the authoritative record resides in the cloud.</p>

    <h3>3. Information We Collect</h3>
    <ul>
      <li><strong>Inventory Data:</strong> Photos, descriptions, values, and receipts you upload.</li>
      <li><strong>Auction Data:</strong> Bids, sales history, and shipping addresses.</li>
      <li><strong>Device Data:</strong> IP addresses and unique device identifiers collected by the Firebase SDK to maintain server connections.</li>
    </ul>

    <h3>4. Third-Party Sharing</h3>
    <p>We do not sell your personal data. We share data with the following infrastructure providers solely to operate the service:</p>
    <ul>
      <li><strong>Google Cloud (Firebase):</strong> Database, Authentication, and Storage.</li>
      <li><strong>Stripe:</strong> Payment processing.</li>
    </ul>
    `
  },
  {
    id: 'tos',
    title: 'Terms of Service (Marketplace Facilitator Update)',
    status: 'published',
    version: '2.0',
    content: `<h1>Terms of Service</h1>
    <p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p>

    <h3>1. Acceptance of Terms</h3>
    <p>By using MyARK, you agree to these Terms. You acknowledge that MyARK is a cloud-based service and that your data will be synchronized to our servers.</p>

    <h3>2. Marketplace Facilitator Role</h3>
    <p>MyARK operates as a "Marketplace Facilitator" for auction transactions. We are responsible for calculating, collecting, and remitting applicable Sales Tax on items sold through our platform, as required by state law.</p>

    <h3>3. Auction Rules</h3>
    <p>When you place a bid, you are entering a binding contract. You acknowledge that auction data is stored centrally to ensure fairness and transparency.</p>
    `
  }
];