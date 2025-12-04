# Observability and Logging

## Logger (`src/lib/logger.ts`)

Structured JSON logging with automatic sanitization.

### Domain Events

| Event | Logger Method |
|-------|---------------|
| `USER_SIGNED_UP` | `logger.userSignedUp(userId)` |
| `USER_SIGNED_IN` | `logger.userSignedIn(userId)` |
| `HOUSEHOLD_CREATED` | `logger.householdCreated(userId, householdId)` |
| `ITEM_CREATED` | `logger.itemCreated(userId, itemId, category)` |
| `ITEM_UPDATED` | `logger.itemUpdated(userId, itemId)` |
| `ITEM_DELETED` | `logger.itemDeleted(userId, itemId)` |
| `AI_VALUATION_REQUESTED` | `logger.aiValuationRequested(userId, itemId)` |
| `AI_VALUATION_FAILED` | `logger.aiValuationFailed(userId, itemId, error)` |
| `AI_VALUATION_COMPLETED` | `logger.aiValuationCompleted(userId, itemId, latencyMs)` |
| `AUCTION_CREATED` | `logger.auctionCreated(userId, auctionId)` |
| `BID_PLACED` | `logger.bidPlaced(userId, auctionId, amount)` |

### Usage

```typescript
import { logger } from '@/lib/logger';

// Domain events
logger.itemCreated(userId, itemId, 'Electronics');
logger.aiValuationFailed(userId, itemId, 'Timeout');

// Generic logging
logger.info('CUSTOM_EVENT', { key: 'value' });
logger.error('OPERATION_FAILED', new Error('Details'));
```

### Security

- Sensitive keys (password, token, secret, apiKey) are auto-redacted
- Long strings (>500 chars) are truncated
- Debug logs only appear in development

### Log Levels

| Level | When to Use |
|-------|-------------|
| `info` | Normal operations, domain events |
| `warn` | Unexpected but recoverable situations |
| `error` | Failures, exceptions |
| `debug` | Development-only verbose logging |

### Output Format
```json
{
  "timestamp": "2024-12-04T10:30:00.000Z",
  "level": "info",
  "event": "ITEM_CREATED",
  "userId": "abc123",
  "itemId": "item456",
  "category": "Electronics"
}
```
