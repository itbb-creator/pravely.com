# Pravely security configuration and backup runbook

This runbook covers the security work that cannot be completed safely from source code alone. Complete these steps in a non-production or preview environment first. Never paste a secret into source control, a URL, a support ticket, or a screenshot.

## 1. Activate Cloudflare Turnstile CAPTCHA

Code support is present for sign-up, sign-in, and password recovery on both the app and the legacy account page. The isolated Supabase preview branch uses Cloudflare's official test site key and test secret so automated and localhost flows are deterministic. Production must use a real widget and secret.

1. In Cloudflare, open **Turnstile** and create a widget named `Pravely authentication`.
2. Add the exact production and preview hostnames that will render the widget. Include `app.pravely.com` and the Netlify preview hostname; do not add wildcard domains unless they are necessary.
3. Choose **Managed** mode.
4. Copy the **site key** into the app build environment as `VITE_TURNSTILE_SITE_KEY`.
5. Put the same site key in the marketing site's public `content.json` value `captchaSiteKey`. A site key is public; the secret is not.
6. Before pushing `supabase/config.toml`, provide the real secret as the temporary shell environment variable `SUPABASE_AUTH_CAPTCHA_SECRET`; the source file references that variable and never stores the value. Alternatively, configure the same secret in **Authentication → Bot and Abuse Protection → CAPTCHA** in the Supabase Dashboard.
7. Confirm the Supabase Auth redirect allowlist includes the exact app origin and its recovery destination. Keep production and preview entries explicit.
8. In preview, verify all three flows reject a missing or invalid token. Then verify a real sign-up, sign-in, and password-recovery request.
9. Rotate the Turnstile secret immediately if it is ever exposed. Do not add the secret to Netlify unless another server-side component truly needs it.

Localhost uses Cloudflare's documented test site key. The `security-preview` Supabase branch is intentionally configured with its matching test secret. Never copy either test credential into production configuration.

## 2. Strengthen Supabase Auth settings

1. Open **Supabase Dashboard → Authentication → Sign In / Providers → Email**.
2. Set the minimum password length to **12**. The UI already enforces 12; the server setting is the authoritative control.
3. Require email confirmation and keep secure email-change confirmation enabled.
4. Enable leaked-password protection. The organization is on Supabase Pro, so the control is available; a September 9 preview check confirmed it is currently off.
5. Review **Authentication → URL Configuration**. Set the app origin as the Site URL and use an explicit redirect allowlist. Remove unused wildcard redirects.
6. Review session lifetime and inactivity timeout. For financial data, prefer a bounded session and require recent authentication before destructive or high-risk actions.
7. Enable TOTP MFA. Offer it to all customers, then require an `aal2` session for administrators and sensitive actions before calling those server functions.
8. Create and test a separate, non-admin recovery account. Administrator accounts should not be the only path to recovery.

The preview branch now enforces the 12-character minimum, email confirmation, a one-hour inactivity timeout, TOTP enrollment/verification, and administrator `aal2` for accounting tables and the email-preview function. Administrator self-deletion is blocked and audited. Before the production migration is applied, every administrator must enroll TOTP and a separate recovery administrator must be tested, or accounting access will correctly remain blocked.

## 3. Apply and verify the database migrations

All 24 migrations are applied to the isolated `security-preview` branch. This includes first-login state, hashed rotating download capabilities, one-time checkout handoffs, a service-only deletion-completion ledger, restricted push-token grants, covering foreign-key indexes, and administrator AAL2 enforcement.

The preview verification completed these checks:

1. Authenticated customers cannot read service-only deletion or license records.
2. Workbook capabilities are stored as 64-character SHA-256 digests, rotate after use, and produce 10-minute signed URLs.
3. Normal-customer financial deletion removes personal and business rows, receipts, and free generated workbooks while preserving the Auth identity.
4. Full account deletion removes the same data and the Auth identity.
5. Administrator deletion is blocked and audited without removing accounting data or the account.
6. Administrator accounting access and email preview fail at AAL1 and succeed only after TOTP raises the session to AAL2.
7. Every public table has RLS, every constraint is valid, all three Storage buckets are private, and the Security Advisor has no warning/error finding.
8. The Performance Advisor no longer reports an unindexed foreign key. Its remaining unused-index notices are expected on an empty preview branch and should be reviewed only after production traffic produces representative statistics.

