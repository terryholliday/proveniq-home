# MyARK Operational Runbook Library (Phase 4)

**Status:** Living Document  
**Owner:** DevOps / SRE  
**Last Updated:** 2025-05-01

## 1. Incident Response (SRE)

### 1.1 [OPS-001] API Availability Drop (< 99.9%)
**Trigger:** Datadog Alert `[SLO] High API Error Rate`.
**Steps:**
1.  **Ack:** Acknowledge PagerDuty within 15m.
2.  **Triag:** Check `myark-api` logs for `5xx` spikes. Is it all tenants or just one?
3.  **Mitigate:**
    *   If Global: Rollback recent deployment (`gcloud run services update-traffic myark-api --to-latest --traffic=0`).
    *   If One Tenant: Throttle that tenant via `TenantConfig` (Rate Limit).
4.  **Communicate:** Update Status Page (`status.myark.io`).

### 1.2 [OPS-002] Multi-Tenant Leak (Sev-0)
**Trigger:** Security `Tenancy Violation Detect` alert.
**Steps:**
1.  **Lockdown:** Immediately revoke the API keys of the suspicious IP/Tenant.
2.  **Audit:** Query `audit_logs` in BigQuery for the last hour of that user's activity.
3.  **Report:** Notify Legal/Compliance immediately (Potential GDPR Breach).

## 2. Release Management

### 2.1 [REL-001] Backend Deployment
**Frequency:** Bi-weekly (Tuesday).
**Checklist:**
- [ ] ALL Unit & E2E tests passed (Green Build).
- [ ] Database migrations tested on Staging with sample Partner Data.
- [ ] Canary Deployed to 5% traffic for 1 hour.
- [ ] Full Rollout + Post-deployment Smoke Test.

### 2.2 [REL-002] Partner Feature Flag Rollout
**Mechanism:** LaunchDarkly / Firebase Remote Config.
**Steps:**
1.  Enable feature `flag_new_valuation_v2` for `tenant_id: staging_partner`.
2.  Partner validates in their sandbox.
3.  Enable for 10% of Production Traffic.
4.  Monitor Latency SLO.

## 3. Partner Operations

### 3.1 [PARTNER-001] Onboarding New Carrier
**Owner:** Strategic Partnerships.
**Steps:**
1.  Create `TenantEntry` in Firestore (`tenants/srv_statefarm`).
2.  Generate API Keys (Rotated monthly).
3.  Configure Webhooks for `valuation.completed`.
4.  Send "Welcome Packet" (API Docs + Credentials) via secure email.

## 4. Compliance

### 4.1 [COMP-001] Quarterly Access Review
**Trigger:** Calendar invite (Jan/Apr/Jul/Oct).
**Steps:**
1.  Export list of all users with `admin` or `support` role.
2.  Manager approval required for each retention.
3.  Revoke access for any user not verified within 5 days.
