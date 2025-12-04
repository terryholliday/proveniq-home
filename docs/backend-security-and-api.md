# Backend Security and API Documentation

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/alexa` | POST | Alexa Signature + Firebase Token | Alexa voice assistant integration |
| `/api/google` | POST | Google Signature + Firebase Token | Google Assistant integration |

## Security Features (Already Implemented)

### 1. Rate Limiting (`voice-helpers.ts`)
- In-memory rate limiter (per-IP)
- Default: 60 requests per 60 seconds
- Configurable via `VOICE_RATE_LIMIT` and `VOICE_RATE_WINDOW_MS` env vars

### 2. Input Validation (Zod Schemas)
- `AlexaRequestSchema`: Validates Alexa request structure
- `GoogleRequestSchema`: Validates Google Assistant request structure
- Returns 400 with details on validation failure

### 3. Authentication
- Firebase ID token verification via `requireFirebaseUser()`
- Platform signature header checks (Alexa, Google)
- Returns 401 on missing/invalid tokens

### 4. Structured Logging
- `logEvent()`: Logs voice events with sanitization (truncates long strings)
- `logError()`: Logs errors with message/stack (JSON format)

## Firestore Security Rules

| Collection | Access | Notes |
|------------|--------|-------|
| `/users/{userId}` | Owner only | Strict user-ownership model |
| List `/users` | Denied | Prevents data scraping |

Current rules enforce:
- `isOwner()`: Request UID must match document path
- `isIdImmutable()`: Document ID field cannot be changed
- `hasValidIdOnCreate()`: New docs must have matching ID field

## Recommendations

1. **TODO**: Implement full Alexa signature verification (currently header-only check)
2. **TODO**: Implement full Google JWT/signature verification
3. Consider adding request ID tracking for tracing
