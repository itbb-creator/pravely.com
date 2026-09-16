# Pravely pre-launch master plan

Date: September 15, 2026  
Recommended launch shape: web-first, limited cohort, then native apps  
Purpose: one ordered list of the work still required to turn the current product into a dependable launch, followed by the business systems to add after the product is stable.

## Scope and assumptions

The owner already has these tracks in view, so this plan does not attempt to duplicate them:

- final legal terms and policy approval;
- final offer and pricing creation;
- static/fixed-IP and direct-database network configuration;
- general cross-platform testing;
- completion of the onboarding experience.

Those tracks still appear where another task cannot be completed without them. For example, the final offer determines feature gates, refunds, store metadata, and customer-support promises.

## Current conclusion

Pravely should not move into broad marketing or business-process automation yet. The right sequence is:

1. Freeze exactly what web v1 includes.
2. Remove, hide, or finish every incomplete or contradictory customer-facing feature.
3. Prove the core financial calculations, saving, access, payment, email, recovery, and deletion paths.
4. Put release, monitoring, backup, support, and rollback controls around the product.
5. Launch to a small controlled cohort.
6. Use real customer evidence to choose fixes and only then automate repeatable business work.

The source is stronger than an early prototype: focused entitlement, debt-payoff, workbook-personalization, database-security, and preview checks already exist. It is not yet a complete launch system because the product boundary and several operational controls remain unresolved.

## Decisions recorded September 15, 2026

- Launch the responsive web app first. PWA, iOS, Android, mobile push, store purchasing/restoration, signing, and physical-device certification are later-release work.
- The free product is a seven-day trial of Complete, not a permanent free app tier. App access ends completely when the trial expires.
- Expired customers retain a paywall-only path to delete financial data or delete the account; that path must not reopen Settings or any financial workspace route.
- The original Essentials workbook is included in the founding offer. Whether it remains a free marketing asset afterward is deliberately undecided.
- Web v1 includes smart planning alerts and the AI Health Coach. Annual financial review and biometric lock are later releases.
- Pravely business accounting is founder/admin-only and must never be marketed or exposed as a customer-plan feature.
- The founder is the sole product approver and current customer-support owner.
- The dated feature truth table in `docs/V1_FEATURE_TRUTH_TABLE_2026-09-15.md` is the launch-scope source of truth until the founder approves a replacement.

## Gate 0 — Freeze the actual v1 product

Nothing else should be called launch-ready until this gate is complete.

- [x] Choose and record the first public surface. Launch the responsive web app first; PWA, iOS, and Android are later releases.
- [x] Create the dated feature truth table with plan, platform, implementation, verification, owner, and customer-wording columns.
- [x] Define the seven-day Complete experience as a time-limited app trial; the original workbook is a separate founding-offer giveaway.
- [x] Block the entire financial workspace after expiry while retaining only plan purchase, sign-out, and separate deletion controls.
- [x] Fix web-v1 scope: include AI Health Coach and smart alerts; keep business accounting admin-only; defer annual review, mobile notifications, biometric lock, PWA, and native apps; remove the unfinished walkthrough and contribution controls.
- [x] Remove current-availability claims and customer controls for deferred/removed features; show native apps, biometrics, and annual review only in a clearly future roadmap section.
- [x] Define a concrete acceptance test and support response for every v1 feature group in the feature truth table.
- [ ] Designate one product catalog as the source of truth for names, plan prices, upgrade price, trial, entitlements, features, and effective date. Generate or validate the website, app, Stripe configuration, emails, help text, and store metadata against it.
- [x] Archive or clearly label historical workbook-first launch documents so they cannot be copied into current campaigns or operating procedures.
- [x] Assign the founder as the single owner who can approve v1 scope and reject late feature additions.

### Contradictions found during the audit

- The public website says dedicated iOS and Android apps are planned for the future, while the Complete plan inside the app promises desktop, iOS, and Android access.
- The Complete plan promises an annual financial review and personalized smart alerts, but no completed delivery operation for those promises was found.
- Getting started contains “Video walkthrough coming soon.”
- The personal-plan report labels the customer “Beta member.” Apple explicitly rejects beta versions from normal App Store distribution.
- The Settings page exposes disabled “Buy us a coffee” controls when payment links are absent.
- Business accounting is visible, but its own review states that payment posting is not atomic and that tax allocation, reconciliation, concurrency, idempotency, receipt-storage, and financial acceptance testing remain incomplete.
- AI Health Coach has a deterministic preview fallback; the last positive hosted check was blocked by exhausted OpenAI credit.
- Older operating documents still refer to a $36 Premium workbook offer and workbook-first launch even though the current website sells the app at $89 Plus / $159 Complete with a $70 upgrade.

