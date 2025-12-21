import { LegalDocument, ComplianceTask, LegalDocType } from './types';
import { Timestamp } from 'firebase/firestore';
import PHASE_4_ROLES_JSON from './proveniq_claimsiq_roles.json';
import { CPVL_CONTENT } from './compliance/cpvl-content';

export const SEED_LEGAL_DOCS: Partial<LegalDocument>[] = [
    {
        id: 'privacy' as LegalDocType,
        title: 'Privacy Policy',
        version: '2.0-cloud-migration',
        status: 'published',
        content: `
# Privacy Policy v2.0

**Effective Date:** ${new Date().toISOString().split('T')[0]}

## 1. Introduction
PROVENIQ Home ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our mobile application and website (collectively, the "Service").

## 2. Data Collection & Cloud Storage
**Important Update:** As of v2.0, PROVENIQ Home utilizes Google Cloud Firestore for secure data storage. Your inventory data, including images and descriptions, is synchronized to the cloud to enable cross-device access and disaster recovery.

## 3. Information We Collect
- **Personal Data:** Name, email address, and profile information.
- **Inventory Data:** Photos, descriptions, values, and receipts of your personal property.
- **Usage Data:** Analytics on how you use the app to improve performance.

## 4. How We Use Your Data
- To provide and maintain the Service.
- To facilitate auctions and sales (if you opt-in).
- To improve our AI models (only with your explicit consent).

## 5. Data Security
We use industry-standard encryption to protect your data both in transit and at rest.

## 6. Your Rights
You have the right to access, correct, or delete your personal data. You can request data deletion via the app settings.
    `,
        lastUpdated: Timestamp.now(),
        updatedBy: 'system',
    },
    {
        id: 'tos' as LegalDocType,
        title: 'Terms of Service',
        version: '1.1',
        status: 'published',
        content: `
# Terms of Service

**Last Updated:** ${new Date().toISOString().split('T')[0]}

## 1. Acceptance of Terms
By accessing or using PROVENIQ Home, you agree to be bound by these Terms.

## 2. User Accounts
You are responsible for safeguarding your account credentials.

## 3. Cloud Services
You acknowledge that PROVENIQ Home uses cloud-based services for data storage and processing.

## 4. AI Disclaimers
AI-generated content is for informational purposes only and should be verified.

## 5. Limitation of Liability
PROVENIQ Home is provided "as is" without warranties of any kind.
    `,
        lastUpdated: Timestamp.now(),
        updatedBy: 'system',
    },
    {
        id: 'regulatory_risk_assessment' as LegalDocType,
        title: 'Regulatory Risk Assessment: Auctioneer Licensing',
        version: '1.0',
        status: 'internal_only',
        content: `
# Comprehensive Regulatory Risk Assessment: Auctioneer Licensing, Internet Exemptions, and Bidding Fee Models in the United States

## Executive Summary
The digitization of the auction industry has precipitated a complex collision between legacy commercial statutes and modern e-commerce realities. The current regulatory environment for online auction operators in the United States is assessed as a **Medium Risk (Yellow)**, a classification that reflects a fragmented legal landscape characterized by conditional exemptions, evolving enforcement priorities, and a lack of federal uniformity. While the proliferation of "internet-only" exemptions suggests a permissive environment, a rigorous analysis of state-level statutes reveals a labyrinth of compliance traps centered on two critical operational activities: the handling of client funds and the intervention in the bidding process.

This report provides an exhaustive examination of the legal obligations facing online auction platforms, with a specific focus on the nuanced distinctions between passive third-party marketplaces and active auctioneers. It scrutinizes the statutory frameworks of key jurisdictions—including West Virginia, Texas, California, and Illinois—to delineate the precise boundaries of licensure. Furthermore, the report investigates the volatile legal status of "penny auctions" (or bidding fee auctions), analyzing the intersection of auction law and gambling regulations that threatens the viability of this business model.

By synthesizing legislative texts, administrative rules, and enforcement actions, this document serves as a definitive guide for operators seeking to navigate the regulatory divide. The analysis highlights that immunity from licensure is rarely absolute; rather, it is contingent upon strict adherence to operational constraints that limit the platform's control over the transaction. The emergence of new legislation, such as Illinois' Senate Bill 2351, indicates a legislative trend toward closing the "internet loophole," signaling that the era of unregulated digital auctioneering may be drawing to a close.

## Section 1: The Doctrinal Evolution of Auction Law
### 1.1 The Historical Fiduciary Standard
Traditionally, the auctioneer has been viewed not merely as a salesperson but as a fiduciary agent of the seller. This relationship is rooted in the physical reality of the "live bid call," where the auctioneer's skill, chant, and pacing directly influence the final sale price. State legislatures established licensing boards to ensure that these powerful agents—who often took temporary custody of valuable assets like livestock, real estate, and antiques—were competent and trustworthy.

### 1.2 The Digital Disruption and the "Intervention" Doctrine
The advent of the internet fundamentally challenged these definitions. Online platforms like eBay democratized the auction mechanism, allowing millions of users to act as their own auctioneers. In response, regulators were forced to distinguish between the technology that facilitates a sale and the agent who conducts it. This necessitated the development of the "Intervention Doctrine"—a legal theory that attempts to draw a line based on the degree of control the platform exerts over the transaction.

## Section 2: Jurisdiction-Specific Regulatory Analysis
The risk profile for an online auction operator is geographically contingent. State statutes vary wildly, from broad exemptions in Texas to strict licensure requirements in Mississippi and Ohio.

### 2.1 West Virginia: The "Owner-Operator" Trap
West Virginia presents one of the most specific and potentially treacherous regulatory environments for online auctioneers. The state has moved beyond vague interpretations to codify precise exemptions and inclusions in its administrative rules.

### 2.2 Texas: The "Live Bid" Distinction and Fiduciary Risks
Texas offers a more permissive statutory environment for pure internet auctions, but it remains rigorous regarding the protection of funds and the definition of a "live" event.

### 2.3 California: The Bonded Non-License State
California presents a unique regulatory model. The state does not issue "auctioneer licenses" in the traditional sense (no exams or education requirements), but it imposes strict bonding and disclosure requirements on anyone conducting an auction business.

## Section 7: Strategic Recommendations and Conclusion
### 7.1 Navigating the "Medium Risk" Environment
The classification of this sector as Medium Risk is accurate but contingent on the operator's business model. The risk is Low for passive marketplaces (eBay style) that process payments via third parties. The risk elevates to High for proprietary platforms (owner-operators) that handle funds, utilize soft closes, or employ penny auction mechanics.

### 7.2 Actionable Compliance Strategies
1. **Decouple Funds:** Implement third-party payment processing (e.g., Stripe Connect).
2. **Platform Neutrality:** Avoid "intervention" (soft closes) or obtain licensure.
3. **California Bonding:** Obtain the $20,000 surety bond if selling to CA residents.
4. **Penny Auction "Safe Harbor":** Implement "Buy-It-Now" feature.
5. **Terms of Sale Visibility:** Implement strict "clickwrap" ToS.

*(Full report available in docs/compliance/regulatory_risk_assessment_auctioneer_licensing.md)*
        `,
        lastUpdated: Timestamp.now(),
        updatedBy: 'system',
    },
    {
        id: 'cpvl_framework' as LegalDocType,
        title: 'CPVL Regulatory Framework',
        version: '1.0',
        status: 'published',
        content: CPVL_CONTENT,
        lastUpdated: Timestamp.now(),
        updatedBy: 'Legal Compliance Officer',
    },
];

