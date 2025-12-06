# TrueManifest Partner API Specification

## Overview

This document specifies the API contract for insurance partner integrations with MyARK's TrueManifest feature.

**Version:** 1.0  
**Base URL:** `https://api.myark.app/v1/partner`  
**Authentication:** OAuth 2.0 Bearer Token + API Key

---

## Authentication

All requests must include:
```
Authorization: Bearer <partner_access_token>
X-Partner-Key: <partner_api_key>
```

### Token Exchange
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=<partner_client_id>
client_secret=<partner_client_secret>
scope=manifest:read inventory:read valuation:read
```

---

## Endpoints

### 1. Get User Manifest

Retrieve a user's complete inventory manifest for insurance purposes.

```
GET /manifest/{userId}
```

**Scopes Required:** `manifest:read`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `include_provenance` | boolean | Include provenance history |
| `include_valuations` | boolean | Include estimated values |
| `category` | string | Filter by category |
| `min_value` | number | Minimum item value |

**Response:**
```json
{
  "manifest": {
    "userId": "string",
    "generatedAt": "ISO8601",
    "totalItems": 150,
    "totalEstimatedValue": 285000,
    "items": [
      {
        "id": "item_abc123",
        "name": "Rolex Submariner",
        "category": "watches",
        "estimatedValue": 15000,
        "purchasePrice": 12500,
        "purchaseDate": "2020-03-15",
        "condition": "excellent",
        "imageUrl": "https://...",
        "imageHash": "sha256:abc...",
        "visualTruthVerified": true,
        "provenanceScore": 92,
        "provenance": [
          {
            "date": "2020-03-15",
            "type": "acquisition",
            "verified": true
          }
        ]
      }
    ]
  },
  "signature": "base64_manifest_signature"
}
```

---

### 2. Get Single Item

Retrieve details for a specific item.

```
GET /items/{userId}/{itemId}
```

**Scopes Required:** `inventory:read`

**Response:**
```json
{
  "item": {
    "id": "string",
    "name": "string",
    "description": "string",
    "category": "string",
    "subcategory": "string",
    "estimatedValue": 15000,
    "purchasePrice": 12500,
    "purchaseDate": "2020-03-15",
    "condition": {
      "overall": "excellent",
      "scratches": false,
      "damage": false,
      "wearLevel": "low"
    },
    "images": [
      {
        "url": "https://...",
        "hash": "sha256:...",
        "verifiedAt": "ISO8601"
      }
    ],
    "documents": [
      {
        "type": "receipt",
        "url": "https://..."
      }
    ],
    "provenance": [],
    "visualTruth": {
      "status": "verified",
      "verifiedAt": "ISO8601",
      "hash": "sha256:..."
    }
  }
}
```

---

### 3. Request Valuation

Request an updated valuation for an item.

```
POST /valuations/request
```

**Scopes Required:** `valuation:read`

**Request Body:**
```json
{
  "userId": "string",
  "itemId": "string",
  "purpose": "insurance_renewal"
}
```

**Response:**
```json
{
  "valuationId": "val_xyz789",
  "status": "pending",
  "estimatedCompletion": "ISO8601"
}
```

---

### 4. Webhook Registration

Register a webhook for real-time updates.

```
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://partner.example.com/webhook",
  "events": [
    "item.created",
    "item.updated",
    "item.deleted",
    "valuation.completed",
    "manifest.updated"
  ],
  "secret": "webhook_signing_secret"
}
```

---

## Webhook Events

### Event Format
```json
{
  "event": "item.updated",
  "timestamp": "ISO8601",
  "data": {
    "userId": "string",
    "itemId": "string",
    "changes": ["estimatedValue", "condition"]
  },
  "signature": "HMAC-SHA256"
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/manifest/{userId}` | 100/hour |
| `/items/{userId}/{itemId}` | 1000/hour |
| `/valuations/request` | 50/hour |

---

## Error Codes

| Code | Description |
|------|-------------|
| 401 | Invalid or expired token |
| 403 | Insufficient scope |
| 404 | User or item not found |
| 429 | Rate limit exceeded |
| 500 | Internal error |

---

## Data Privacy

- All PII is redacted by default
- Partners must comply with our DPA
- User consent is required for data sharing
- See `docs/compliance/bipa-policy.md` for biometric data handling
