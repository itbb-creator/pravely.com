# Web v1 fixes and AI integration test report

> **HISTORICAL SNAPSHOT.** This report predates the September 19 decision to include the installable PWA at launch. Use the private app repository's active pre-launch master plan and the current public feature table for launch scope.

Date: 2026-09-15  
Status: isolated hosted preview validated; production promotion still pending

## Outcome

The requested product decisions are now represented in local source and in the product truth table. The responsive web app is the launch product. Native packages, PWA certification, biometric lock, push notifications, and annual review are later releases. Business accounting remains founder/admin-only. Smart planning alerts are implemented for Complete and the seven-day Complete trial.

Two local previews were visually inspected:

- customer preview: admin-only Operations and Business accounting are absent; a smart goal-contribution alert appears in the notification center;
- expired-trial preview: the financial workspace is absent; plan purchase, sign-out, and a separate deletion-control page remain available;
- plan preview: responsive web access is current, while iOS/Android, biometric lock, and annual review are explicitly listed as post-launch plans;
- AI preview: a failed personalized request is clearly labeled as locally generated built-in guidance rather than being presented as an AI success.

## Basic app defects corrected

- Goal deletion now detaches the goal reference while preserving its connected budget contribution. The database migration uses `ON DELETE SET NULL (goal_client_key)` so the required customer ID cannot be cleared.
- Expired-trial customers have separate “Delete financial data” and “Delete account” actions without access to Settings or any financial workspace route.
- “Beta member” was replaced with “Valued Pravely customer” in personal reports.
- Empty “Video walkthrough coming soon” and unavailable contribution-payment controls were removed.
- Current plan copy no longer promises native apps or annual review. The marketing site and app plan screen now separate launch features from the post-launch roadmap.
- Smart in-app alerts now cover missing budget baseline, shortfall, low emergency buffer, debt without a payment, completed goals, missing goal contributions, and goal pace. Alert previews do not contain financial amounts.

## AI integration issues found and corrected

1. **Paid access was enforced only by the browser.** The server now independently allows only active Complete access, an unexpired Complete trial, or an administrator.
2. **There was no per-user cost/abuse control.** A server-only, atomic hourly quota is included, with a bounded configurable limit and cleanup of old windows.
3. **Provider failures silently appeared to be successful guidance.** The interface now displays a clear unavailable message and labels the deterministic fallback “Built-in guidance.”
4. **Inputs were passed through without a strict bounded normalization layer.** Numbers, modes, text lengths, and overall declared request size are now bounded before the provider call.
5. **A JSON parse was not enough to trust the provider response.** Required strings, length limits, and one-to-three actions are now validated after structured output.
6. **The provider request had no application timeout or output ceiling.** It now has a 25-second timeout and a 700-token output ceiling.
7. **Error logging could expose more provider detail than necessary.** Logs now retain status, error code/name, duration, and token counts—never prompts or financial values.
8. **There was no immediate kill switch.** `HEALTH_COACH_ENABLED=false` now disables provider calls without an app release.
9. **Prompt-injection handling was implicit.** The server instruction now explicitly treats all supplied JSON text as untrusted customer content that cannot alter the coach’s role or reveal instructions.
10. **No founder outage route existed.** Provider/configuration failures now reserve a deduplicated alert and send fixed-content email to `AI_ALERT_EMAIL` or `SUPPORT_EMAIL`, with no customer content.

No automatic retry was added. A failed request returns the safe unavailable state rather than risking duplicate cost or a long wait. This can be revisited only with measured production evidence.

## Checks completed successfully

- Full TypeScript check.
- Full production client and server build.
- Entitlement ownership and trial-access unit checks.
- Debt payoff focused checks.
- Goal deletion/link-preservation regression check.
- Smart-alert rule checks.
- Health Coach input bounding, structured response validation, malformed response, administrator, Complete, trial, expired-trial, and Plus authorization logic checks.
- Static release-hardening checks for the goal foreign key, AI RLS/revokes, server-only quota, timeout, output limit, kill switch, deletion coverage, and privacy-safe logging.
- Existing workbook-personalization suite.
- Visual browser review of the current-vs-future plan screen, smart-alert notification, expired-trial deletion page, and AI unavailable state.
- All migrations applied cleanly to the isolated no-production-data Supabase preview branch.
- Trial, Plus, and Complete accounts can read and write financial workspace data in the hosted preview.
- Expired customers are blocked at both the interface and database boundaries.
- Expired customers can still delete financial data or the entire account without regaining workspace access.
- Customer access to founder-only business accounting is denied by the hosted API.
- Hosted goal deletion preserves the associated budget row and clears only its goal link.
- Hosted AI authorization allows Complete/trial to reach the provider boundary and denies Plus/expired accounts.
- A simulated provider outage reserves the deduplicated founder alert, and the emergency kill switch returns the customer-safe unavailable response.
- The labeled production OpenAI key returned a funded structured response through the live Health Coach on September 16, 2026.
- The production kill switch returned the customer-safe local fallback, and normal funded AI responses resumed immediately after the switch was restored.
- The production quota, alert-state, paywall, goal-preservation, and deletion-service migrations are applied and recorded in remote migration history.

## Checks that still require the founder

- Set OpenAI project budget notification thresholds for the founder. OpenAI project budgets are alerting thresholds rather than a guaranteed hard stop, so the application quota and tested kill switch remain the enforcement controls.
- Confirm the founder receives a controlled real outage email during a future provider incident or a separately approved production alert-delivery exercise. The fixed-content alert reservation and delivery path passed in preview.
- Complete broader calculation, browser, export, payment/webhook, save-conflict, recovery-email, accessibility, backup/restore, and rollback acceptance tests.
- Complete the broader acceptance tests in the feature truth table; passing focused tests does not certify every v1 calculation, browser, export, payment, save, recovery, or deletion journey.

## Release recommendation

The funded AI response and kill-switch gates now pass in production. Do not treat that as certification of the remaining launch-blocking calculation, payment, recovery, export, accessibility, backup/restore, and rollback acceptance tests.
