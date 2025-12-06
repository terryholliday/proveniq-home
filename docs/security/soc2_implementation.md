# SOC 2 Security Implementation Notes

> **Note**: For a comprehensive list of all security features, safety tests, and compliance status, please refer to the [Security & Safety Tracking Document](./security_and_safety_tracking.md).

## 1. Authentication & RBAC

We use Firebase Authentication with **Custom Claims** to enforce Role-Based Access Control (RBAC).

*   **Roles**:
    *   `admin`: Full access to system configuration, user management, and sensitive audit logs.
    *   `verifier`: Can verify item authenticity (future phase).
    *   `user` (Standard): Can list items and place bids.
*   **Enforcement**:
    *   **Firestore Rules**: `request.auth.token.admin == true`
    *   **Cloud Functions**: Explicit checks in code (e.g., `if (!request.auth.token.admin) ...`).

## 2. Centralized Audit & Data Access Logs

To satisfy SOC 2 "monitoring" requirements, we leverage Google Cloud Logging.

### Configuration

1.  **Enable Data Access Audit Logs**:
    *   Go to **IAM & Admin > Audit Logs** in Google Cloud Console.
    *   Select **Firestore/Datastore API** and **Cloud SQL**.
    *   Enable **Admin Read**, **Data Read**, and **Data Write** log types.
2.  **Log Review**:
    *   Auditors can query logs in Logs Explorer:
        ```text
        resource.type="cloud_function" OR resource.type="datastore_database"
        protoPayload.methodName="google.firestore.v1.Firestore.Write"
        ```
    *   Logs capture the principal (User email/ID) and the resource accessed.

## 3. Secrets Management

Third-party API keys (e.g., Gemini, VirusTotal) are stored in **Google Cloud Secret Manager**, never in code.

### Usage

1.  **Set Secret**:
    ```bash
    firebase functions:secrets:set VIRUSTOTAL_API_KEY
    ```
2.  **Access in Function**:
    ```typescript
    import { defineSecret } from 'firebase-functions/params';
    const apiKey = defineSecret('VIRUSTOTAL_API_KEY');
    
    export const mySecureFunc = onCall({ secrets: [apiKey] }, (request) => {
       const key = apiKey.value();
       // Use key...
    });
    ```

## 4. Rate Limiting & Abuse Protection

*   **App Check**:
    *   Enforced on all callable functions (`enforceAppCheck: true`).
    *   Ensures traffic originates from our genuine web/mobile apps, blocking bots/scripts.
*   **Concurrency Limits**:
    *   `maxInstances` is configured on all functions (e.g., `maxInstances: 10` for creation, `50` for bidding).
    *   Prevents wallet-draining DoS attacks by capping the number of container instances.

## 5. File Upload Security

*   **Storage Rules**: Strict MIME type (`image/*`) and size (5MB) enforcement.
*   **Virus Scanning**:
    *   Integrated via **VirusTotal** Firebase Extension.
    *   Trigger: `onFinalize` (file upload).
    *   Action: Scans file; if malicious, moves to quarantine bucket or deletes, and logs result to Firestore `virus_scan_results`.

## 6. Phase 1 Controls Checklist

| Control | Status | Notes |
|---------|--------|-------|
| **Authentication** | ✅ Complete | Firebase Auth + Custom Claims |
| **RBAC** | ✅ Complete | Admin/Verifier/User roles |
| **Audit Logging** | ✅ Complete | Cloud Logging + Firestore triggers |
| **Secrets Management** | ✅ Complete | Secret Manager integration |
| **App Check** | ✅ Complete | Enforced on all callable functions |
| **Rate Limiting** | ✅ Complete | Firestore-based for bids |
| **File Upload Security** | ✅ Complete | MIME + size limits |
| **Virus Scanning** | ✅ Complete | VirusTotal extension |
| **RTBF (GDPR Art. 17)** | ✅ Complete | `rtbf.ts` Cloud Function |
| **Compliance Monitoring** | ✅ Complete | `compliance_monitor.ts` |
| **BIPA Addendum** | ✅ Complete | `docs/compliance/BIPA_addendum.md` |

### Pending for Phase 2
- [ ] Full Alexa signature verification
- [ ] Full Google JWT verification
- [ ] Request ID tracing
- [ ] Redis rate limiting (scale phase)