interface RoleTask {
    title: string;
    description: string;
    security_level: string;
    data_source: string;
}

interface RoleData {
    id: string;
    title: string;
    description: string;
    tasks: RoleTask[];
}

const PHASE_4_TASKS: Partial<ComplianceTask>[] = (PHASE_4_ROLES_JSON as RoleData[]).flatMap((role: RoleData) =>
    role.tasks.map((task: RoleTask) => ({
        title: task.title,
        description: task.description,
        priority: task.security_level === 'L3_TRADE_SECRET' ? 'critical' :
            task.security_level === 'L2_SENSITIVE' ? 'high' : 'medium',
        status: 'pending',
        dueDate: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days default
        createdAt: Timestamp.now(),
        tags: [role.id, task.security_level]
    }))
);

export const SEED_COMPLIANCE_TASKS: Partial<ComplianceTask>[] = [
    {
        title: 'Review Privacy Policy v2.0',
        description: 'Ensure the new cloud storage clauses are legally sound.',
        priority: 'critical',
        status: 'pending',
        dueDate: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        createdAt: Timestamp.now(),
    },
    {
        title: 'Audit User Consents',
        description: 'Verify that all active users have accepted the new terms.',
        priority: 'high',
        status: 'pending',
        dueDate: Timestamp.fromMillis(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        createdAt: Timestamp.now(),
    },
    {
        title: 'Deploy Consent Modal',
        description: 'Implement and verify the Just-in-Time consent modal for v2.0 policies.',
        priority: 'critical',
        status: 'pending',
        dueDate: Timestamp.fromMillis(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        createdAt: Timestamp.now(),
    },
    {
        title: 'Verify Firestore Sync',
        description: 'Ensure legal documents are correctly syncing from Admin Dashboard to Firestore.',
        priority: 'high',
        status: 'pending',
        dueDate: Timestamp.fromMillis(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        createdAt: Timestamp.now(),
    },
    ...PHASE_4_TASKS
];
