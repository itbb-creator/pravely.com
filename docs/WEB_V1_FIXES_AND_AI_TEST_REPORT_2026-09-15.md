# Web v1 fixes and AI integration test report

Date: 2026-09-15  
Status: local preview only; not pushed or deployed

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

## Checks that still require the founder or a production-shaped preview

- Apply the two new database migrations and deploy the changed `health-coach`, deletion, and app builds to a non-production preview.
- Confirm the dedicated funded OpenAI project's hard spend limit and founder notification thresholds, then run one real positive request plus provider refusal, quota, timeout, and exhausted-credit cases.
- Exercise server authorization with real trial, Plus, Complete, expired, and revoked accounts. Local authorization tests do not prove hosted policy or secret configuration.
- Verify the new deletion actions against hosted data and confirm the AI quota table is included in both financial-data and account deletion.
- Route AI outage/spend alerts to the founder and test the kill switch.
- Complete the broader acceptance tests in the feature truth table; passing focused tests does not certify every v1 calculation, browser, export, payment, save, recovery, or deletion journey.

## Release recommendation

Do not push these changes directly to production. Review the open local previews first, then deploy to a preview environment, apply migrations, execute the live acceptance cases, and promote only if every launch-blocking test passes.
