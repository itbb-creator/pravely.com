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
3. Add the isolated keys as `OPENAI_API_KEY_PREVIEW` and
   `OPENAI_API_KEY_PRODUCTION`. Set `OPENAI_KEY_ENV` to `preview` in the
   preview project and `production` in the production project. The legacy
   `OPENAI_API_KEY` remains a fallback during migration only.
4. Optionally add `OPENAI_HEALTH_MODEL`. If omitted, Pravely uses
   `gpt-5.4-mini`.
5. Add `HEALTH_COACH_HOURLY_LIMIT` and `HEALTH_COACH_MONTHLY_LIMIT`. The
   hourly cap bounds how fast one account can spend; the monthly cap bounds
   what a one-time purchase can be made to cost over its life, and is the one
   that protects the margin. Recommended: `10` hourly and `100` monthly, which
   is far above real use and holds the worst case near $4.40 per customer per
   year. Defaults if unset are the same values. Both are clamped server-side
   (hourly to 100, monthly to 1000) so a mistyped secret cannot remove the cap.
   Every submitted request reserves one unit in both windows
   before calling OpenAI. For the first launch, publish the allowance in the
   plan wording, and raise it only from
   measured usage and support evidence.
6. Set `HEALTH_COACH_ENABLED=false` to disable provider calls immediately
   without an emergency application release.
7. Optionally set `AI_ALERT_EMAIL` to the founder's monitored address. If it is
   absent, AI outage alerts use `SUPPORT_EMAIL`.

The key must never be added to `content.json`, a `VITE_` variable, client-side
code, a mobile build, or source control. Supabase makes secret changes available
to hosted Edge Functions without a code redeploy.

CLI alternative:

```sh
supabase secrets set OPENAI_API_KEY_PRODUCTION=YOUR_KEY OPENAI_KEY_ENV=production OPENAI_HEALTH_MODEL=gpt-5.4-mini
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
dedicated Pravely project, open **Limits**, set a monthly budget, and add
notification thresholds such as 50%, 80%, and 100%. Treat these as spend alerts,
not a guaranteed hard stop. Pravely's per-user quota, bounded output, and tested
`HEALTH_COACH_ENABLED=false` switch are the enforceable application controls.
The founder must choose the dollar amount; code should not guess a business
budget.

For financial reconciliation, use OpenAI's Costs view or Costs API rather than
estimating dollars from application token logs. Pravely logs only aggregate
input/output/total token counts, request duration, and status.

## Recommended launch charging model

Launch with a fixed included request allowance for Complete instead of charging
for each individual click. The current server already supports this: set
`HEALTH_COACH_HOURLY_LIMIT` in Supabase Edge Function secrets, and requests over
the allowance return HTTP 429 without calling OpenAI.

Recommended sequence:

1. Pick and publish an included allowance, such as 5 requests per customer per
   hour during the seven-day trial and for Complete owners.
2. Measure actual OpenAI cost per completed request from the dedicated project's
   Costs data, grouped by project—not from an assumed token price.
3. Keep the 700-token output ceiling and 25-second timeout.
4. Review the first cohort before changing the allowance.
5. If customers need more, sell prepaid request packs through Stripe Checkout
   rather than allowing an open-ended postpaid balance.

Paid request packs require additional product work and should not be switched on
by configuration alone. Pravely would need a server-owned credit ledger, a
Stripe product and one-time price for each pack, signed idempotent webhook credit
grants, an atomic credit decrement before each provider call, refund/reversal
handling, visible balance and purchase history, and acceptance tests for duplicate
and out-of-order webhooks. The founder must approve the included allowance, pack
size, pack price, refund rule, and whether unused credits expire before that work
begins.

## Kill-switch test

Run this test in a non-production preview:

1. Set `HEALTH_COACH_ENABLED=false` for the preview project.
2. Sign in with an active Complete test account and submit a Health Coach request.
3. Expect HTTP 503 and the app's clearly labeled built-in guidance; no OpenAI request should be made.
4. Set `HEALTH_COACH_ENABLED=true`.
5. Submit one synthetic request and expect a valid personalized structured response.
6. Confirm the Supabase log includes status, duration, and token counts but no prompt or financial values.
