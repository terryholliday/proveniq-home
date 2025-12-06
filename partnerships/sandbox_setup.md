# MyARK Partnership Sandbox Setup

## Overview
The MyARK Sandbox is a dedicated environment for partners to test API integrations and data exchanges without affecting production data.

## Architecture
- **Environment**: Isolated Firebase Project (`myark-sandbox`) or a dedicated tenant in the staging environment.
- **Data Seeding**: Pre-populated with dummy user accounts and asset data.
- **Authentication**: Separate API keys and OAuth clients for sandbox testing.

## Setup Instructions for Partners

### 1. Request Access
Partners must request sandbox access via `partnerships@myark.app`. Upon approval, they will receive:
- `CLIENT_ID` and `CLIENT_SECRET` for OAuth.
- A test user account credentials.

### 2. API Configuration
**Live Sandbox API:** `https://sandboxapi-tyo5hny77q-uc.a.run.app`

**Authentication:** Include the API key in the `Authorization` header as `Bearer <API_KEY>`.

**Example Request:**
```bash
curl -X GET "https://sandboxapi-tyo5hny77q-uc.a.run.app/test" \
  -H "Authorization: Bearer sb_key_lemonade_123"
```

### 3. Testing Scenarios
#### Insurance Policy Sync
1. Authenticate using OAuth credentials.
2. POST to `/policies` with sample policy data.
3. Verify the policy appears in the test user's dashboard.

#### Smart Home Device Discovery
1. Simulate a device discovery event via webhook.
2. POST to `/webhooks/devices` with a JSON payload of a mock device.
3. Verify the asset is created in the MyARK inventory.

## Internal Setup (For MyARK Ops)
1. **Create Sandbox Project**: Ensure a separate Firebase project is linked for the sandbox.
2. **Deploy Functions**: Deploy `gemini-proxy` and other functions to the sandbox project.
3. **Seed Data**: Run the `scripts/seed_sandbox_data.ts` script to populate initial data.
