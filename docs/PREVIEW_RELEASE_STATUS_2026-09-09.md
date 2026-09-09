# Pravely preview release status

Date: September 9, 2026  
Production and Netlify status: **untouched**  
Supabase test target: isolated branch `security-preview` (`eiaxrrkanqnrvvloszss`)

## Completed in local/Supabase preview

| Chat item | Preview result |
| --- | --- |
| Locate the app source | Complete. The app source is in `tmp/pravely-app-source`; the repository is on local branch `codex/security-preview`. |
| Connect and apply migrations | Complete in preview. All 24 ordered migrations are applied with no drift. |
| Verify tables, permissions, columns, constraints, and RLS | Complete. All 24 public tables have RLS, every constraint is valid, service-only tables have no browser policies, customer tables enforce ownership, and all three Storage buckets are private. |
| Database performance findings | Complete for the actionable item. Covering indexes removed every unindexed-foreign-key finding. Fresh-branch `unused_index` notices are informational and need real traffic before removal decisions. |
| CAPTCHA for signup, login, and forgot password | Complete in code and preview. Missing CAPTCHA is rejected. Preview uses Cloudflare's official test keys; production still needs a real widget. Squarespace domain registration does not prevent using Cloudflare Turnstile. |
| Create-account routing | Complete. Signup links and the legacy account route lead to the signup state on the app origin. |
| Split sessions across subdomains | Remediated by consolidating the legacy account route onto `app.pravely.com`; raw session tokens are not passed in URLs. |
| Signup/recovery URLs expose email | Complete. The email is kept temporarily in session storage, displayed in masked form, removed after use, and stripped from old query-string links. |
| First-login popup | Complete. `welcome_completed_at` is persisted in `user_settings`, the write is verified, local failure has an in-session fallback, and a second client sees the completed state. |
| Debt payoff opens wrong calculator | Complete. Debt cards pass the selected debt ID and open the Debt payoff calculator. Goal recommendations open their selected calculator. |
| Debt payoff values stale/wrong | Complete. Saved debt name, balance, rate, required payment, and extra payment hydrate together and refresh while **Use saved debt values** is selected; **Custom scenario** is separate. |
| Calculator accessible names | Complete in the repaired calculator input component: stable IDs and associated labels are used. |
| Mobile calculator navigation | Complete in source: controls use a wrapped grid on narrow screens instead of a clipped horizontal strip. |
| Workbook bearer links | Complete in preview. Capabilities are 256-bit random values stored only as SHA-256 hashes, rotate on use, and mint 10-minute signed URLs. |
| Delete financial data and receipt files | Complete in preview. Synthetic tests proved personal and business rows, receipts, and free generated workbooks are removed; partial work is recorded for retry. |
| Protect administrator accounting/account | Complete in preview. Admin self-deletion is blocked and audited. Accounting tables and email preview require TOTP-backed AAL2. |
| Admin email-preview URL secret | Complete. A durable query-string secret is no longer accepted; authenticated admin JWT plus AAL2 is required. |
| Baseline browser security headers | Complete in source. HSTS, nosniff, frame protection, referrer policy, and a minimal permissions policy are present. CSP remains intentionally Report-Only for observation. |
| AI privacy disclosure | Complete in source. The privacy page and first-use notice describe the OpenAI transfer, excluded fields, optional use, and `store: false`; the server request still uses `store: false`. |
| Dependency security | Complete. The Capacitor dependency chain is current and `npm audit` reports zero vulnerabilities. |
| Oversized startup bundle | Complete. PDF generation is lazy-loaded and the build is split into bounded framework, Supabase, chart, and PDF chunks with no size warning. |
| Third-party integrations with missing secrets | Complete for negative paths. Stripe checkout returns unavailable, unsigned Stripe webhooks are rejected, and AI coaching returns unavailable rather than operating partially. |

## Verification completed

