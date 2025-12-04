# AI Integration Stability

## AI Flows

| Flow | Purpose | File |
|------|---------|------|
| `generateAuctionDetails` | Generates auction title, description, starting bid | `ai-generate-auction-details.ts` |
| `generateTonedSalesAd` | Generates sales ads with specified tone | `ai-generate-toned-sales-ad.ts` |
| `roomAudit` | Analyzes room photos for inventory | `ai-room-audit.ts` |
| `aiSearchInventory` | AI-powered inventory search | `ai-search-inventory.ts` |
| `evaluateSalesResponse` | Evaluates buyer responses | `evaluate-sales-response.ts` |

## Stability Utilities (`src/ai/stability.ts`)

### `withAIStability<T>(fn, options)`
Wraps any AI call with:
- **Timeout**: Default 30s (configurable via `AI_TIMEOUT_MS`)
- **Retries**: Default 2 retries (configurable via `AI_MAX_RETRIES`)
- **Exponential backoff**: Delay increases per retry
- **Structured result**: Returns `{ success, data/error, latencyMs }`

### `getAIFallbackMessage(operationType)`
Returns user-friendly error messages for manual fallback.

## Configuration (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_TIMEOUT_MS` | 30000 | Maximum wait time for AI response |
| `AI_MAX_RETRIES` | 2 | Number of retry attempts |
| `AI_RETRY_DELAY_MS` | 1000 | Base delay between retries |

## Usage Example

```typescript
import { withAIStability, getAIFallbackMessage } from '@/ai/stability';

const result = await withAIStability(
  () => generateAuctionDetails(input),
  { operationName: 'auction_details' }
);

if (!result.success) {
  showToast({ message: getAIFallbackMessage('auction_details') });
}
```

## Logging

All AI calls log:
- Operation name
- Success/failure
- Latency (ms)
- Retry count
- Error message (if failed)

**No sensitive data (prompts, outputs) is logged.**
