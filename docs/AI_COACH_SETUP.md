# Pravely AI coach setup

The AI coach backend is implemented as the authenticated `health-coach`
Supabase Edge Function. The September 15 authorization, validation, timeout,
and quota hardening is local preview work and must be migrated and deployed
before it is described as live. The feature also remains unavailable until an
OpenAI API key with funded usage is stored as an Edge Function secret.

## Connect the key

1. Create a project API key in the OpenAI platform. Use a dedicated Pravely
   project so usage and limits are isolated from other applications.
2. In Supabase, open **Project Settings → Edge Functions → Secrets**.
3. Add `OPENAI_API_KEY` with the key as its value.
4. Optionally add `OPENAI_HEALTH_MODEL`. If omitted, Pravely uses
   `gpt-5.4-mini`.
5. Optionally add `HEALTH_COACH_HOURLY_LIMIT`. The default is 20 successful
   quota reservations per user per hour, bounded to 1–100.
6. Set `HEALTH_COACH_ENABLED=false` to disable provider calls immediately
   without an emergency application release.
7. Optionally set `AI_ALERT_EMAIL` to the founder's monitored address. If it is
   absent, AI outage alerts use `SUPPORT_EMAIL`.

The key must never be added to `content.json`, a `VITE_` variable, client-side
code, a mobile build, or source control. Supabase makes secret changes available
to hosted Edge Functions without a code redeploy.

CLI alternative:

```sh
supabase secrets set OPENAI_API_KEY=YOUR_KEY OPENAI_HEALTH_MODEL=gpt-5.4-mini
```

## Current integration

The Health Center sends the signed-in user's calculated health score, monthly
income and outflows, investing, debt payments, surplus, emergency runway, and
the user's question or selected scenario to the server-side coach. The model
returns a structured headline, summary, one to three actions, a follow-up
question, and a caution statement. Responses are educational and are prevented
from naming securities, inventing account data, or presenting legal, tax, or
financial advice.

The OpenAI request uses `store: false` and a one-way hashed safety identifier.
The browser never receives the API key.

The server independently verifies active Complete access (including an
unexpired Complete trial), reserves an atomic per-user quota, validates and
limits customer input, times out the provider request, and validates the
structured response before returning it. Provider errors are logged without
customer prompts or financial content. The interface clearly labels its local,
deterministic fallback when personalized coaching is unavailable.

## Founder outage and spend alerts

The Health Coach sends a fixed-content founder email when the provider fails,
returns an invalid response, or the AI/quota configuration is broken. Alerts
are deduplicated by type for 60 minutes. They include no customer prompt,
financial value, user ID, or account identifier.

Provider-billed spend is authoritative. In the OpenAI API platform, select the
dedicated Pravely project, open **Limits**, set a monthly spend limit, enable
enforcement as a hard limit, and add notification thresholds such as 50%, 80%,
and 100%. Project and organization owners receive those provider alerts. The
founder must choose the dollar amount; code should not guess a business budget.

For financial reconciliation, use OpenAI's Costs view or Costs API rather than
estimating dollars from application token logs. Pravely logs only aggregate
input/output/total token counts, request duration, and status.

## Kill-switch test

Run this test in a non-production preview:

1. Set `HEALTH_COACH_ENABLED=false` for the preview project.
2. Sign in with an active Complete test account and submit a Health Coach request.
3. Expect HTTP 503 and the app's clearly labeled built-in guidance; no OpenAI request should be made.
4. Set `HEALTH_COACH_ENABLED=true`.
5. Submit one synthetic request and expect a valid personalized structured response.
6. Confirm the Supabase log includes status, duration, and token counts but no prompt or financial values.