- TypeScript check passed.
- Production-mode local build passed with no Vite warnings.
- Six local welcome/storage resilience tests passed.
- The disposable live security suite passed twelve groups: CAPTCHA rejection, server password length, recovery privacy, fail-closed integrations, cross-user RLS, welcome persistence, customer TOTP, financial/Storage deletion, full-account deletion, administrator AAL2, administrator deletion protection, and rotating workbook downloads.
- `npm audit --audit-level=moderate` reports zero vulnerabilities.
- Capacitor reports current `8.5.1` packages and a healthy Android configuration.
- Supabase Security Advisor has no warning/error finding. Its five informational no-policy entries are the intentionally service-only tables.
- Supabase Performance Advisor has no unindexed-foreign-key finding. The remaining connection-allocation and unused-index entries are informational.

## Physical actions required from the owner

Do these in this order and keep all real secrets out of chat, source files, screenshots, and URLs.

### 1. Turn on leaked-password protection in preview

1. Open the Supabase Dashboard and select **Pravely**.
2. Select the **security-preview** branch, not the main/production branch.
3. Open **Authentication → Sign In / Providers → Email**.
4. Turn on **Leaked password protection** and save.
5. Leave the minimum length at **12** and email confirmation enabled.
6. Tell Codex only that the toggle is saved; do not send a password or key. Codex can rerun the harmless known-leaked-password rejection test.

