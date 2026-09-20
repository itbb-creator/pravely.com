# AI opportunities for Pravely

> **Historical research snapshot.** Do not treat product, offer, tool-connection, or readiness statements in this report as current launch instructions.

Prepared September 7, 2026. Research and implementation recommendations; no automations were enabled, messages sent, or production data changed.

## What this report is based on

Pravely is evolving from a paid workbook business into a personal-finance app, with a free Essentials workbook as its entry point and one-time paid app plans. That is the clearest picture in the current homepage and checkout code. Older documents still describe paid workbook tiers and a $36 Premium founding offer. Treat those as historical or unconfirmed offers until you approve the current product catalog.

Evidence inspected: `index.html`, `content.json`, both checkout functions, `claim-essentials`, marketing documents, feedback and release instructions, AI coach instructions, and Supabase table metadata. Supabase's Pravely project connection worked. The metadata reported six license rows, one app-entitlement row, and no app-feedback or product-release rows. Those could include tests; they do not establish paying-customer counts or usage. I did not inspect customers' financial entries. The public website could not be retrieved through the research browser, so homepage findings refer to local source, not a verified live deployment.

You confirmed that the app is the main one-time-purchase product, the spreadsheet is now a marketing giveaway, and you are preparing launch and finding first customers. You use Google Workspace and Facebook, Instagram, and TikTok. You may add YouTube/content creation and eventually financial planning/coaching. No analytics system has been selected. Your inbox, calendar, advertising accounts, and actual daily work history were not connected for this report.

**Revised launch priority:** Begin with workflows 14 (customer discovery), 1 (offer consistency), 7/15 (content), 3 (journey testing), and the measurement setup below. Support, reconciliation, and automated follow-ups become worthwhile as real volume arrives. Workbook-release operations are a secondary legacy capability, not the main growth strategy.

The most promising strategy is to use AI to interpret exceptions, customer language, and changes between systems. Keep payment execution, access checks, consent decisions, and numerical calculations in deterministic code.

## Priorities and plausible savings

These are planning estimates, not measured results or vendor claims. Savings are manual handling time minus expected AI-review time. They exclude initial setup and ongoing maintenance. Do not add every row together: several share the same research, support, or reporting work.

| Priority | Workflow | Estimated net saving | Initial setup estimate |
|---|---|---|---|
| Start now | 1. Catch outdated product promises everywhere | 30–60 minutes per offer/release review | 1–3 hours |
| Start now | 2. Turn customer confusion into a fix and content brief | 45–90 minutes per 10 messages | 3–5 hours |
| Start now | 3. Rehearse the customer journey with synthetic customers | 1–3 hours per meaningful release | 4–8 hours |
| Next | 4. Trace payment, access, and delivery exceptions | 10–25 minutes per incident | 4–8 hours |
| Next | 5. Prepare support replies with verified account context | 5–10 minutes per routine ticket | 3–6 hours |
| Next | 6. Coordinate onboarding and optional check-ins | 1–2 hours per 20 eligible people | 4–8 hours |
| Next | 7. Turn a real product demonstration into a campaign | 1.5–3 hours per campaign batch | 2–4 hours |
| When data exists | 8. Produce a revenue-and-friction report | 45–90 minutes per weekly report | 6–12 hours |
| When releases resume | 9. Assemble the complete release communication packet | 45–120 minutes per release | 3–6 hours |
| When outreach exists | 10. Track promises, meetings, and overdue replies | 10–20 minutes per meeting; 20–40 minutes per chase session | 2–4 hours |
| Weekly/monthly | 11. Monitor competitors and external dependencies | 30–60 minutes per research sweep | 2–4 hours |
| When partnerships matter | 12. Find and prepare well-matched distribution partners | 1–2 hours per 10 prospects | 2–4 hours |
| When transactions justify it | 13. Prepare expense and payout reconciliation | 45–90 minutes per monthly batch of 30 items | 4–8 hours |
| Start now | 14. Run a first-customer learning loop | 1–2 hours per five interviews | 2–4 hours |
| Pilot if YouTube interests you | 15. Run a question-to-video-to-learning loop | 2–4 hours per long video plus short clips, excluding filming | 3–5 hours |

A modest example: one campaign batch, ten routine tickets, and one weekly report would save approximately 3.1–6.2 hours a week once working well. At your apparent early stage, a quieter week could save much less. If you are not doing a task today, count the result as added capacity, not time recovered.

## 1. Catch outdated product promises everywhere

