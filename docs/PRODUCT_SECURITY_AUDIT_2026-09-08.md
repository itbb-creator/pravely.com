# Pravely Product and Security Audit

> **Historical audit snapshot.** Findings are evidence from September 8, not current certification; use the current master plan and rerun applicable checks before launch.

Date: September 8, 2026  
Scope: live `app.pravely.com` experience, account/recovery pages on `pravely.com`, this repository's Supabase migrations and Edge Functions, public HTTP headers, and anonymous-access probes. No production data was changed.

## Overall verdict

Pravely has a solid authorization foundation: core financial tables use per-user row-level security, private storage buckets did not disclose object names anonymously, privileged keys are kept server-side, Stripe webhooks verify signatures, and live anonymous probes were rejected. I did not find a confirmed active cross-user data leak.

The isolated preview now remediates the original bearer-link, deletion, AI-disclosure, baseline-header, administrator-MFA, dependency, and foreign-key-index findings. It is not yet ready for production until the owner-controlled items are completed: real CAPTCHA and service credentials, custom SMTP/email testing, leaked-password protection, an independent Storage backup, network restrictions, CSP enforcement after observation, and the final production rollout.

## Preview remediation verification — September 9, 2026

The app source was subsequently located at `tmp/pravely-app-source`, and the changes described below were implemented locally and on the isolated Supabase branch `security-preview`. Nothing in this update was deployed through Netlify or pushed to production.

- All 24 migrations are applied with no drift; database lint reports no schema errors. Covering indexes resolve every previously reported unindexed foreign key.
- All 24 public tables have RLS enabled, all constraints are validated, all three Storage buckets are private, browser roles cannot read the service-only deletion/license records, and authenticated access to `push_device_tokens` is limited to `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- All ten Edge Functions are active from the preview source. Workbook capabilities are 256-bit values stored only as SHA-256 hashes, rotate after use, and mint 10-minute signed URLs.
- A disposable live test verified cross-account RLS isolation, persistent first-login completion, TOTP enrollment with an `aal2` session, complete financial-data and Storage deletion, Auth-account deletion, administrator deletion blocking/auditing, administrator AAL2 enforcement, fail-closed Stripe/OpenAI behavior, and capability rotation. Synthetic users, records, and files were removed afterward.
- Preview Auth enforces a 12-character password minimum, email confirmation, Cloudflare Turnstile, a one-hour inactivity timeout, and TOTP MFA. Restrictive database policies and the admin email-preview function require administrator `aal2`. Localhost uses Cloudflare's official test keys; production must use its real widget keys.
- Direct Postgres SSL enforcement is enabled on the preview branch. Database network restrictions remain a production configuration decision because the trusted office/VPN CIDR ranges have not been supplied.
- The local Windows preview build, server launch, HTTP/security-header smoke test, and browser rendering of sign-in, signup, recovery, and Turnstile all passed. The dependency audit reports zero vulnerabilities, and the former 1.5 MB startup bundle is split into bounded framework, Supabase, chart, and lazy PDF chunks without build warnings.

The findings below preserve the original audit snapshot. Treat a finding as remediated in preview where this update explicitly says so; production remains unchanged until the final reviewed release.

## Highest-priority findings

### P1 — Paid workbook downloads rely on long-lived bearer identifiers

`get-download` accepts either a license ID or Stripe Checkout session ID without requiring a signed-in user for purchased workbooks, then creates a signed Storage URL valid for up to 72 hours. A leaked email link, browser-history entry, support transcript, analytics record, or license ID can therefore grant workbook access. The per-license download limit is not a substitute for authenticating the recipient and is subject to concurrent-request races.

Recommended fix: require an authenticated account for every customer workbook, or replace license/session query values with a random 128-bit or stronger download capability stored only as a hash, rotate it after use, shorten signed-URL lifetime to 5–15 minutes, and add account/IP rate limits plus audit alerts.

### P1 — “Delete data” does not delete all financial data or files

The `delete-user-data` function deletes personal budget, debt, goal, net-worth, feedback, token, and settings rows, but it does not delete business-accounting tables or `business-receipts` objects. `delete-account` removes only free licensed-workbook files before deleting the Auth user; business receipt files can remain orphaned in private Storage. This does not match the app's broad deletion language or the privacy notice's promise to delete the customer-entered financial workspace.

Recommended fix: enumerate all user-owned tables and Storage prefixes in one server-side deletion workflow, record completion, verify both row counts and object counts, retry partial failures, and distinguish legally retained purchase records from customer-entered financial data in the UI.

### P1 — The app is missing a Content Security Policy and several defense-in-depth headers

The live app response included HSTS but no Content-Security-Policy, X-Content-Type-Options, frame protection, Referrer-Policy, or Permissions-Policy. The marketing/account host has some baseline headers but still lacks CSP and Permissions-Policy. This matters because the app keeps the full working plan and Supabase session material in browser storage; a successful script injection would have a large blast radius.

Recommended fix: add a nonce- or hash-based CSP, `frame-ancestors 'none'` (or an explicit allowlist), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a minimal Permissions-Policy, and a staged report-only CSP rollout before enforcement.

### P1 — Supabase database backups do not cover workbook or receipt files

The repository has no independent Storage backup/restore process for `workbook-masters`, `licensed-workbooks`, or `business-receipts`. Supabase's database backups cover Storage metadata, not the actual objects. A database restore would not restore deleted Storage files.

Recommended fix: maintain an encrypted, versioned copy of master workbooks and business receipts in a separate account/provider or isolated bucket, monitor backup age and object counts, and run quarterly restore drills. Customer-generated licensed workbooks can be regenerated if the master and license data are recoverable; receipts generally cannot.

### P1 — AI processing is not disclosed in the privacy provider list

The authenticated health-coach function sends user-entered financial summaries and free-text prompts to OpenAI. The request uses `store: false` and a one-way hashed safety identifier, which is good, but the privacy page's service-provider update names Supabase and Resend and does not name OpenAI or describe this transfer.

Recommended fix: add an AI-specific disclosure covering what is sent, purpose, retention setting, user choice, and subprocessors; show a concise in-product notice before first use. Have counsel review the final language.

## Product and UX findings

### P1 — Debt payoff handoff opens the wrong calculator

From Current debts, **Open in debt payoff calculator** opens Home affordability. The deployed code initializes the calculator to Mortgage for Plus/Complete users and the debt-page action only opens the calculator section; it does not select Debt payoff.

![Current debt evidence](../test-output/product-audit-2026-09-08/05-current-debt.png)

![Wrong calculator landing](../test-output/product-audit-2026-09-08/06-wrong-calculator-landing.png)

### P1 — Debt payoff values are stale

The saved debt shows a $20,000 balance, 4% rate, and $400 required payment. Debt payoff shows the same debt name and rate but a $39,000 balance and $500 payment. The deployed code restores calculator-state fields independently from the selected debt, and selecting the already-selected debt does not trigger a refresh.

Recommended fix: when entering Debt payoff from a debt card, pass the debt ID and hydrate all four values. When saved debt data changes, refresh the modeled values unless the user explicitly chose to keep a separate scenario. Separate “Use saved debt values” from “Custom scenario” so the behavior is clear.

![Debt calculator mismatch](../test-output/product-audit-2026-09-08/07-debt-calculator-mismatch.png)

### P1 — “Create a free account” lands on Log in

The app links to `pravely.com/account.html`, but the account script defaults unauthenticated visitors to the Log in tab. A new customer must notice and manually switch to Create account.

Recommended fix: link to `account.html#signup` and teach the account page to honor that route, or host account creation directly inside the app.