The first seven customer-facing contradictions above were corrected locally for preview. Historical workbook-first documentation remains inventoried, not yet archived; see `docs/WORKBOOK_REFERENCE_INVENTORY_2026-09-15.md`.

## Gate 1 — Finish the basic product

### 1. Core calculation correctness

- [ ] Write a calculation specification for every customer-visible number: income, spending, safe-to-use amount, surplus, health score, debt totals, payoff date, interest saved, goal date, net worth, projections, tax reserve, and report totals.
- [ ] Give each formula a fixed example that can be independently calculated outside the app.
- [ ] Add automated tests for zero values, decimals, negative cash flow, overpayments, missing categories, very large values, dates at month/year boundaries, leap years, different time zones, and partially completed data.
- [ ] Verify rounding and currency formatting are consistent between screen, CSV, spreadsheet, and PDF output.
- [ ] Verify editing or deleting a source entry updates every dashboard, score, chart, forecast, and report that depends on it.
- [ ] Verify month rollover, back-dated entries, future entries, and the chosen reporting period do not move transactions into the wrong month.
- [ ] Define and test behavior for duplicated records and rapid double-submission.
- [ ] If Business accounting remains in v1, make invoice/payment/journal posting one atomic server operation; add tax, partial-payment, overpayment, void, reversal, concurrency, idempotency, and reconciliation acceptance tests. Otherwise hide it from non-admin customers.
- [ ] Have a qualified accountant review only the accounting feature's calculations and outputs before the product represents them as company books or tax preparation.

### 2. Saving, sync, and data durability

- [ ] Test every create, edit, and delete action against the production-shaped preview database, not only in-memory preview data.
- [ ] Prove that the visible “saved” state means the server accepted the latest version rather than only local storage.
- [ ] Define conflict behavior for two tabs and two devices editing the same month. Prevent silent last-write-wins data loss or clearly warn the customer.
- [ ] Test offline edits, reconnect, refresh during save, session expiry during save, quota/storage failure, and network interruption.
- [ ] Test first login on one device followed by login on a second device with the same complete data set.
- [ ] Test large realistic accounts for load time, chart rendering, exports, and save latency.
- [ ] Document the data-retention rule for expired trials and inactive accounts, and create an operational report for records approaching deletion if automatic deletion is ever introduced.
- [ ] Confirm every user-owned table and Storage path is included in data export, data deletion, and account deletion as applicable.
- [ ] Perform and record an isolated restore of database data plus Storage objects. A configured backup job without a successful restore is not a completed backup system.

### 3. Authentication and account lifecycle

- [ ] Enable leaked-password protection in production and rerun the rejection test.
- [ ] Complete custom SMTP setup and positive tests for signup confirmation, email change, password recovery, and any MFA recovery message.
- [ ] Disable email-provider click tracking for single-use authentication links and verify common email scanners do not consume the action before the customer clicks it.
- [ ] Confirm Site URL and redirect allowlists contain only intended production and preview origins; remove temporary wildcards.
- [ ] Test duplicate signup, unverified login, expired confirmation, resend confirmation, changed email, wrong-account callback, expired recovery, reused recovery link, and signed-in password change.
- [ ] Test session timeout without losing unsaved work and require recent authentication for account deletion and other sensitive actions.
- [ ] Enroll every administrator in TOTP, create a separate recovery administrator, and store recovery material outside the development machine.
- [ ] Verify customer MFA enrollment, challenge, disable, lost-device, and recovery behavior if customer MFA remains visible.
- [ ] Confirm deletion invalidates or revokes active sessions and that old access tokens cannot continue sensitive operations.
- [ ] Publish a prominent web deletion path in addition to in-app deletion before Google Play submission.

### 4. Plans, trial, payment, and entitlement correctness

