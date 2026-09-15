# Rules for AI assistants

This file is the single source of truth for every AI assistant working in
this repository, Codex and Claude alike. `CLAUDE.md` points here.

This is the Pravely marketing site. It is static, with no build step, and
deploys to the Netlify site `timely-palmier-9a6a82`, which serves
pravely.com.

The app itself lives in the separate private repo `itbb-creator/Pravely`.
Captcha, login, signup, and Supabase auth work belongs there, not here.

## Branches

- `main` is production. Never push to it. Never merge into it.
- `preview` is the integration branch. All work starts here.
- Branch from `preview`. Name it for who you are:
  - Codex: `codex/<short-description>`
  - Claude: `claude/<short-description>`
- Open pull requests into `preview`, never into `main`.
- Merge into `preview` only after the Netlify preview build is green.
- Only the owner merges `preview` into `main`.

Branches under `archive/` are frozen August work kept for reference. Never
commit to them, and never delete them.

If asked to "push this fix" with no branch named, use `preview`, and say
that is what you did.

## Working alongside the other assistant

Two assistants work this repo. Both are useful. Collisions are the risk.

1. **Before starting, look at what is already in flight.** Fetch `preview`
   fresh, and list the open pull requests. If an open pull request already
   touches the files you are about to change, say so and stop rather than
   opening a competing one.
2. **Stay in your own branch namespace.** Never commit to, rebase, or
   force-push a branch belonging to the other assistant. If their work
   needs changing, say so and let the owner decide.
3. **Merge promptly once green.** A pull request left open for days makes
   the other assistant build on stale code.
4. **Rebuild on `preview` rather than resolving a tangle.** If your branch
   conflicts with something already merged into `preview`, merge `preview`
   into your branch and fix it there. Never force-push to escape a
   conflict.
5. **Say what you changed and where.** Every pull request description names
   the files touched and the behavior changed.

## Never do these without the owner saying so in the current session

- Force-push, or rewrite history on any branch.
- Change Netlify production settings or production environment variables.
- Publish a production deploy.
- Touch the production Supabase project, Stripe live mode, or any real secret.
- Commit a secret.

## This repository is public

Anything committed here is world-readable, permanently, including after a
later commit deletes it. Do not add security audits, incident notes,
infrastructure details, or anything describing unfixed weaknesses. Those
belong in the private app repo. Two such documents were moved out on
September 15, 2026; do not bring them back.

The Turnstile site key in `content.json` and the Supabase publishable key
are public by design and are fine here.

## Captcha

`account.js` reads `captchaSiteKey` from `content.json`. An empty or
missing value disables the captcha silently, with no error, because
`setupCaptcha` returns early and `requireCaptcha` returns true. After any
captcha change, confirm in a browser that the widget actually renders.

Note that `netlify.toml` redirects `/account.html` to app.pravely.com, so
this page is not the signup form real users reach.