**What it does:** Compare the homepage, checkout, old advertisements, onboarding copy, help pages, and email templates against an approved product fact sheet. Flag contradictions with exact locations and proposed corrections. This is particularly valuable during your workbook-to-app transition.

**Why this is specific to Pravely:** Current homepage source says Essentials is free with an account. `content.json` still lists a $19 Essentials product. Older marketing sells a $19 spreadsheet; another launch kit promotes $36 Premium; app checkout offers Plus and Complete. These may be intentional legacy paths, but copying old copy into new campaigns could confuse customers. The checker should distinguish product and effective date rather than flag every different price as an error.

**Tools / MCP:** Codex plus local project files; no new MCP required for the first test. GitHub MCP is optional for remote files and reviewable changes. Stripe MCP adds verification against active product/price records.

**Set up:**

1. Create `docs/approved-product-facts.md` with one row per offer: product ID, audience, price or free status, purchase model, availability, included features, excluded features, update promise, valid dates, and source of approval.
2. Mark disputed entries `unconfirmed`; do not let AI select the commercial policy. Add a separate field for legacy offers that must remain supported.
3. Run a project-wide comparison. Require output fields: file/page, exact claim, conflicting approved fact, severity, proposed replacement, and evidence.
4. Exclude generated files and historical archives from proposed edits, but include them as sources of accidental reuse. Check customer-facing assets first.
5. Run before each promotion or release; review the report, then approve individual changes. Never auto-change prices.

**What could go wrong / human review:** The model may confuse workbook Premium with app Complete, or assume an old feature is live. You approve the product catalog, price, feature availability, comparisons, and final copy.

**Easiest test:** Give it the current homepage, old hooks, and founding launch kit. Success means it identifies free-versus-paid Essentials and distinguishes the $36 workbook offer from app plans without inventing a replacement price. Expected review: 10–20 minutes rather than 40–80.

## 2. Turn customer confusion into a product fix and a marketing brief

**What it does:** Combine support messages, website feedback, and in-app feedback; group recurring problems; produce a source-backed issue plus an FAQ answer and demonstration brief. For example, several people unable to open the workbook could justify clearer setup instructions before more acquisition spending.