![Account page defaults to Log in](../test-output/product-audit-2026-09-08/02-account-defaults-to-login.png)

![Create-account form after manual tab switch](../test-output/product-audit-2026-09-08/03-create-account.png)

### P2 — First-login popup state is not fully reliable

The current deployed logic correctly checks a server user-metadata timestamp plus a device-local `pravely-welcome-v2:<user>` marker, so the popup did not reproduce on the established test account. However, closing it writes the durable server marker in a fire-and-forget call whose failure is silently ignored. On another device, or after a failed metadata write/local-storage loss, the popup can return. Versioning the local marker can also re-show it to existing users.

Recommended fix: store `welcome_completed_at` in a first-class per-user settings row, await and verify the update, keep the dialog closed optimistically, retry failed writes, and log a privacy-safe operational error. Add a test for first login, second login, new device, and offline/failed-save behavior.

### P2 — Account sessions are split across subdomains

A user signed in to `app.pravely.com` appears signed out on `pravely.com/account.html` because browser session storage is origin-scoped. The product copy says the same account carries into the app, but the transition feels like a second login.

Recommended fix: consolidate auth UI under the app origin or use a short-lived, server-validated handoff flow. Do not attempt to share raw session tokens through query strings.

### P2 — Calculator number inputs are not programmatically labeled

The calculator renders visual `<label>` elements separately from their `<input>` elements without `for`/`id` association. In the accessibility tree, numeric steppers expose values but not names such as Debt balance or Required monthly payment. Screen-reader users may not know which number they are editing.

Recommended fix: give every input a stable ID and bind the label with `htmlFor`, or wrap the input inside the label. Add automated accessible-name assertions and keyboard tests.

### P2 — Mobile calculator navigation is cramped