- [ ] Test the feature truth table by account state: new trial, active trial, expired trial, Plus, Complete, administrator, deleted account, and refunded/revoked purchase.
- [ ] Confirm a customer cannot obtain a higher plan by editing browser data, request bodies, user metadata, redirect URLs, or checkout metadata.
- [ ] Confirm an upgrade charges only the approved amount and cannot be purchased by an ineligible account.
- [ ] Test abandoned checkout, canceled checkout, declined payment, delayed payment, duplicate webhook, out-of-order webhook, webhook retry, refund, dispute, and manual refund.
- [ ] Define the authoritative entitlement outcome for refunds, disputes, accidental duplicate purchases, account deletion, and a buyer using a different email/account.
- [ ] Add an operator-safe way to find a payment and entitlement by stable Stripe/session/user IDs, with an audit trail for any manual correction.
- [ ] Verify checkout success does not claim access before the signed webhook grants it.
- [ ] Verify price IDs and live/test secrets cannot be mixed between preview and production.
- [ ] Add a synthetic reconciliation check that compares successful payments, entitlements, refunds, and failed delivery/email states.
- [ ] If native apps are part of launch, implement Apple/Google in-app purchases or an approved alternative, server-side receipt verification, cross-platform entitlement mapping, purchase restoration, refund/revocation handling, and store sandbox tests. Do not simply open the web Stripe checkout from the native app for digital access.

### 5. AI feature decision

- [ ] Retain and positively test the funded AI Health Coach. Local validation, hosted entitlement denial, provider-outage handling, alert reservation, and kill-switch tests pass; one successful funded preview response remains.
- [ ] If retained, set a hard monthly spend cap, per-user/request limits, timeout, retry policy, and a user-friendly unavailable state.
- [ ] Test prompt-injection-like user input, extremely long input, malformed responses, provider refusal, rate limiting, network failure, and exhausted credit.
- [ ] Confirm responses never change deterministic calculations or execute financial actions.
- [ ] Log availability, latency, refusal, and cost without logging customer prompts or financial content.
- [ ] Define who reviews unsafe or clearly incorrect output reports and how quickly the feature can be disabled.

### 6. Reports, downloads, files, and emails

- [ ] Test every CSV, PDF, spreadsheet, receipt, and workbook download with representative and adversarial filenames/data.
- [ ] Open outputs in Excel, Google Sheets, desktop PDF readers, mobile browsers, and native share/download flows as applicable.
- [ ] Verify generated files contain the correct customer, period, plan, version, and totals and never include another user's data.
- [ ] Verify short-lived download capabilities expire, rotate, cannot be replayed, and remain absent from analytics/referrer logs.
- [ ] Positively test receipt upload, private retrieval, replacement, deletion, backup, and restore if receipts remain in v1.
- [ ] Restrict file type and size, reject disguised/unexpected files, and define safe handling for uploaded PDFs/images.
- [ ] Positively test transactional email with Gmail and Outlook: authentication, payment/access, failed delivery, support reply, unsubscribe/preferences, and workbook/release messages actually used by the app.
- [ ] Remove legacy email flows that are no longer part of the app launch or clearly separate them from active runbooks.

### 7. Customer-facing completeness and usability

- [ ] Remove “coming soon,” “Beta member,” disconnected controls, dead social links, sample testimonials, sample customer data, and obsolete pricing from every public asset.
- [ ] Replace `#` Instagram/TikTok destinations or remove those links until real profiles exist.
- [ ] Verify every button, link, form, empty state, error state, toast, dialog, back action, and destructive confirmation has a complete outcome.
- [ ] Verify the 404 page, offline page, expired-session state, maintenance/unavailable state, payment failure, email failure, and partial-save failure tell the customer what to do next.
- [ ] Make support reachable from every high-risk failure state without requiring the user to expose financial data.
- [ ] Perform keyboard-only, screen-reader, 200% zoom/reflow, contrast, focus order, dialog, chart alternative, form error, and touch-target checks. Existing calculator label repairs are not a complete accessibility audit.
- [ ] Verify no customer-visible claim implies financial, investment, tax, legal, fiduciary, or individualized professional advice.
- [ ] Verify all screenshots and demonstrations use fictional data and match the current product exactly.
- [ ] Test browser history/back behavior and deep links for signup, recovery, plan, checkout return, and specific app views.
- [ ] Verify PWA install, update, cache invalidation, offline fallback, and recovery from a bad service-worker cache.

