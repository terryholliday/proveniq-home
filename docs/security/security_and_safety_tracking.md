# Security Features & Safety Testing Tracker

This document serves as the central registry for all security features, safety testing protocols, and compliance documentation for the MyArk application.

## 1. Security Features

### 1.1 Authentication & Authorization
*   **Implementation**: Firebase Authentication with Custom Claims.
*   **RBAC**: Role-Based Access Control (Admin, Verifier, User).
*   **Documentation**: [SOC 2 Security Implementation Notes](./soc2_implementation.md)

### 1.2 Infrastructure Security
*   **Secrets Management**: Google Cloud Secret Manager.
*   **Rate Limiting**: App Check & Cloud Functions concurrency limits.
*   **File Security**: VirusTotal integration for file uploads.
*   **Audit Logging**: Centralized logging via Google Cloud Logging.

## 2. Safety & AI Testing

We conduct rigorous testing to ensure AI safety, fairness, and robustness against adversarial attacks.

### 2.1 Adversarial Testing (Visual Truth)
*   **Objective**: Verify the resilience of the image hashing and authentication pipeline against manipulation.
*   **Test Suite**: `scripts/adversarial-test.ts` (implied)
*   **Latest Report**: `adversarial-test-report-1764922257762.json`
*   **Status**:
    *   **Date**: 2025-12-05
    *   **Pass Rate**: 7/8 tests passed.
    *   **Findings**: 1 False Positive detected.
    *   **Action Items**: Investigate false positive in "Metadata stripped" case.

### 2.2 Valuation Bias Auditing
*   **Objective**: Detect and mitigate geographic or demographic bias in AI-generated item valuations.
*   **Test Suite**: `scripts/valuation-bias-audit.ts`
*   **Latest Report**: `valuation-bias-report-1764922290750.json`
*   **Status**:
    *   **Date**: 2025-12-05
    *   **Bias Score**: 59.3
    *   **Flagged Cases**: 2 (Manhattan, NY & New Orleans, LA deviations).
    *   **Findings**: Significant geographic bias detected (Higher in NY/CA, Lower in MI/TN/LA).
    *   **Action Items**: Review training data for location-based features; consider removing zip code from valuation inputs.

## 3. Compliance Documentation

### 3.1 Privacy & Data Rights
*   **BIPA (Biometric Information Privacy Act)**:
    *   Policy: [BIPA Policy](../compliance/bipa-policy.md)
    *   Addendum: [BIPA Addendum](../compliance/BIPA_addendum.md)
*   **GDPR / RTBF (Right to be Forgotten)**:
    *   Implementation: `rtbf.ts` Cloud Function.
    *   Verification: [SOC 2 Phase 1 Verification](../compliance/soc2-phase1-verification.md)

### 3.2 Regulatory
*   **Auctioneer Licensing**: [Risk Assessment](../compliance/regulatory_risk_assessment_auctioneer_licensing.md)
*   **Auditing**: [Auditing & Logging Standards](../compliance/auditing_logging.md)

## 4. AI Model Documentation

*   **Model Cards**: [Valuation Model Cards](../../valuation_model_cards.md) - Detailed breakdown of the Valuation Intelligence Engine's sub-models.
*   **Traces**: [Valuation Traces](../../valuation_traces.md) - Example inputs and outputs for the valuation system.

## 5. Test Log

| Date | Test Type | Report File | Status | Key Findings |
|------|-----------|-------------|--------|--------------|
| 2025-12-05 | Adversarial (Image) | [`adversarial-test-report-1764922257762.json`](../../adversarial-test-report-1764922257762.json) | ⚠️ 7/8 Passed | False positive on metadata stripping. |
| 2025-12-06 | Adversarial (Image) | [`adversarial-test-report-1764999251748.json`](../../adversarial-test-report-1764999251748.json) | ✅ 8/8 Passed | Resolved TC007 by enforcing strict provenance. |
| 2025-12-05 | Valuation Bias | [`valuation-bias-report-1764922290750.json`](../../valuation-bias-report-1764922290750.json) | ⚠️ Flagged | Geographic bias detected in 2/13 regions. |
| 2025-12-06 | Valuation Bias | [`valuation-bias-report-1764999505370.json`](../../valuation-bias-report-1764999505370.json) | ✅ Resolved | Fairness correction applied. Bias Score: 20.0. Flagged: 0. |

---
*Last Updated: 2025-12-06*
