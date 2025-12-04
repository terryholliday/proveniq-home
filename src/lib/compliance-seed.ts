import { LegalDocument, ComplianceTask, LegalDocType } from './types';
import { Timestamp } from 'firebase/firestore';

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
MyARK ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our mobile application and website (collectively, the "Service").

## 2. Data Collection & Cloud Storage
**Important Update:** As of v2.0, MyARK utilizes Google Cloud Firestore for secure data storage. Your inventory data, including images and descriptions, is synchronized to the cloud to enable cross-device access and disaster recovery.

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
By accessing or using MyARK, you agree to be bound by these Terms.

## 2. User Accounts
You are responsible for safeguarding your account credentials.

## 3. Cloud Services
You acknowledge that MyARK uses cloud-based services for data storage and processing.

## 4. AI Disclaimers
AI-generated content is for informational purposes only and should be verified.

## 5. Limitation of Liability
MyARK is provided "as is" without warranties of any kind.
    `,
        lastUpdated: Timestamp.now(),
        updatedBy: 'system',
    },
];

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
];
