# Workbook reference inventory

Reviewed: 2026-09-15

The workbook is still a legitimate founding-offer giveaway and marketing asset. A workbook reference is therefore not automatically obsolete. The key distinction is whether the file presents Pravely as a web app with a companion original workbook, or as a paid/workbook-first business.

## Customer-facing references that remain intentional

- `index.html` — current founding-offer and free-original-workbook promise.
- `account.html` — account access and included-workbook preparation.
- `confirmation.html` and `supabase/templates/confirmation.html` — verification and included-workbook delivery.
- `download.html` — licensed workbook delivery page.
- `changelog.html` — historical product changes and the move from workbook-first to app-first.
- `terms.html` — license terms for downloadable workbooks.
- `privacy.html` — workbook delivery, license records, and optional update-email processing.
- `contact.html` — workbook support remains a valid support category.
- App `client/src/App.tsx` and `client/src/lib/plans.ts` — founding-offer download, onboarding, plan table, and one DTI explanation.

These references should remain only while the workbook is actually included in the approved founding offer. When the founding offer ends, the product truth table must be changed first and these files reviewed together.

## Active operational documents that still depend on workbook delivery

- `docs/LICENSED_DELIVERY_SETUP.md`
- `docs/MASTER_WORKBOOK_GUIDE.md`
- `docs/RELEASE_PROCESS.md`
- `docs/RESEND_AND_UPDATE_EMAIL_SETUP.md`
- `docs/SECURITY_CONFIGURATION_AND_BACKUP_RUNBOOK.md`
- `docs/FEEDBACK_FORMS_SETUP.md`
- `README.md`
- `EDITING_GUIDE.md`
- Root `package.json` description and workbook personalization/release scripts
- App `script/security-preview-e2e.ts`

These files are now labeled “companion workbook delivery,” “mixed-scope,” or “historical/companion workflow” so they are not mistaken for the web-app launch process.

## Historical or stale material that should not drive launch copy

- `marketing/founding-offer-social-launch-kit.md` — repeatedly markets Pravely as a workbook customers buy/control and uses workbook-first calls to action. Archive or rewrite before any campaign reuse.
- `onboarding.html` — a workbook-first standalone onboarding page. Keep only if it is deliberately the companion-workbook guide; otherwise redirect customers to in-app Getting started.
- `email-preferences.html` — labels the optional stream “Workbook updates and founding-customer check-ins.” Rename the stream if future emails cover the app generally.
- `docs/AI_BUSINESS_WORKFLOWS_REPORT.md` — historical research snapshot.
- `docs/LAUNCH_READINESS.md` — earlier launch assessment; superseded by the dated master plan where they conflict.
- `docs/PREVIEW_RELEASE_STATUS_2026-09-09.md` — dated preview evidence, not current release truth.
- `docs/PRODUCT_SECURITY_AUDIT_2026-09-08.md` — dated audit evidence, not current release truth.
- `docs/PRE_LAUNCH_MASTER_PLAN_2026-09-15.md` — intentionally mentions workbook tasks as remaining work; it is a plan, not customer copy.
- App `docs/ACCOUNTING_PREVIEW_REVIEW.md` — dated preview record.

The Markdown files above now carry prominent superseded/historical warnings. The standalone workbook onboarding page is explicitly labeled as a companion-workbook guide, and the optional email preference is worded as product and companion-workbook updates rather than a workbook-only program.

## Decision still reserved for the founder

After the founding offer, decide whether the original workbook remains a free content/marketing tool. Until then, customer wording should say “included in the founding offer,” not promise that every future free account will always include it.
