# VirusTotal Extension Configuration

To secure file uploads, we integrate the **VirusTotal** Firebase Extension. This scans every file uploaded to Cloud Storage for malware.

## 1. Installation

Install the extension via the Firebase Console or CLI:

```bash
firebase ext:install google/firestore-virustotal-malware-scan --project=YOUR_PROJECT_ID
```

## 2. Configuration Parameters

During installation, configure the following:

*   **VirusTotal API Key**: Obtain from VirusTotal and store securely (use Secret Manager if supported by extension config, otherwise strict access control).
*   **Input Bucket**: The default storage bucket (or specific one).
*   **Paths to Scan**: `user_uploads/**` (Matches our `storage.rules`).
*   **Action on Malicious File**: `Delete` (Recommended for high security) or `Move to Quarantine Bucket`.
*   **Scan Timeout**: `300` seconds.

## 3. Workflow

1.  **Trigger**: User uploads file to `user_uploads/{uid}/items/{itemId}/{filename}`.
2.  **Scan**: Extension detects new object and sends hash to VirusTotal.
3.  **Result**:
    *   **Clean**: File remains. Metadata updated with `virusScan: "clean"`.
    *   **Malicious**: File is deleted/quarantined.
4.  **Logging**: Scan results are written to a Firestore collection (e.g., `virus_scan_results`) for audit.

## 4. Frontend Handling

The frontend should monitor the file's metadata or the separate `virus_scan_results` document to confirm the upload is "clean" before displaying it to other users.
