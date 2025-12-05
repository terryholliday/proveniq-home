# MyARK Service Level Standards (Phase 4)

**Status:** Draft  
**Owner:** Lead Architect  
**Last Updated:** 2025-05-01

## 1. Principles
- **User Centricity:** We measure what the user experiences (e.g., "Time to Valuation"), not just server CPU.
- **Error Budget:** We target 99.9% availability, leaving 0.1% (43 minutes/month) for maintenance and innovation.
- **Consistency:** With Financial Partners, "Data Consistency" is more important than "Availability".

## 2. Core SLIs & SLOs

### 2.1 API Availability
*   **SLI:** Percentage of successful HTTP requests (`2xx` or `5xx` excluding `4xx`).
*   **SLO:** 99.9% over rolling 30 days.
*   **Target:** Enterprise Partner API.

### 2.2 Valuation Latency
*   **SLI:** Time from `POST /analyze` to receiving a confidence score.
*   **SLO:** 95% of requests < 3,000ms.
*   **Target:** Valuation Engine.

### 2.3 Eventual Consistency
*   **SLI:** Time from `write` to `read` returning the new data in a secondary region.
*   **SLO:** 99% < 500ms.
*   **Target:** Global State.

## 3. Incident Response
*   **Sev-1 (System Down):** Page on-call immediately. Response time < 15min.
*   **Sev-2 (Degraded):** Notify team slack. Response time < 2h.
*   **Sev-3 (Minor Bug):** Ticket for next sprint.

## 4. Maintenance Windows
*   Scheduled downtime for schema migrations must be communicated 72 hours in advance to "Premier" partners.
