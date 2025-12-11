import { Timestamp } from 'firebase/firestore';
import { ComplianceTask, LegalDocument } from './types';

const daysFromNow = (n: number) => Timestamp.fromDate(new Date(Date.now() + n * 86400000));

// --- 1. CRITICAL ACTION ITEMS ---
export const SEED_TASKS: Omit<ComplianceTask, 'id'>[] = [
  // CORP GOVERNANCE
  {
    title: "File 83(b) Election",
    description: "CRITICAL: Mail 83(b) form to IRS within 30 days of signing RSPA. Send via USPS Certified Mail. Missing this is irreversible.",
    dueDate: daysFromNow(5),
    status: 'pending',
    priority: 'critical',
    tags: ['corp-gov', 'tax', 'day-1'],
    relatedDocId: 'rspa_template',
    createdAt: Timestamp.now()
  },
  {
    title: "Execute Tech Transfer Agreement",
    description: "Sign Tech Transfer Agreement to assign pre-incorporation IP (VinoVision/Proveniq code) to Proveniq Technologies, Inc.",
    dueDate: daysFromNow(7),
    status: 'pending',
    priority: 'critical',
    tags: ['corp-gov', 'ip', 'day-1'],
    relatedDocId: 'tech_transfer',
    createdAt: Timestamp.now()
  },
  {
    title: "Foreign Qualification (WV)",
    description: "Register Proveniq Technologies (Delaware) as a foreign corp in West Virginia to enforce contracts in HQ state.",
    dueDate: daysFromNow(14),
    priority: 'critical',
    status: 'pending',
    tags: ['legal', 'corp-gov'],
    createdAt: Timestamp.now()
  },

  // PRIVACY REMEDIATION (The "Silent Synchronization" Fix)
  {
    title: "Update Privacy Policy (Cloud Disclosure)",
    description: "IMMEDIATE: Replace deceptive 'local storage' language with explicit disclosure of Google Cloud Firestore usage and data synchronization. Failure to do so invites FTC enforcement.",
    dueDate: daysFromNow(1),
    status: 'pending',
    priority: 'critical',
    tags: ['legal', 'privacy', 'remediation'],
    relatedDocId: 'privacy',
    createdAt: Timestamp.now()
  },
  {
    title: "Implement Just-in-Time Consent Modal",
    description: "Build a blocking modal for all users (new & existing) to affirmatively agree to cloud storage on next launch.",
    dueDate: daysFromNow(3),
    status: 'pending',
    priority: 'critical',
    tags: ['dev', 'privacy', 'ux'],
    createdAt: Timestamp.now()
  },

  // TAX & MARKETPLACE LAWS
  {
    title: "Retroactive Nexus Assessment",
    description: "Audit last 12 months of transactions. Did we hit $100k or 200 txns in any state (e.g. IL, UT)?",
    dueDate: daysFromNow(7),
    priority: 'critical',
    status: 'pending',
    tags: ['tax', 'audit'],
    createdAt: Timestamp.now()
  },
  {
    title: "Integrate Stripe Tax / Avalara",
    description: "Connect Stripe Tax API to auction_api.ts for real-time calculation on 'Win' events.",
    dueDate: daysFromNow(30),
    priority: 'high',
    status: 'pending',
    tags: ['dev', 'tax'],
    createdAt: Timestamp.now()
  },

  // UNAUTHORIZED PRACTICE OF LAW (UPL)
  {
    title: "De-Risk AI Marketing Claims",
    description: "Remove terms like 'AI Lawyer' or 'Guaranteed Valid'. Replace with 'Document Assembly Engine'.",
    dueDate: daysFromNow(3),
    status: 'pending',
    priority: 'critical',
    tags: ['legal', 'marketing', 'upl'],
    relatedDocId: 'upl_strategy_memo',
    createdAt: Timestamp.now()
  },
  {
    title: "Implement 'Safe Harbor' UI Logic",
    description: "Re-architect Wizard UI. AI cannot 'recommend' clauses. User must select defined options.",
    dueDate: daysFromNow(21),
    status: 'pending',
    priority: 'high',
    tags: ['dev', 'ux', 'upl'],
    createdAt: Timestamp.now()
  },

  // SECURITY (SOC 2)
  {
    title: "Enforce MFA for Admins",
    description: "Mandatory Multi-Factor Authentication for all accounts with 'admin' claims.",
    dueDate: daysFromNow(14),
    priority: 'critical',
    status: 'pending',
    tags: ['security', 'soc2'],
    relatedDocId: 'security_roadmap',
    createdAt: Timestamp.now()
  },
  {
    title: "Infrastructure Penetration Test",
    description: "Hire third-party firm to pen-test API and storage rules before full public launch.",
    dueDate: daysFromNow(45),
    priority: 'high',
    status: 'pending',
    tags: ['security', 'audit'],
    createdAt: Timestamp.now()
  }
];

