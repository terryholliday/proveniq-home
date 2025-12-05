# MyARK Disaster Recovery Plan

## 1. Overview
This document outlines the strategy for data protection and recovery for the MyARK Firestore database. The goal is to ensure business continuity in the event of accidental data deletion, corruption, or catastrophic failure.

## 2. Backup Strategy

### 2.1 Scheduled Backups
We utilize Google Cloud Scheduler to trigger a Cloud Function (or direct HTTP target) that initiates a Firestore export operation.

-   **Frequency**: Daily at 03:00 UTC.
-   **Retention**: 30 days.
-   **Storage**: Google Cloud Storage bucket `gs://myark-backups`.

**Command to Schedule (Example):**
```bash
gcloud scheduler jobs create http scheduled-backup \
    --schedule="0 3 * * *" \
    --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments" \
    --message-body='{"outputUriPrefix":"gs://myark-backups/daily"}' \
    --oauth-service-account-email="firestore-backup-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

### 2.2 Point-in-Time Recovery (PITR)
Firestore PITR is enabled to allow restoration of data to any second in the last 7 days. This is critical for recovering from accidental "fat-finger" deletions or bad batch updates.

-   **Window**: 7 Days.
-   **Granularity**: 1 minute.

**Enablement:**
```bash
gcloud firestore databases update --type=firestore-native --enable-pitr
```

## 3. Restoration Playbook

### 3.1 Scenario A: Accidental Document Deletion
**Action**: Use PITR to recover the specific document.
1.  Identify the timestamp *before* the deletion.
2.  Read the document at that timestamp using the client SDK or `gcloud`.
3.  Write the data back to the live database.

### 3.2 Scenario B: Full Database Corruption
**Action**: Import from the latest healthy Scheduled Backup.
1.  **Stop Traffic**: Disable Cloud Functions and Security Rules to prevent new writes.
2.  **Import**:
    ```bash
    gcloud firestore import gs://myark-backups/daily/2023-10-27T03:00:00Z
    ```
3.  **Verify**: Check key collections (`users`, `legal_documents`) for integrity.
4.  **Resume**: Re-enable traffic.

## 4. Testing
-   **Drill Frequency**: Quarterly.
-   **Procedure**: Restore a backup to a *separate* project (`myark-staging`) and verify data integrity.