**Tools / MCP:** Business inbox MCP, Supabase for `app_feedback`, and GitHub for proposed issues. If website feedback still uses Netlify Forms, use its submission integration or notification emails. The current homepage does not establish that the older feedback forms remain active. Netlify documents supported form-notification routes in its [notification guide](https://docs.netlify.com/manage/forms/notifications/).

**Set up:**

1. Create a private review queue with `source_id`, source link, date, product/version, category, redacted message, severity, theme, review status, and proposed action.
2. Import ten messages manually through MCP first. Later trigger from a business-email label, active form submission, or new in-app feedback. Deduplicate by source system plus source ID.
3. Ask AI to classify each into access, workbook use, app bug, pricing, feature request, or other. Require a supporting excerpt and permit `unknown`.
4. Weekly, count distinct people per theme. Produce no more than three proposed fixes, each linked to original evidence. Keep sensitive financial content out of marketing outputs.
5. After your review, create or update one existing issue per theme and produce a draft FAQ/demo brief. Preserve the original feedback unchanged.

**What could go wrong / human review:** Repeated messages from one person can look like widespread demand; a low-volume theme can be overinterpreted. You confirm distinct customers, severity, the fix, and whether any wording is approved for public use.

**Easiest test:** Use ten redacted historical or synthetic messages, including duplicate follow-ups. Require zero lost urgent issues and no inflated customer count. The live feedback table currently has no rows, so do not pretend it already provides insight.

## 3. Rehearse the whole customer journey with synthetic customers

**What it does:** AI generates plausible edge cases and summarizes failures across signup, free claim, paid upgrade, download, consent, and account recovery. This catches awkward combinations that a normal happy-path test misses.

**Tools / MCP:** Codex, browser automation, test email accounts, Stripe test mode, and a development database. Supabase and Stripe MCP are useful for inspecting test outcomes. Use existing deterministic tests for calculations and access control.

**Set up:**

1. Build a scenario table: new verified account claiming Essentials; unverified account; returning free user; Plus buyer; Plus-to-Complete upgrade; interrupted checkout; expired link; unsubscribed customer; repeated webhook; wrong signed-in account.
2. Give each scenario an expected price, access result, message, and prohibited outcome. Use invented data and explicit test accounts.
3. Run the existing workbook-personalization checks, then browser journeys against a preview or development environment and Stripe test mode.
4. Capture screenshots, relevant test event IDs, and observed results. AI writes a failure report and likely next diagnostic step; it does not decide that an unverified result passed.
5. Require the exact scenario to pass after any fix. Manually inspect mobile rendering, workbook behavior in Excel/Sheets, and financial explanations before release.

**What could go wrong / human review:** AI might accept a convincing screen even though access is wrong, or generate incorrect expected financial values. Human-defined assertions and independent calculations remain the standard. Never test failure injection against real buyers.

**Easiest test:** Run just three journeys: free claim, paid test upgrade, and an opted-out account. Success requires correct access and zero optional emails to the opted-out account.

## 4. Trace payment, access, and delivery exceptions

**What it does:** Build an incident timeline across Stripe, licenses or app entitlements, workbook generation, and email status. AI explains where the chain broke and prepares the next action. Your existing purchase automation already does fulfillment; this adds exception handling.

**Tools / MCP:** Stripe MCP; existing Supabase; Resend MCP for available email-inspection tools. Recurring operation needs a scheduler and API/webhook integration, not just an MCP connection. Resend distinguishes email delivery and bounce events; delivery to a mail server does not prove a person read the email. [Resend event types](https://resend.com/docs/webhooks/event-types).

**Set up:**

1. Define two separate chains: workbook payment → license → file → email; app payment → entitlement. Free workbook claims have no payment and must not be flagged as missing revenue.
2. Read a small set of test transactions and join using stable checkout/payment IDs and user IDs. Do not match solely by customer name.
3. Implement deterministic checks for paid-but-unfulfilled after a chosen grace period, failed pipeline, and bounced fulfillment message. Start with a proposed 15-minute grace period and tune from observed delivery times.
4. Store one incident per transaction and failure type. Give AI only the necessary status timeline, with credentials and download tokens removed.
5. Have a scheduled job produce a review queue. Recovery, resend, refund, and entitlement changes remain separate approved actions. Recheck current status before any recovery.

**What could go wrong / human review:** Out-of-order or duplicate events can cause false incidents and duplicate sends. Stripe explicitly documents duplicate handling, so event IDs and retry-safe processing are essential. You review identity and the recovery action. [Stripe webhooks](https://docs.stripe.com/webhooks).

**Easiest test:** Replay one test event twice and simulate one failed email in development. Expect one incident, one license/entitlement, and no automatic refund or resend.

## 5. Prepare support replies with verified account context

**What it does:** Read a support request, retrieve the matching operational record and approved help instructions, and draft a concise reply. This removes copying between inbox, database, and help pages.

**Tools / MCP:** Business inbox plus a restricted operational lookup. Supabase can support the lookup; Stripe is optional for billing context. The lookup should return product, access status, last relevant error, and safe help links—not financial entries or raw account tokens.

**Set up:**

1. Create a business-email label or folder `Pravely Support Review` and a small approved help library for downloads, verification, supported spreadsheet apps, and known issues.
2. Trigger on newly labeled messages. Store message ID to prevent duplicate processing.
3. Match the sender to the operational record. If identity is unclear or the request asks to change account ownership, stop at an identity-verification draft.
4. Ask AI for category, evidence, missing information, and a draft grounded in the help library. Escalate billing disputes, deletion requests, security issues, and individualized financial questions.
5. Save a draft for your review. After you send it, update the ticket status from the actual sent message, not from draft creation.

**What could go wrong / human review:** Wrong-recipient matching can disclose access information. An email can contain malicious instructions aimed at the assistant. Treat message text as data; allow only the intended lookup and drafting actions. You review identity, links, tone, and commitments.

**Easiest test:** Five routine messages, one wrong-account request, and one message saying to ignore instructions. Require all sensitive cases to escalate. For Gmail, Zapier documents a draft action, so a pilot need not have send permission. [Gmail integration](https://help.zapier.com/hc/en-us/articles/8495933589645-How-to-get-started-with-Gmail-on-Zapier).

## 6. Coordinate onboarding and optional check-ins

**What it does:** Identify eligible people due for a check-in, prepare the right message, stop when they decline, summarize replies, and maintain testimonial permission evidence.

**Tools / MCP:** Supabase operational/consent records, business inbox, Resend if used, and a daily scheduler. No new CRM is necessary for the first cohort.

**Set up:**

1. Define separate audiences for transactional fulfillment, optional product updates/check-ins, and promotional marketing. Use explicit stored consent and current unsubscribe status.
2. Create a private queue with customer ID, stage, due date, consent evidence, draft, review status, sent ID, and reply status. Unique key: customer plus stage.
3. Generate day-7 and day-14 candidates only when eligible. The free-claim function currently sets both optional consent flags to false: free signup is not an eligible marketing audience by default.
4. Draft a short question appropriate to known behavior. Describe an issued download link accurately; it does not prove the workbook opened or was used.
5. Recheck consent immediately before an approved send. Stop after an opt-out, adverse reply, or applicable deletion; avoid repeated unanswered chasing. Save exact quote and attribution approval separately from permission to request a testimonial.

**What could go wrong / human review:** Stale queued consent, inferred usage, excessive reminders, or interpreting positive feedback as publication approval. You review audience selection and wording, and approve every published testimonial.

**Easiest test:** Six invented people: eligible, unsubscribed, no consent, already contacted, replied negatively, and positive feedback without publication approval. Only the eligible unsent check-in should advance. Follow the project's existing consent policy rather than inventing a new one.

## 7. Turn a real product demonstration into a campaign

**What it does:** Convert one approved recording or real screen into a coordinated set of assets: short-video script, carousel outline, caption, FAQ, email draft, and tracked landing-page link. Tie every piece to one actual customer objection.

**Tools / MCP:** Codex and your existing assets; Figma is available for design work. A social scheduler or design-app MCP is optional and only useful if you already use it. Manual publishing is sufficient for the pilot.

**Set up:**

1. Choose one real feature and one objection from workflow 2. Supply a screen recording with fabricated demonstration numbers and your current approved offer sheet.
2. Define a campaign ID, target audience, one action you want people to take, and the exact destination page.
3. Ask AI for three hooks and one coordinated asset set. Require a source for every feature claim. Prohibit invented testimonials, unverified competitor prices, and guarantees about financial results.
4. Generate campaign links with consistent source, medium, campaign, and content tags. Check that the destination works and that measurement captures the tags before relying on attribution.
5. Approve screenshots, copy, offer, and captions. Publish one controlled variation at a time; record what actually ran.

**What could go wrong / human review:** AI may illustrate nonexistent product behavior, recycle the obsolete $19 proposition, or use private customer data. You approve product fidelity, claims, brand voice, and any ad spend.

**Easiest test:** One 30-second real demo → one video script, three captions, and one FAQ. Compare preparation time and editing time with your usual process. Do not equate more generated content with more customers.

## 8. Produce a revenue-and-friction report

**What it does:** Explain which acquisition sources produce activated customers and where people get stuck. For a one-time-purchase business, include gross sales, refunds, fees, acquisition cost, and estimated support cost; monthly recurring revenue is not the natural headline metric.

**Tools / MCP:** Stripe, Supabase, analytics if installed, and read access to whichever ad platform you actually use. Google provides an official Analytics MCP server, but a working property and instrumented events are prerequisites. [Google Analytics MCP](https://developers.google.com/analytics/devguides/MCP).

**Set up:**

1. Write a metric dictionary separating accounts, free claims, paid workbook sales, app purchases, upgrades, refunds, and repeat activity. Define denominators and the reporting timezone.
2. Instrument a minimal funnel: account created, verification completed, free claim issued, checkout started, payment confirmed, entitlement granted. Do not capture budget amounts or debt details in marketing analytics.
3. Add a stable campaign ID to the permitted attribution path and store it through checkout. I did not find UTM fields in the reviewed checkout request/metadata, so attribution implementation is required before this report can answer campaign-level questions reliably.
4. Use deterministic queries to calculate weekly totals; AI receives the totals, definitions, missing-data notes, and prior period. Require observed changes to be separated from causal hypotheses.
5. Output one page: what changed, likely explanation, missing evidence, and one proposed test. You approve budget and product decisions.

**What could go wrong / human review:** Test purchases contaminate sales; free licenses inflate buyer counts; ads and Stripe use different windows; tiny samples create false winners. You validate definitions and reconcile a sample to Stripe. Keep business overhead separate from contribution margin.

**Easiest test:** Ten synthetic records including a free claim, upgrade, refund, and unknown campaign. The exact expected totals must match. Until instrumentation exists, begin with operational counts and mark acquisition attribution unavailable.

## 9. Assemble the complete release communication packet

**What it does:** Transform an approved change into changelog text, help updates, screenshots to refresh, a recipient preview, support notes, and an email draft. Catch every place that needs to change together.

**Tools / MCP:** Local files or GitHub; Supabase releases and consent records; Resend for available email operations. The project already has a release-email dry-run path, which should be reused after verification.

**Set up:**

1. Create a release record with product type, version, approved changes, eligibility, known limitations, and rollback owner.
2. Have AI compare the change against help pages, onboarding instructions, current screenshots, old promises, and prior release notes.
3. Produce draft changelog, email, and support FAQ. Use a separate workflow for app changes and workbook file distribution.
4. For a workbook release, validate the immutable master and release record, then run the existing recipient preview without its send option. Review eligibility, count, unsubscribe behavior, and content.
5. Test with your own account before approving publication and send. Log the released version and actual message IDs; a rerun must not resend the same notice accidentally.

**What could go wrong / human review:** Wrong tier receives a file; old customers lose access; notes describe unshipped features; retries duplicate mail. You approve the artifact, eligibility, recipient list, and release. Current release-table metadata shows no records, so this is not verified as an active process.

**Easiest test:** A fictitious development release with three sample recipients, one unsubscribed. Expect a complete draft packet and exactly two eligible test recipients, with no live distribution.

## 10. Track promises, meetings, and overdue replies

**What it does:** Extract who promised what from meetings and email threads, link it to the original evidence, update a task queue, and prepare overdue follow-ups. This helps with freelancers, testers, partners, and your own commitments.

**Tools / MCP:** Business inbox and calendar; existing task app if you have one. Meeting transcripts can come from your current meeting tool; an additional transcription product is unnecessary unless meetings are frequent.

**Set up:**

1. Create a `Pravely Follow Up` email label and a task list with person, commitment, due date, source link, last contact, status, and next action.
2. Read only labeled business threads and selected meeting notes. Ask AI to extract explicit commitments and mark inferred dates as uncertain.
3. Match existing tasks by source thread and commitment before creating a new one.
4. Each workday, check the latest thread before flagging an overdue item. Generate a follow-up draft only if no reply or completion supersedes it.
5. Approve the draft; update status after the actual send. For recordings, use your established participant-notice/consent practice.

**What could go wrong / human review:** AI may turn brainstorming into a promise, miss an offline reply, or send an awkward nudge. You verify assignee, deadline, tone, and whether contact is still appropriate.

**Easiest test:** One past meeting and three closed email threads. See whether it identifies the real outstanding task while suppressing already-resolved ones.

## 11. Monitor competitors and external dependencies

**What it does:** Watch selected competitor pricing/feature pages and vendor notices, then explain meaningful changes and which Pravely materials may need updating. This combines website checking with practical action.

**Tools / MCP:** Web research needs no new MCP. Inbox access helps with vendor notices. Browser/API monitoring can be added later for selected pages; do not assume every site permits or supports automated extraction.

**Set up:**

1. Pick five competitor pages and the specific vendor notices relevant to hosting, payments, email, and app dependencies.
2. Maintain a baseline with URL, capture date, currency, billing interval, included features, and the relevant excerpt. Mark inaccessible pages as unavailable.
3. On each weekly sweep, compare specific facts. Ignore navigation, timestamps, and cosmetic page changes.
4. Ask AI to return only material changes, supporting links, confidence, and affected Pravely copy or operational work.
5. Review before altering comparisons or making purchases. Reverify competitor pricing immediately before publishing a price-based ad.

**What could go wrong / human review:** Regional prices, limited promotions, bot-blocked pages, and silently changed page structure can mislead the comparison. You verify the original source and commercial significance.

**Easiest test:** Give the assistant two saved versions of one pricing page with a known change plus a page with only a changed date. It should report only the meaningful change. Savings depend on whether you currently perform this research.

## 12. Find and prepare well-matched distribution partners

**What it does:** Research potential newsletter partners, educators, creators, or financial-wellness communities; identify a concrete fit; prepare a tailored collaboration brief and track responses. The useful output is a relevant distribution idea, not bulk cold-email volume.

**Tools / MCP:** Web research, your business inbox, and a simple partner tracker. An existing CRM connection is optional. A paid prospecting app is premature until the channel demonstrates value.

**Set up:**

1. Define a partner rubric: audience fit, subject relevance, evidence of active publishing, public business contact route, and a plausible mutual benefit.
2. Research ten organizations or creators using public pages. Record source URL, date, fit evidence, suggested collaboration, and unresolved questions.
3. Reject generic matches. For retained candidates, propose one specific asset: a co-branded budgeting workshop worksheet, a practical tutorial, or an audience-specific demo.
4. Draft a short personal introduction tied to an actual published piece. Do not invent familiarity or audience statistics.
5. You choose recipients and approve terms and outreach; then use workflow 10 to track replies. Record actual outcomes rather than estimated exposure.

**What could go wrong / human review:** Stale contacts, invented personalization, reputational mismatch, or unattractive economics. You approve fit, compensation, promises, and every outbound message.

**Easiest test:** Research five prospects and manually verify every fact for the top two. Send nothing during the research test. Continue only if the proposals are more useful than a generic contact list.

## 13. Prepare expense and payout reconciliation

**What it does:** Extract business invoice details, match documents with transactions and Stripe payout reports, flag duplicates and missing receipts, and assemble a review packet. AI helps with messy document descriptions; arithmetic and matching rules calculate the totals.

**Tools / MCP:** Business inbox, Stripe, document storage, and the accounting system you actually use. Supabase contains business-related tables, but that alone does not establish they are Pravely's own books; they could be product features. Do not use customer financial tables for company accounting.

**Set up:**

1. Confirm the authoritative company ledger and create a receipt folder. Extract supplier, invoice number, invoice date, currency, subtotal, tax, total, due date, and source link.
2. Match by invoice/transaction IDs and corroborating date, amount, and supplier. Send ambiguous matches to review rather than forcing them.
3. Reconcile Stripe sales, refunds, fees, and payout timing separately. A payout deposit is not a second sale.
4. Have AI explain unmatched items, suspected duplicates, unusual vendor-price changes, and missing documents. Draft a missing-receipt request only when useful.
5. You or your bookkeeper approve categories and any ledger posting. No automatic payment, tax classification decision, or transaction deletion.

**What could go wrong / human review:** Incorrect document extraction, currencies mixed together, duplicates, and payout/sales double counting. Financial conclusions require human verification against original records.

**Easiest test:** Ten invented receipts and transactions, including a duplicate invoice, a refund, and a payout. Require exact totals and all deliberate exceptions to be found. This is a workflow proposal, not tax or accounting advice.

## 14. Run a first-customer learning loop

**What it does:** Connect public audience research, customer interviews, objections, landing-page changes, and outreach tracking. The goal is to discover why a real person would buy your app now, rather than ask AI to invent a persona and market to it.

**Tools / MCP:** Google Workspace—Gmail, Calendar, and Drive/Docs—plus a simple tracker. Public web research requires no additional MCP. Google Meet notes or a transcript are optional inputs; do not assume your Workspace edition includes automatic transcription.

**Set up:**

1. Select two audience hypotheses, such as people dissatisfied with manual budgeting and people seeking a clearer debt plan. Treat these as hypotheses, not established target markets.
2. Create a Drive folder for research. Track participant ID, audience hypothesis, source, interview date, exact problem, current workaround, buying objection, purchase outcome, and evidence link.
3. Have AI inspect public discussions for recurring problem language, then draft a neutral interview guide: last time the problem happened, what they did, what was difficult, and what they already pay for. Public complaints suggest questions; they do not prove demand.
4. You recruit five willing interviewees and conduct the conversations. AI organizes notes into observed behavior, direct quotes, interpretation, and unknowns. It drafts follow-ups for your review.
5. At the end of five interviews, request one messaging change, one onboarding fix, and one next experiment with supporting evidence. Compare stated interest with actual signup, trial use, or purchase; never substitute synthetic interviews for customer evidence.

**What could go wrong / human review:** Leading questions, polite enthusiasm mistaken for buying intent, and cherry-picked quotes. You review the interview guide, listen to customers, choose the interpretation, and approve outreach.

**Easiest test:** Two conversations and one comparison memo. Ask whether the memo identifies something specific you did not already know and can trace every finding to a source. Savings cover preparation, organization, and synthesis—not the conversation itself.

## 15. Run a question-to-video-to-learning loop

**What it does:** Turn one real audience question into a YouTube outline, demonstration plan, title options, chapters, and short-form adaptations for Instagram, TikTok, and Facebook. Then use viewer response to decide what to explain next.

**Tools / MCP:** Google Drive for recordings and transcripts, Codex for research and drafts, your current video editor, and YouTube Studio when a channel exists. Direct social/YouTube MCP access is optional for a manual pilot; publishing and reporting capabilities must be verified for the chosen connector. Do not buy a new editor solely for this test.

**Set up:**

1. Choose one question from workflow 14, such as how to build a plan when income varies. Specify the audience, educational objective, and one demonstrated app capability that is actually available.
2. Ask AI for a 5–8 minute outline, required screen shots, supporting sources, three title options, and a 20-second opening. Verify numerical examples independently with invented data.
3. Record the explanation and actual app demonstration. Feed the transcript back to AI for chapter suggestions and three short-clip ranges. AI must select statements that remain accurate outside the long video's context.
4. Draft distinct captions and calls to action for YouTube, TikTok, Instagram, and Facebook, all using a consistent campaign ID. You edit video, inspect captions, approve claims, and publish.
5. After sufficient views arrive, inspect comments and YouTube retention. Ask AI to propose one improvement to the opening and one next question to answer. Retention is evidence about viewing behavior, not proof of buyer demand. YouTube provides video-level retention reporting in Studio. [YouTube retention guide](https://support.google.com/youtube/answer/9314415?hl=en).

**What could go wrong / human review:** Generic scripts, unsupported financial claims, out-of-context clips, inaccurate subtitles, and optimizing views while attracting no buyers. You own editorial judgment and review every public artifact. Future coaching should get a separate workflow design; do not launch individualized advice automatically from a content process.

**Easiest test:** Make one video and three short adaptations. Time research, drafting, editing, and review separately. Judge clarity with three intended viewers and track qualified signups before buying video automation tools. The estimated savings overlap with workflow 7; do not count both for the same content.

## Analytics setup for your launch

The tools you likely mean are **Google Analytics 4 (GA4)** and **Microsoft Clarity**. Use GA4 for acquisition and conversion counts, Clarity for behavior on public marketing pages, and Stripe as the payment reference. Start with a few defined events rather than a large dashboard.

**GA4 setup:** Sign in with your business Google account → create an Analytics account/property → select the business timezone and currency → create a Web data stream for Pravely → install the supplied Google tag on the intended pages. Add and test a small event set: signup click, completed signup, free workbook claim, checkout started, and confirmed purchase. Use server-confirmed purchases and a transaction ID to avoid counting page reloads as sales. Check Realtime/DebugView with test traffic, then verify a known campaign link and transaction. Account/app events require implementation; installing the tag alone does not add the complete funnel. [Google setup instructions](https://support.google.com/analytics/answer/14183469?hl=en).

**Clarity setup:** Create a project for the public marketing site → Settings → Setup → obtain its tracking code → install on explicitly allowed public pages. Set Settings → Masking → Strict before the pilot. Keep the script off signed-in financial pages, account-recovery pages, and licensed-download pages; check that sensitive tokens are not captured in URLs. Integrate the appropriate tracking-consent behavior for your audience before deployment. Test with invented content and inspect the resulting session and requests. Microsoft documents installation and masking; masking changes affect future recordings, not past data. [Clarity setup](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup), [masking controls](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking).

**AI workflow:** Review a small sample of public-site sessions and GA4 counts weekly, then request a source-backed friction memo: observed issue, number of affected observations, alternate explanation, and proposed test. Initially record session links and observations manually; no Clarity MCP capability was verified here. Do not assume a connector can retrieve or interpret full recordings. Estimated saving: 30–60 minutes per review of ten sessions after you have captured observations. Setup estimate: 2–4 hours for basic tags and validation, plus any consent and application-event implementation.

**What could go wrong / human review:** Misconfigured tags, duplicate conversions, recorded sensitive content, and tiny samples interpreted as reliable conversion rates. You inspect collection behavior, verify counts, and review proposed changes. The easiest test is three synthetic journeys with predetermined event counts and no sensitive data in either tool.

## Shared implementation pattern

Start manually through MCP. When a workflow proves useful, automate it with one runner: either your existing backend with a scheduled job, or a service such as n8n. Do not buy both n8n and Zapier merely to run the same workflow. Zapier MCP is useful as an app-access bridge; a durable schedule/event workflow is a separate setup.

For an n8n implementation, use this sequence: Schedule Trigger or authenticated webhook → fetch new records → deduplicate → deterministic eligibility checks → redact sensitive fields → model classification/draft → validate required output fields → private review queue → approved action → action log. n8n documents scheduled workflows and human review before tool execution. [Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/), [human review](https://docs.n8n.io/advanced-ai/human-in-the-loop-tools/).

Create a private operations queue with: workflow, source ID, source link, proposed action, evidence, status, reviewer, created time, approved time, and executed action ID. Keep secrets outside it. In an exposed Supabase schema, enable RLS and define access explicitly; prefer a private reporting interface for production operational data. A broad read-only database connection still exposes sensitive rows, so it is not a substitute for limiting data access.

Set a maximum batch size, retry limit, and failure notification. Store progress so a restart does not duplicate drafts or sends. Recheck consent, recipient, and current status immediately before execution. Untrusted emails and webpages cannot change the workflow instructions or authorize new tools.

Measure ten examples manually, then ten with assistance. Track preparation minutes, review minutes, corrections, failed actions, and cost. Start with a proposed operating budget of $25/month for the pilot—not a quoted software price—and check whether selected plans fit it before purchasing. Allow 15–30 minutes a week for maintenance initially. Stop a pilot if review and repair consume the savings.

## MCP connections to make next

**Already verified:** Supabase access to the Pravely project. **Available tools, not tested against this project's remote account:** GitHub and Figma. **Not connected in this research session:** Stripe, Resend, your business inbox/calendar, advertising, and analytics. The plugin discovery/suggestion tools were not exposed, so I could not issue native connection cards; official MCP setup paths are provided below.

Connect **Google Workspace first: Gmail and Drive**, with Calendar when scheduling interviews. Stripe test/read access is the next operational connection. Add Resend only if delivery exceptions are the next pilot. Do not connect customer bank accounts for this operational research.

### Stripe

1. Follow the [official Stripe MCP setup](https://docs.stripe.com/mcp) for Codex. Its hosted endpoint is `https://mcp.stripe.com`.
2. In a local Codex terminal, add it with `codex mcp add stripe --url https://mcp.stripe.com`, then complete `codex mcp login stripe` in the browser if authentication is not started automatically.
3. Start with a sandbox/test account. For production, use a restricted read key or a restricted reporting route, and expose only the necessary read tools. OAuth connection alone does not imply read-only access.
4. Inspect one known test payment and one product. Verify which account and mode are connected before interpreting sales.

Codex supports tool allowlists in MCP configuration; use the actual tools returned by the server rather than assuming a fixed list. It also shares MCP configuration across local clients on the same host. [Official Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

### Business inbox and calendar

1. Use your confirmed Google Workspace business account. Create Gmail labels `Pravely Research`, `Pravely Support Review`, and `Pravely Follow Up`, plus a Drive folder `Pravely Business Research`.
2. If the Gmail and Google Drive plugins are available in your app, connect the business account there. Otherwise use the [Zapier MCP setup](https://docs.zapier.com/mcp/get-started/quickstart), select the client-specific path or its generic MCP-client path, and authenticate Gmail and Google Drive with that business account.
3. Connect only the needed business apps. Inspect actions that were enabled automatically; retain search/read and draft actions for the pilot, with sending excluded. Limit the agent's work to your chosen business label/folder; recognize that a label instruction may not restrict the underlying OAuth scope.
4. Test by asking it to find and summarize one known labeled message. Add calendar read access only if meeting follow-ups are a real need.
5. Then inspect up to 20–30 relevant business threads and selected research documents to replace this report's assumed frequencies with actual workload evidence. If you have fewer, use the available sample. Google Workspace administrators may need to permit the connection. Do not include unrelated personal mail.

### Resend, only when needed

1. Use `codex mcp add resend --url https://mcp.resend.com/mcp` and complete its browser OAuth flow.
2. Inspect the available tools and allow only the email-status reads needed for diagnosis. If those are insufficient, use its documented email/webhook API for the missing status data.
3. Verify one test email's status without sending anything. Keep live sending outside the diagnostic workflow. Resend publishes the endpoint and Codex connection command in its [official MCP guide](https://resend.com/docs/mcp-server).

### Supabase: use the existing connection carefully

No second connection is required to begin. For a separate development-only research connection, Supabase documents project scoping and `read_only=true`. These constrain writes but do not redact personal data. For recurring production reports, expose only the operational fields/aggregates needed by that report. [Supabase MCP documentation](https://supabase.com/docs/guides/ai-tools/mcp).

### Analytics and other apps

After GA4 is installed and producing useful events, connect its official MCP server using the setup linked in workflow 8. For Facebook, Instagram, and TikTok, begin with native reporting and manual publishing; verify the exact read/reporting tools before adding a social connector. No direct connection to those accounts was available here. YouTube can follow after you choose to launch a channel. There is no reason yet to buy a CRM, meeting recorder, prospect database, or social scheduler solely for this report.

## Recommended first two weeks

**Days 1–2:** Approve the app-first offer facts and what the free workbook leads to. Run the consistency review and three synthetic customer journeys using existing access. Connect Gmail and Drive for selected business context.

**Days 3–5:** Prepare and begin five customer conversations. Set up minimal acquisition measurement and Stripe test/read access. Build one app demonstration and adapt it for the social channels you already use.

**Week 2:** Finish the interview synthesis and test one messaging change. Repeat the content workflow once; optionally test a first YouTube video. Review real signup friction if sufficient visitors arrive. Measure preparation time, review time, corrections, qualified signups, and actual first purchases. Defer large support and bookkeeping automations until volume justifies them.

Choose the next automation from the measured bottleneck. The most valuable outcome for Pravely is a shorter loop from customer experience to a verified fix, clearer explanation, and better acquisition—not a larger collection of AI subscriptions.