Calculator tabs overflow horizontally with partially visible controls and a browser-style scrollbar. The selected tool is not always obvious, and Home affordability appeared even while Debt payoff was the action that brought the user there.

Recommended fix: use a wrapped two-row control, compact select, or clearly labeled horizontal carousel with visible previous/next buttons and selected-state announcement.

### P3 — Recovery and signup URLs expose email addresses

After signup or reset request, the account code places the email address in the confirmation/recovery query string for display. URLs are commonly retained in browser history and infrastructure logs.

Recommended fix: show a masked email from session storage or ephemeral application state and remove it immediately from the address bar; do not put raw email addresses into URLs.

### P3 — Password policy is only visibly eight characters

The UI and checked-in Auth configuration require only eight characters. TOTP endpoints are enabled, but the app does not provide an enrollment/challenge flow and therefore does not enforce MFA for customers.

Recommended fix: require at least 12 characters, enable leaked-password protection if the plan supports it, add bot protection to signup/sign-in/recovery, and implement optional MFA first, then require it for administrators and sensitive actions.

### P3 — Admin email-preview secret is carried in the URL

`preview-email` authenticates with `?key=<ADMIN_KEY>`. Query-string secrets can leak through history, logs, copied links, and screenshots.

Recommended fix: require an authenticated admin JWT and `app_metadata` role, or send a short-lived secret in the Authorization header. Never use a durable admin secret in a URL.

## Confirmed strengths

- Live anonymous table probes were rejected for financial, license, feedback, telemetry, entitlement, token, and business-accounting tables.
- Anonymous list attempts returned no objects from all three private buckets.
- Core customer tables have RLS enabled with ownership checks for read, create, update, and delete.
- Admin checks use `app_metadata`, not user-editable metadata.
- Storage receipt policies require the admin role and the user's own folder prefix.
- Service-role credentials and third-party secret keys were not found in tracked code; the browser receives only a publishable key.
- Stripe webhook signatures are validated, and processed event IDs are recorded.
- Email confirmation is enabled; free workbook claims require a confirmed account.
- The app signs inactive users out after ten minutes and strips emails, UUIDs, and long numbers from client error telemetry.
- The AI request disables response storage and sends a hashed safety identifier rather than the Supabase user ID.
- A disallowed test Origin received no CORS allow-origin header.
- Existing workbook-personalization tests passed.

## What should be automated

1. **Every pull request:** secret scanning, dependency/lockfile checks, static inspection of migrations for missing RLS, unsafe grants, public `SECURITY DEFINER` functions, unsafe views, and storage policies; unit tests for calculator mapping and welcome-state persistence.
2. **Every deployment:** browser tests with disposable accounts for signup, email-confirmation callback, sign-in, forgot-password request, first-login popup exactly once, second device behavior, debt-to-calculator transfer, keyboard navigation, and accessible names.
3. **Nightly:** harmless anonymous probes against canary tables/buckets, TLS/header checks, Edge Function auth checks, Supabase Security/Performance Advisor review, and alerts only on regressions.
4. **Daily/weekly:** encrypted Storage backup plus manifest/hash verification; alert on missing masters, object-count drift, backup age, or failed restore sampling.
5. **Quarterly:** automated restore drill into an isolated project and a human-reviewed deletion test using synthetic users and synthetic receipt files.

Give agents read-only or narrowly scoped credentials. Keep production service-role keys only in protected CI/Edge Function secrets, require human approval for schema/policy changes, and never let an autonomous agent delete production data or rotate credentials without an explicit change window.

## Evidence limits

- The app source repository was not available during the initial audit, so its original product-code findings were traced through the deployed minified bundle. The nested source repository was later located and used for the preview remediation above.
- Preview CAPTCHA, TOTP/AAL2 enforcement, Auth policy, database schema, Security Advisor results, dependency audit, and SSL enforcement were subsequently verified. Supabase is on Pro, but a live known-password check confirms leaked-password protection is not enabled. Production project/org MFA enforcement, direct-database network restrictions, backup/PITR status, custom SMTP, log retention, team access, and positive Stripe/OpenAI/Resend paths still require an owner review or credentials before release.
- No new account, password-reset email, destructive deletion, purchase, cross-user authorization, or penetration test was performed against production.
- Screenshot review cannot establish full WCAG compliance; assistive-technology, keyboard, zoom/reflow, contrast, and automated accessibility testing remain necessary.

## Current Supabase guidance used

- [Secure configuration of Supabase products](https://supabase.com/docs/guides/security/product-security)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Password security](https://supabase.com/docs/guides/auth/password-security)
- [Production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
- [Database backups](https://supabase.com/docs/guides/platform/backups)
- [Postgres SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement)
- [Database network restrictions](https://supabase.com/docs/guides/platform/network-restrictions)
