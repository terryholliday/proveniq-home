# Event-Driven Architecture Strategy (Phase 4)

**Status:** Draft  
**Owner:** Lead Architect  
**Last Updated:** 2025-05-01

## 1. The Need for Events
As MyARK expands into multiple products (MyARK Consumer, TrueManifest, ARKive Auctions), monolithic function calls create tight coupling and failure cascades. We will move to an **Asynchronous EventBus model**.

## 2. Core Concepts

### 2.1 The Event Bus
All state changes trigger an "Event" published to Google Cloud Pub/Sub.
- **Topic:** `myark-domain-events` (Single topic with filtering vs Multi-topic? -> Start with Multi-topic by Domain).

### 2.2 Domain Topics
1.  `item.lifecycle`: `item.created`, `item.updated`, `item.transferred`.
2.  `valuation.lifecycle`: `valuation.requested`, `valuation.completed`.
3.  `auction.lifecycle`: `auction.started`, `bid.placed`, `auction.ended`.

## 3. Standard Event Schema (CloudEvents)
We will adopt the [CloudEvents](https://cloudevents.io/) spec json format:
```json
{
  "specversion": "1.0",
  "type": "com.myark.item.created",
  "source": "/myark/inventory-service",
  "id": "uuid-1234",
  "time": "2025-05-01T12:00:00Z",
  "datacontenttype": "application/json",
  "data": { ... }
}
```

## 4. Workflows Enabled
1.  **Valuation:** `item.created` -> triggers `RequestValuation` subscriber.
2.  **Audit:** `*` -> triggers `AuditLogger` subscriber (writes to BigQuery).
3.  **Notifications:** `valuation.completed` -> triggers `NotifyUser` subscriber.

## 5. Migration Plan
- **Phase 1:** Define the `EventBus` library (wrapper around PubSub).
- **Phase 2:** Dual-write commands (Update DB + Publish Event).
- **Phase 3:** Extract side-effects (e.g., sending email) from the API handler to an Event Subscriber.