### 8. Performance and compatibility quality bar

- [x] Rerun the production build in a clean environment. The full client/server production build passed on September 15 after the product-gate changes.
- [ ] Add a performance budget for first load, authenticated load, save response, chart interaction, and export generation on a mid-range phone and slower network.
- [ ] Test realistic large data sets for browser memory and long-session stability.
- [ ] Verify no private financial values appear in URLs, page titles, notification previews, analytics events, crash reports, console logs, or third-party requests.
- [ ] Verify current Chrome, Edge, Firefox, and Safari behavior before web launch; keep native-device certification as its own later gate if web-first is chosen.

## Gate 2 — Make releases safe and repeatable

### 9. Repository and environment control

- [ ] Document that the marketing site and application are separate repositories/checkouts with separate release histories. Assign ownership and prevent one from being updated without the corresponding claim check in the other.
- [ ] Establish production, preview/staging, and local environments with visibly different project references and only test credentials in preview.
- [ ] Remove hard-coded production endpoints from build logic where they make accidental production builds possible; fail the build when required environment values are missing or inconsistent.
- [ ] Inventory every secret and public key, its owner, environment, rotation procedure, last rotation, and dependent service. Store values only in the approved secret manager/password manager.
- [ ] Review repository history and built artifacts for accidentally committed secrets, not only the current files.
- [x] Pin both repositories to Node 22 or later.
- [ ] Resolve package provenance and remove unused server/auth/database packages from the client application if they are not part of the production architecture.

### 10. Continuous verification

- [ ] Add continuous checks for TypeScript, production build, focused unit tests, dependency audit, secret scanning, and static security checks on every change.
- [ ] Add migration checks for RLS on exposed tables, ownership policies, unsafe grants, public `SECURITY DEFINER` functions, non-security-invoker views, missing indexes, and migration drift.
- [ ] Add browser smoke tests for signup, verification callback, login, recovery, trial, save/sync, plan gates, checkout return, deletion, and key calculations.
- [ ] Add an offer-consistency check across website, in-app plans, Stripe catalog export, email templates, changelog, screenshots, and active campaign copy.
- [ ] Treat the current two focused app tests and workbook-personalization suite as a starting point, not sufficient release coverage.
- [ ] Make a failed build, failed migration check, failed security check, or failed critical journey block deployment.

### 11. Release and rollback process

- [ ] Define one release candidate commit for each repository and record the matching database migration set, function versions, environment configuration, and product catalog version.
- [ ] Require preview approval before merging or deploying production.
- [ ] Back up production before schema releases and prove the restoration path.
- [ ] Define migration rollback or forward-fix steps, including which migrations cannot be safely reversed.
- [ ] Define instant feature kill switches for AI, payments, new signups, emails, uploads, and risky product areas without requiring an emergency code edit.
- [ ] Write a deploy-day checklist with owner, timestamps, go/no-go criteria, smoke tests, rollback threshold, and communication path.
- [ ] Write release notes and internal support notes from what actually shipped.
- [ ] Keep a known-good previous web build and documented Netlify rollback procedure.

## Gate 3 — Make production observable and recoverable

### 12. Monitoring and alerting

- [ ] Choose an error-monitoring service or implement an equivalent privacy-safe pipeline for frontend errors, unhandled promise rejections, and Edge Function failures.
- [ ] Alert on authentication failure spikes, checkout creation failure, webhook failure/retry backlog, entitlement mismatch, email rejection/bounce, download failure, deletion partial failure, backup age, restore overdue, storage errors, and AI outage/spend.
- [ ] Add synthetic checks for the public site, app load, TLS certificate, security headers/CSP, Supabase reachability, signup/recovery request, and a safe canary data read/write.
- [ ] Define normal baselines and thresholds so alerts indicate action rather than ordinary noise.
- [ ] Route every alert to a named person and a written response step; test delivery outside business hours.
- [ ] Set usage/billing alerts and hard or practical caps for Supabase, Netlify, Resend, Stripe fraud exposure, OpenAI, backup storage, and any error/analytics provider.
- [ ] Review Supabase Security and Performance Advisors after representative traffic, not only on an empty preview branch.
- [ ] Confirm log retention is long enough for support and incident investigation but does not retain unnecessary financial content.