// --- 2. DOCUMENT REPOSITORY ---
export const SEED_DOCS: Partial<LegalDocument>[] = [
  // PUBLIC POLICIES (Corrected for Cloud)
  {
    id: 'privacy',
    title: 'Privacy Policy (Cloud-Native Revised)',
    status: 'published',
    version: '2.0',
    content: `<h1>Privacy Policy</h1><p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p><h3>2. Data Storage and Synchronization</h3><p><strong>Cloud-First Architecture:</strong> Unlike legacy applications that may store data solely on your device, Proveniq Home uses <strong>Google Cloud Firestore</strong>, a secure cloud database provided by Google LLC, to store, synchronize, and backup your data. This allows you to access your inventory across multiple devices and participate in real-time auctions.</p><h3>4. Third-Party Sharing</h3><p>We do not sell your personal data. We share data with infrastructure providers solely to operate the service: Google Cloud (Firebase), Stripe.</p>`
  },
  {
    id: 'tos',
    title: 'Terms of Service (Marketplace Facilitator Update)',
    status: 'published',
    version: '2.0',
    content: `<h1>Terms of Service</h1><p><strong>Last Updated: ${new Date().toLocaleDateString()}</strong></p><h3>2. Marketplace Facilitator Role</h3><p>Proveniq Home operates as a "Marketplace Facilitator" for auction transactions. We are responsible for calculating, collecting, and remitting applicable Sales Tax on items sold through our platform, as required by state law.</p>`
  },
  {
    id: 'eula',
    title: 'End User License Agreement (EULA)',
    status: 'published',
    version: '1.0',
    content: `<h1>End User License Agreement</h1><p>This EULA governs your use of the Proveniq Home software.</p>`
  },
  {
    id: 'compliance_notice',
    title: 'Annual Compliance Notice',
    status: 'internal_only',
    version: '2025.1',
    content: `<h1>Annual Compliance Notice</h1><p>Summary of compliance obligations for the fiscal year.</p>`
  },

  // STRATEGY MEMOS
  {
    id: 'upl_strategy_memo',
    title: 'UNAUTHORIZED PRACTICE OF LAW (UPL) RISK ASSESSMENT',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Unauthorized Practice of Law in the Age of AI</h1><p><strong>Executive Summary:</strong> The "AI-powered wizard" risks being classified as UPL if it applies legal logic to user facts. We must pivot to a "Scrivener" model.</p><h3>Product Compliance Strategy</h3><ul><li><strong>User-Driven vs. System-Driven:</strong> The user must select the clauses. The AI cannot "auto-select".</li><li><strong>E-Wills:</strong> Recognize that states like FL require a "Qualified Custodian". Pure software e-wills are invalid there.</li></ul>`
  },
  {
    id: 'tax_compliance_strategy',
    title: 'MARKETPLACE FACILITATOR LAWS & TAX STRATEGY',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Compliance Architecture for Digital Auction Platforms</h1><p><strong>Executive Summary:</strong> Proveniq Home is likely a "Marketplace Facilitator" due to our role in listing items and processing payments (Stripe). This creates a mandatory obligation to collect/remit Sales Tax once thresholds (e.g., $100k or 200 txns) are met.</p>`
  },
  {
    id: 'legacy_strategy',
    title: 'WV RUFADAA COMPLIANCE REPORT',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>STRATEGIC COMPLIANCE REPORT: Proveniq Home "LEGACY" FEATURE</h1><p><strong>Executive Summary:</strong> Proveniq Home must not view the "Legacy" feature merely as a convenience, but as a robust legal instrument under WV Code §44-5B-1.</p><h3>The Privacy Paradox</h3><p>Federal statutes like the SCA criminalize unauthorized access. WV-UFADAA resolves this via the 'Online Tool'.</p>`
  },
  {
    id: 'business_plan',
    title: 'TRUEARK BUSINESS PLAN (FY 26-29)',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>TrueArk Technologies, Inc. Business Plan</h1><p><strong>Confidential & Proprietary</strong></p><h2>1.0 Executive Summary</h2><p>TrueArk is the "Trust & Liquidity Layer for the Physical World," unlocking the $8 Trillion "Dead Capital" reservoir of consumer durable goods.</p>`
  },
  {
    id: 'security_roadmap',
    title: 'Security Roadmap (SOC 2 Type I)',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Security Roadmap</h1><p>Plan for achieving SOC 2 Type I compliance.</p>`
  },
  {
    id: 'trademark_strategy',
    title: 'Trademark Strategy Memo',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Trademark Strategy</h1><p>Strategy for protecting the Proveniq Home brand and marks.</p>`
  },

  // CORP GOVERNANCE & TEMPLATES
  {
    id: 'corporate_bylaws',
    title: 'BYLAWS OF TRUEARK TECHNOLOGIES, INC.',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>BYLAWS OF TRUEARK TECHNOLOGIES, INC.</h1><p><strong>(A Delaware Corporation)</strong></p><h2>ARTICLE I: OFFICES</h2><p>1.1 Registered Office. The registered office of the corporation shall be located in the State of Delaware...</p>`
  },
  {
    id: 'board_consent_initial',
    title: 'Initial Board Consent',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Action by Unanimous Written Consent</h1><p>The undersigned, being all the members of the Board of Directors, hereby consent to the following actions...</p>`
  },
  {
    id: 'piia_template',
    title: 'TEMPLATE: PIIA (Standard)',
    status: 'internal_only',
    version: '2025.1',
    content: `<h1>Proprietary Information and Inventions Assignment Agreement</h1><p>This Agreement is entered into by and between TrueArk Technologies, Inc. and [Recipient Name].</p><h3>2. Assignment of Inventions</h3><p>Recipient hereby assigns to the Company all right, title, and interest in and to any Inventions created during the Relationship.</p>`
  },
  {
    id: 'piia_wfh_template',
    title: 'TEMPLATE: PIIA (WFH/Remote)',
    status: 'internal_only',
    version: '2025.1',
    content: `<h1>PIIA (Remote Work Addendum)</h1><p>Additional terms for remote employees regarding information security.</p>`
  },
  {
    id: 'ica_template',
    title: 'TEMPLATE: Independent Contractor Agreement',
    status: 'internal_only',
    version: '2025.1',
    content: `<h1>Independent Contractor Agreement</h1><p>Agreement for contractor services.</p>`
  },
  {
    id: 'rspa_template',
    title: 'TEMPLATE: Restricted Stock Purchase Agreement',
    status: 'internal_only',
    version: '2025.1',
    content: `<h1>Restricted Stock Purchase Agreement</h1><p>Agreement for the purchase of restricted stock.</p>`
  },
  {
    id: 'tech_transfer',
    title: 'TECHNOLOGY TRANSFER AGREEMENT',
    status: 'internal_only',
    version: '1.0',
    content: `<h1>Technology Transfer and Assignment Agreement</h1><p>This Agreement is made by and between Terry L. Holliday (“Assignor”) and TrueArk Technologies, Inc. (“Assignee”).</p><h3>1. Assignment</h3><p>Assignor hereby irrevocably sells, transfers, conveys, assigns, and delivers to the Company all right, title, and interest in and to the Technology (VinoVision, Proveniq Home, TrueManifest, etc.).</p>`
  }
];