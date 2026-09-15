# Working rules

This is the Pravely marketing site. It is static, with no build step, and
deploys to the Netlify site `timely-palmier-9a6a82`, which serves
pravely.com.

The app itself lives in the separate private repo `itbb-creator/Pravely`.
Captcha, login, signup, and Supabase auth work belongs there, not here.

## Branches

- `main` is production. Never push to it. Never merge into it.
- `preview` is the integration branch. All work starts here.
- Branch from `preview`, name it `claude/<short-description>`.
- Open pull requests into `preview`, never into `main`.
- Merge into `preview` only after the Netlify preview build is green.
- Only the owner merges `preview` into `main`.

If asked to "push this fix" with no branch named, use `preview`, and say
that is what you did.

## Never do these without the owner saying so in the current session

- Force-push, or rewrite history on any branch.
- Change Netlify production settings or production environment variables.
- Publish a production deploy.
- Touch the production Supabase project, Stripe live mode, or any real secret.
- Commit a secret.

## This repository is public

Anything committed here is world-readable, permanently, including after a
later commit deletes it. Do not add security audits, incident notes,
infrastructure details, or anything describing unfixed weaknesses.

The Turnstile site key in `content.json` and the Supabase publishable key
are public by design and are fine here.

## Captcha

`account.js` reads `captchaSiteKey` from `content.json`. An empty or
missing value disables the captcha silently, with no error, because
`setupCaptcha` returns early and `requireCaptcha` returns true. After any
captcha change, confirm in a browser that the widget actually renders.

Note that `netlify.toml` redirects `/account.html` to app.pravely.com, so
this page is not the signup form real users reach.