### 13. Backup, restore, and continuity

- [ ] Confirm production database backup retention and whether point-in-time recovery meets the chosen recovery-point objective.
- [ ] Confirm independent encrypted, versioned Storage backup covers irreplaceable workbook masters and customer receipt files. Generated licensed workbooks may be regenerated only if masters and entitlement/license records are recoverable.
- [ ] Verify daily backup manifests, hashes, object counts, age, encryption, and failure alerts.
- [ ] Perform a quarterly isolated restore drill and record elapsed time, missing data, responsible person, and corrective actions.
- [ ] Store recovery credentials separately from writer credentials and keep an offline emergency record.
- [ ] Define acceptable recovery time and customer communication for database, storage, authentication, email, and payment-provider outages.

### 14. Security completion

- [ ] Enforce and monitor the current CSP after verifying every production flow; retain privacy-safe CSP reporting.
- [ ] Verify the real Turnstile key and exact hostname allowlist in production, then test invalid-token and provider-outage behavior.
- [ ] Review production members, roles, service accounts, GitHub access, Netlify access, Stripe access, email-provider access, and backup-provider access; remove stale accounts and require MFA.
- [ ] Run anonymous/cross-user authorization tests against the production-shaped environment for every customer table, view, Storage bucket, and Edge Function.
- [ ] Verify new public-schema tables are deliberately exposed to the Data API when needed. Supabase is changing default table exposure, so a migration that creates a table is not proof that the app can access it.
- [ ] Rate-limit or otherwise protect high-cost and abuse-prone actions: signup, recovery, support, AI, checkout, downloads, upload, and email resend.
- [ ] Create a vulnerability-reporting contact and a private security incident register.
- [ ] Schedule dependency, access, policy, and vendor reviews rather than treating launch audit results as permanent.

### 15. Incident response

- [ ] Write short playbooks for account takeover, cross-user data exposure, leaked secret, bad release, incorrect financial calculation, duplicate/incorrect charge, entitlement failure, missing customer data, email compromise, AI unsafe output, and provider outage.
- [ ] Define severity, decision maker, response time, containment step, evidence preservation, customer notification owner, and recovery verification for each incident.
- [ ] Create a customer-visible status/incident communication channel or at minimum a prepared status page and templates.
- [ ] Run one tabletop exercise before launch and fix gaps found.

## Gate 4 — Prepare the customer and commercial operation

### 16. Support operation

- [ ] Verify `support@pravely.com` receives website support requests and direct replies from every transactional sender.
- [ ] Choose one support queue and define categories: login, verification/recovery, calculation, data/save, payment/refund, entitlement, email, download, privacy/deletion, AI, accessibility, and outage.
- [ ] Set a realistic response target and coverage schedule for launch week.
- [ ] Prepare verified support playbooks for identity checks, resend/recovery, refund, entitlement repair, deletion status, and known issues. Never ask for passwords, full financial exports, or secret links.
- [ ] Add a way to capture app version, browser/platform, anonymous diagnostic ID, timestamp, and error code without collecting account numbers or customer financial content.
- [ ] Test support escalation from contact form to final resolution and record the audit trail.
- [ ] Prepare a known-issues page and decide when an issue blocks new sales.

### 17. Customer communications and email reputation

- [ ] Separate authentication, transactional/product, and marketing sending streams and consent rules.
- [ ] Verify SPF and DKIM, introduce DMARC monitoring, monitor bounce/complaint rates, and suppress hard bounces and unsubscribed recipients.
- [ ] Prepare and test the messages actually required for v1: confirmation, recovery, purchase/access, receipt, failed delivery, trial timing if promised, material incident, refund, deletion completion/partial failure, and support acknowledgement.
- [ ] Ensure one-click unsubscribe/preferences work for non-essential email without disabling account or security messages.
- [ ] Remove historical founding-workbook sequences unless they are part of the approved current offer.
- [ ] Create a human approval rule for mass sends and verify audience counts before sending.

### 18. Measurement that must exist before traffic

