# Biometric Information Privacy Policy (BIPA) Addendum

## Visual Truth Feature - Biometric Data Processing

**Effective Date:** December 2024  
**Version:** 1.0

---

## 1. Overview

This addendum supplements MyARK's Privacy Policy regarding the "Visual Truth" feature, which processes images to verify item authenticity and detect tampering. While Visual Truth primarily analyzes objects (not faces), certain images may incidentally contain biometric information.

---

## 2. What Data We Collect

### 2.1 Image Hashing (Non-Biometric)
- **SHA-256 cryptographic hashes** of uploaded images
- These hashes are **one-way** and cannot be reversed to reconstruct images
- Used solely for tamper detection and provenance verification

### 2.2 Potential Incidental Biometric Data
If an uploaded image contains a person's face or other biometric identifiers:
- We do **NOT** intentionally extract, store, or analyze biometric templates
- The AI vision pipeline focuses on object detection, not facial recognition
- Any incidental facial data in images is processed only for quality assessment (blur detection, lighting)

---

## 3. Consent Requirements

### 3.1 Explicit Opt-In
Before using Visual Truth, users must:
1. Acknowledge this BIPA addendum
2. Provide affirmative consent (checkbox, not pre-checked)
3. Understand they can revoke consent at any time

### 3.2 Consent Record
We store the following consent metadata:
```typescript
interface VisualTruthConsent {
  userId: string;
  consentedAt: Timestamp;
  policyVersion: string;
  ipAddress?: string;  // Optional, for audit
  consentScope: 'visual_truth_processing';
}
```

---

## 4. Data Retention & Destruction

| Data Type | Retention Period | Destruction Method |
|-----------|------------------|-------------------|
| Image Hashes | Lifetime of item | Deleted on item deletion |
| Raw Images | User-controlled | Deleted on request |
| Consent Records | 7 years (legal requirement) | Cryptographic erasure |

### 4.1 Right to Delete
Users may request deletion of:
- All images associated with their account
- All Visual Truth verification records
- Their consent history (after regulatory retention period)

---

## 5. Security Measures

- **Encryption at Rest:** All images encrypted using AES-256
- **Encryption in Transit:** TLS 1.3 for all API communications
- **Access Control:** Role-based access; only authenticated users can access their own data
- **Audit Logging:** All data access events logged to immutable audit trail

---

## 6. Third-Party Processing

Visual Truth uses Google Cloud AI services for image analysis:
- **Processor:** Google Cloud Vision API / Gemini
- **Data Location:** US data centers
- **Subprocessor Agreement:** DPA executed with Google Cloud

No biometric data is shared with third parties for advertising or profiling purposes.

---

## 7. User Rights

Under BIPA (Illinois) and similar state laws, you have the right to:
1. **Know** what biometric data we collect (we collect none intentionally)
2. **Consent** before any biometric data is collected
3. **Request deletion** of any data that may contain biometric information
4. **Sue** for violations ($1,000-$5,000 per violation under BIPA)

---

## 8. Contact Information

For BIPA-related inquiries or deletion requests:
- **Email:** privacy@myark.app
- **Response Time:** 30 days maximum

---

## 9. Updates to This Addendum

We will notify users of material changes via:
1. Email notification
2. In-app banner requiring re-consent
3. Updated version number and effective date

---

## Acknowledgment

By enabling Visual Truth, I acknowledge that I have read and understood this Biometric Information Privacy Policy Addendum. I understand that:
- Image hashes are generated for tamper detection
- No facial recognition or biometric templating is performed
- I can revoke consent and delete my data at any time

**[ ] I consent to Visual Truth image processing as described above.**