This feature is available because the organization is on Pro. Supabase documents the setting and plan requirement in [Password security](https://supabase.com/docs/guides/auth/password-security).

### 2. Connect custom Auth email delivery and a controlled test inbox

The cleanest existing fit is Resend because the code already supports it.

1. In Resend, verify a dedicated authentication sending domain, preferably `auth.pravely.com`.
2. In Squarespace DNS, add the exact SPF/DKIM records Resend gives you. DNS can stay at Squarespace; the registrar does not need to move.
3. Wait until Resend marks the domain verified.
4. In the **security-preview** branch, open **Authentication → Email → SMTP Settings**.
5. Set sender name to `Pravely`, sender address to an address on the verified auth domain, host `smtp.resend.com`, port `465`, username `resend`, and password to a preview-only Resend API key.
6. Save, then give Codex a real test inbox address you control. Do not paste the API key.
7. Codex should then test signup confirmation, confirmation callback, sign-in, forgot-password delivery, recovery callback, and password replacement.

Current provider details are documented by [Resend](https://resend.com/docs/send-with-supabase-smtp) and [Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

### 3. Add preview-only service credentials for positive-path tests

In Supabase preview Edge Function secrets, add test/sandbox values only:

- Stripe test secret, test price IDs for every offered plan/product, and a preview webhook signing secret.
- A restricted OpenAI project key with a low spend cap for Health Coach testing.
- A Resend preview key/sender if the non-Auth email functions are to be tested.

Then create a Stripe test webhook endpoint for the preview branch function URL and subscribe only to the event types the source handles. Do not use live-mode Stripe credentials. Once present, Codex can test successful checkout, webhook replay/idempotency, entitlement changes, Health Coach output filtering, and application email delivery.

### 4. Create the real Cloudflare Turnstile widget

1. In Cloudflare, create a **Managed** Turnstile widget named `Pravely authentication`.
2. Add the exact app and approved preview hostnames, including `app.pravely.com` and the final Netlify preview hostname if one is used.
3. Put the public site key in the app/marketing build settings.
4. Put the secret only in Supabase Auth CAPTCHA settings or the protected release environment variable used during configuration.
5. Never copy the official test secret into production.

Turnstile works even when Squarespace remains the domain registrar/DNS host; only the widget hostname allowlist and site integration matter.

### 5. Prepare administrator MFA before production

1. Sign in as every real administrator and enroll TOTP under Security settings.
2. Store recovery information in the approved password manager.
3. Create and test a separate recovery administrator so one lost device cannot lock out accounting operations.
4. Confirm each administrator reaches AAL2 before the AAL2 migration is applied to production.
5. Enable MFA on the Supabase owner account and require it for organization members where the plan permits.

### 6. Decide the direct-database network allowlist

Provide Codex the stable outbound CIDR for the office/VPN/CI systems that genuinely need direct Postgres access. A home IP that changes is not a safe long-term allowlist. If there is no stable egress address yet, set up a managed VPN/fixed-egress route first. Browser and Edge Function traffic uses the API and should not be added as arbitrary public database CIDRs.

### 7. Configure backup and recovery

1. In production Supabase, confirm daily database backup retention and whether PITR is enabled; choose PITR if the recovery-point objective requires it.
2. Choose an independent account/provider for irreplaceable `business-receipts` and workbook masters. Enable versioning, encryption, and immutability/Object Lock where available.
3. Create a write-only backup identity and a separate offline restore identity.
4. Approve a daily object-copy job plus manifest/hash and object-count checks.
5. Run a quarterly restore into an isolated destination and record the result.

Supabase database backups do not restore Storage object contents; see [Database backups](https://supabase.com/docs/guides/platform/backups).

### 8. Finish security-owner reviews

In Supabase, review project/organization members, remove unused access, confirm log retention, change Auth database connection allocation from an absolute `10` to a percentage if the dashboard exposes that control, and document who may access production service-role secrets. Do not remove the new indexes because a fresh preview database calls them unused; review production statistics after representative traffic.

### 9. Finish CSP and legal review

Exercise CAPTCHA, fonts, Supabase, Stripe, downloads, Health Coach, and every app page while CSP is Report-Only. Collect redacted violation reports for a clean observation period, fix legitimate violations, then approve enforcement. Have privacy counsel review the AI disclosure and receipt/financial-record retention language before release.

### 10. Complete native iOS verification

On a Mac with Xcode, run the native sync/build, inspect signing and entitlements, and test the authentication/deep-link/recovery flows on a real iPhone. Android configuration passed; Windows cannot perform the Xcode check.

### 11. Approve the single production release

Only after steps 1–10 are resolved or formally accepted:

1. Review the local diffs and preview evidence.
2. Back up production and schedule a release window.
3. Enroll administrators in MFA before applying the AAL2 migration.
4. Apply the ordered migration folder, Auth settings, Edge Functions, and protected secrets.
5. Run synthetic post-deploy checks.
6. Push/deploy through Netlify once, then monitor Auth, webhook, deletion, download, and CSP signals.

## Items still incomplete

### Credential and catalog checkpoint — 2026-09-09

- The `security-preview` branch now contains only the three intended app Price IDs: Plus ($89), Complete ($159), and Plus-to-Complete upgrade ($70). The secrets use `_PREVIEW` suffixes, and `create-app-checkout` now supports those preview-only names while preserving the production names.
- The corrected `create-app-checkout` function was deployed only to the `security-preview` Supabase branch. Netlify and production were not deployed.
- The Cloudflare Turnstile public site key was added to the local preview app environment and source configuration. The matching private Turnstile secret still must be confirmed in the preview Auth CAPTCHA settings.
- Stripe, OpenAI, and purchase-email positive-path tests remain pending because the five-hour usage window reached the agreed stopping threshold. The purchase-email path is a legacy workbook flow and is not exercised by the three app-price checkout flow.

The following are the complete remaining items from this chat—not hidden omissions:

1. Leaked-password protection toggle and its follow-up rejection test.
2. Positive signup-confirmation and password-recovery email tests using custom SMTP and a controlled inbox.
3. Positive Stripe checkout/webhook/entitlement, OpenAI Health Coach, and Resend application-email tests using preview-only credentials.
4. Real production Turnstile widget/keys and hostname allowlist.
5. Independent Storage-object backup, monitoring, and restore drill; production database backup/PITR confirmation.
6. Production direct-database network restrictions after a trusted CIDR is supplied.
7. Supabase owner/org MFA, team-access, log-retention, and Auth connection-allocation review.
8. CSP observation and final enforcement.
9. Privacy/legal approval for AI processing and record retention.
10. Native iOS/Xcode/device verification.
11. Production migration/configuration/secret rollout and the one final Netlify deployment. This was deliberately not attempted.