- [ ] Define a metric dictionary before launch: visit, signup started, account verified, activated, first value, trial active, checkout started, paid Plus, paid Complete, upgrade, refund, retained use, support incident, and deletion.
- [ ] Define the activation event using actual customer value, not just account creation—for example, completing a budget and seeing a first useful insight.
- [ ] Add privacy-minimized events for the funnel and core feature success/failure. Do not send financial amounts, categories, prompts, receipt paths, emails, names, or download tokens to analytics.
- [ ] Carry a stable campaign/source identifier into checkout and payment metadata if campaign attribution is needed. Current reviewed code did not establish UTM persistence.
- [ ] Separate test, owner/admin, free workbook, paid app, upgrade, and refunded activity from reporting.
- [ ] Build a small launch dashboard for activation, checkout conversion, refund rate, failure rate, support volume, and repeated usage. Avoid vanity metrics and monthly recurring revenue for a one-time-purchase model.
- [ ] Verify a synthetic dataset gives exact expected funnel and revenue totals before trusting the dashboard.

### 19. Controlled launch

- [ ] Recruit a small cohort with the exact supported browser/device profile and no promises beyond v1.
- [ ] Decide cohort size, entry method, sales cap, start/end conditions, and who can pause acquisition.
- [ ] Complete internal dogfooding with fresh accounts that have never seen the product.
- [ ] Conduct 5–10 observed usability sessions focused on activation and the first useful financial insight.
- [ ] Launch in waves, such as 5 customers, then 10, then 25, with a review checkpoint between waves.
- [ ] At each checkpoint review: activation, calculation/data defects, payment/access failures, support volume, email deliverability, refund requests, repeated confusion, and infrastructure alerts.
- [ ] Define launch-stop conditions: suspected data leak, incorrect customer financial output, lost data, duplicate/incorrect charge, inaccessible purchased plan, unrecoverable deletion failure, or severe outage.
- [ ] Ask for product feedback separately from testimonial publication consent. Store exact quote/attribution approval before publishing anything.
- [ ] Do not scale paid acquisition until the first cohort can activate without founder rescue and critical incidents remain at zero.

## Native app gate — only if native launch is in scope

This is additional to general cross-platform testing.

- [ ] Complete Apple Developer and Google Play organization verification, agreements, tax, banking, seller/contact information, and app records for `com.pravely.app`.
- [ ] Make the native purchasing model comply with current store rules for digital features; configure non-consumable products, receipt verification, entitlement mapping, restoration, refunds, transfers, and review visibility.
- [ ] Add real APNs/Firebase credentials and a trusted notification sender, or remove/disable notification promises and controls.
- [ ] Verify signing, provisioning, capabilities, associated links/deep links, privacy manifests/data-safety disclosures, age rating, export compliance, and store review notes.
- [ ] Provide App Review a working demo account or approved full demo mode and keep the backend live during review.
- [ ] Provide an in-app and public-web account deletion route, support URL, privacy URL, accurate screenshots, descriptions, and purchase disclosures.
- [ ] Remove all placeholder, beta, or unavailable content from the submitted build.
- [ ] Run internal Google testing and TestFlight before production submission; resolve review feedback before announcing availability.

## Gate 5 — Business foundations after the product is basically complete

These should begin only after Gates 0 and 1 are substantially complete, except for the minimal accounting and support controls required to accept money.

### 20. Minimal finance operation before the first sale

- [ ] Choose the legal business bank/payment accounts and keep business and personal funds separate.
- [ ] Choose an accountant/bookkeeper and the accounting system of record. Do not use customer-facing Supabase accounting tables as Pravely's company books without an explicit, independently validated decision.
- [ ] Define a chart of accounts for sales by product, discounts, refunds, disputes, Stripe fees, app-store fees, advertising, software, contractors, taxes, and owner transactions.
- [ ] Define who is merchant of record for web and store sales and how each payout is reconciled.
- [ ] Establish a sales-tax/VAT/GST determination, registration, collection, evidence, and filing process with a qualified professional before selling into covered jurisdictions.
- [ ] Reconcile one complete synthetic/test payout from gross sale through fees, refund, bank deposit, entitlement, and books before volume arrives.
- [ ] Set a cash reserve for refunds, disputes, taxes, provider bills, and support incidents.
- [ ] Create a monthly close checklist and document retention schedule.

### 21. Business systems to establish next