For production, review and apply the complete ordered migration folder—not an isolated migration—during the approved release window, then repeat these verification steps with synthetic data only.

Set `DOWNLOAD_RATE_LIMIT_SALT` to a dedicated random secret in Supabase Edge Function secrets. Do not reuse the service-role key long term. `DOWNLOAD_LINK_TTL_MINUTES` may be set from 5 through 15; the default is 10.

## 4. Independent Storage backup

Supabase database backups do not include Storage objects. Use a different security boundary—not merely another bucket in the same project—for irreplaceable receipts and master workbooks.

Recommended baseline:

- Destination: a separate cloud account or provider with object versioning, server-side encryption, and object-lock/immutability support.
- Scope: all objects under the private `business-receipts` bucket and every master workbook source. Generated customer workbooks may be regenerated when master workbooks and license data are recoverable.
- Credentials: a write-only backup identity for daily copies and a separate, offline recovery identity. Neither belongs in browser code.
- Schedule: incremental copy at least daily; monitor the age of the latest successful run and source/destination object counts.
- Retention: keep version history and deletion protection according to legal/accounting advice. Receipt retention may be jurisdiction-specific.
- Restore: quarterly, restore a sample into an isolated location, verify hashes and readability, document the result, then remove the test copy under the approved retention process.

Automation design:

1. A scheduled server job lists source objects page by page, streams each object to the independent destination, and records source path, size, ETag/hash, and backup version ID.
2. The job never places object contents, signed URLs, customer names, or receipt paths in general logs.
3. A monitor alerts only when backup age exceeds the target, object-count drift is unexplained, a copy fails, or a quarterly restore is overdue.
4. A separate restore command requires an operator-selected destination and never overwrites production automatically.
5. Use provider-native immutable retention where available; an AI agent must not possess authority to shorten retention or delete backups.

Choosing and connecting the independent provider is still required before this automation can be implemented. Appropriate options include a separately owned S3-compatible account with Object Lock, Google Cloud Storage with Bucket Lock, or Azure Blob immutable storage.

## 5. CSP rollout

The app and marketing site now send the other defense-in-depth headers. CSP is intentionally **Report-Only** while remaining inline styles/scripts and third-party calls are inventoried.

1. Exercise every page and authentication/payment/download flow in preview.
2. Collect CSP violations in a privacy-safe reporting endpoint. Do not log full financial URLs or query values.
3. Move remaining inline scripts/styles to static assets or use per-response nonces/hashes.
4. Reduce host wildcards to exact required origins.
5. Run at least one clean observation period, then change `Content-Security-Policy-Report-Only` to enforced `Content-Security-Policy`.
6. Retain reporting briefly after enforcement so regressions are visible.

Do not switch directly to enforcement before checkout, CAPTCHA, Supabase, fonts, workbook delivery, and mobile packaging have been verified.

## 6. AI processing controls

The privacy page and first-use in-product notice now describe the fields sent to OpenAI, purpose, optional choice, response-storage setting, exclusions, and limitations. Before production:

1. Have privacy counsel review the exact disclosure, subprocessors, retention statements, and international-transfer terms.
2. Confirm the server request continues to use `store: false` and sends only summarized health data plus the customer's prompt—not names, emails, account IDs, transaction descriptions, or receipt files.
3. Add a preference control that lets a customer withdraw AI use consent and clear stored acceptance state.
4. Re-display the notice if the data categories, provider, purpose, or retention behavior materially changes.

## 7. Security automation suitable for an AI agent

An agent can safely assist with read-only or approval-gated monitoring:

- dependency and secret scanning on each pull request;
- weekly checks for missing headers, unsafe redirects, public Storage buckets, and RLS-policy drift;
- backup-age, object-count, and restore-drill reminders;
- review of CSP violation trends with query values redacted;
- alerts for unusual download failures/rate limits and deletion jobs stuck in `partial`;
- periodic access review reports for administrators and service credentials.

Keep deployment, secret rotation, access grants, retention changes, backup deletion, and production restores behind explicit human approval. The agent should report evidence and propose a change; it should not autonomously weaken a security boundary.