- [ ] Vendor register: service, purpose, owner, data handled, region, cost, renewal, contract/DPA, subprocessors, security contact, exit/export process, and deletion process.
- [ ] Password manager and access policy: named accounts, MFA, least privilege, recovery, onboarding/offboarding, and quarterly review.
- [ ] Work intake: one backlog with severity, customer impact, evidence, owner, target release, and status.
- [ ] Decision log: product/price/policy decisions with effective dates so old material is not reused accidentally.
- [ ] Customer record: stable customer ID linking support, payment, entitlement, consent, and product version without copying financial workspace data.
- [ ] Release calendar: freeze window, owner, preview, deployment, monitoring, and retrospective.
- [ ] Business continuity: emergency contacts, credentials, domain renewal, billing continuity, and who can operate the business if the founder is unavailable.

## Gate 6 — Automate only proven repeatable processes

Automation should interpret exceptions and prepare work for review. Payment execution, entitlement decisions, consent, deletion, and financial calculations should remain deterministic and auditable.

### First automations

1. Offer-consistency check across the website, app, Stripe export, emails, and active campaign material.
2. Continuous build, security, migration, and critical-journey checks.
3. Payment/entitlement/email reconciliation that creates a review queue for mismatches.
4. Backup verification, synthetic availability checks, and actionable alert routing.
5. Support intake classification and draft replies with identity and account actions left for human approval.
6. Release packet generation: changelog, affected help text, screenshots to refresh, support notes, and customer-email draft.
7. Privacy-safe launch funnel and reliability reporting.

### Automations after real volume establishes a pattern

1. Optional onboarding/check-in reminders with a consent recheck immediately before sending.
2. Customer-feedback clustering that preserves distinct-customer counts and urgent outliers.
3. Expense document preparation and Stripe/app-store payout reconciliation for accountant review.
4. Content repurposing from approved real product demonstrations and verified claims.
5. Renewal/cost monitoring for vendors and domain/service accounts.
6. Competitor or channel monitoring only when it answers a defined business decision.

### Do not automate without explicit approval

- refunds, charges, payouts, or price changes;
- plan/entitlement grants or revocations;
- production deletion or credential rotation;
- testimonial publication or interpretation of consent;
- financial, tax, or legal conclusions;
- mass customer messages;
- changes to production security policies or backup retention.

## Recommended execution order

### Week 1 — Product truth and removal pass

- Complete Gate 0.
- Hide Business accounting unless it is deliberately accepted as a launch feature.
- Remove or finish the walkthrough, beta label, coffee controls, mobile promises, annual-review promise, smart-alert promise, and unsupported social links.
- Produce the calculation specification and feature truth table.
- Convert the first critical journeys into automated tests.

### Week 2 — Correctness and lifecycle

- Complete calculation, save/sync, auth lifecycle, trial, plan-gating, checkout/webhook, refund/revocation, download, email, and deletion verification in preview.
- Positively test or remove the AI feature.
- Rerun the clean production build and dependency/security checks.

### Week 3 — Production controls

- Add continuous checks, monitoring, alerts, restore proof, release/rollback steps, incident playbooks, and launch support coverage.
- Finish the metric dictionary and privacy-safe instrumentation.
- Reconcile product wording and active operating documents.

### Week 4 — Limited cohort

- Run fresh-account dogfooding and observed activation sessions.
- Launch in small waves with written stop conditions.
- Fix repeated and severe problems before adding traffic.
- Start only the first low-risk automations after the manual process is understood.

## Go/no-go definition

Pravely is ready for a limited web launch only when:

- the v1 feature/plan/platform truth table has no unknown or contradictory row;
- every shipped control works and no placeholder or unsupported promise remains;
- independently checked financial examples match the app and all exports;
- fresh-account activation, saving, recovery, checkout, entitlement, email, refund, export/download, and deletion journeys pass in a production-shaped environment;
- cross-user access tests pass and no secret or financial content leaks to URLs, logs, analytics, or third parties;
- a production release can be rolled back and data plus Storage can be restored;
- alerts reach an accountable human and support can resolve the expected launch cases;
- the website, app, payment catalog, emails, and launch material describe the same product;
- launch metrics and stop conditions are recorded before traffic begins;
- the known legal, offer, network, onboarding, and cross-platform tracks are completed or explicitly removed from the chosen web-first scope.

Broad launch should wait until the limited cohort activates without manual rescue, no critical calculation/data/payment/access issue remains, and the operation has completed at least one calm release cycle after launch.
