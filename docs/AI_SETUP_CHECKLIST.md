# Setup checklist: safe AI changes

Start here. Updated September 15, 2026.

The longer `AI_NETLIFY_INTEGRATION_SETUP.md` has the same steps with more
explanation. This file is the short version.

---

## The idea in four sentences

Netlify does not give anyone permission to change code. Netlify watches
GitHub and builds whichever branch you point it at. So all the permission
settings happen in GitHub, and all the "which version goes live" settings
happen in Netlify.

You want two branches. `preview` is where everything happens and Claude can
merge on its own. `main` is what the public sees, and only you can merge
into it.

---

## What is already done

Done for you, no action needed:

- [x] `preview` branch created in `Pravely`
- [x] `preview` branch created in `pravely.com`
- [x] `AGENTS.md` and `CLAUDE.md` rules added to both, on `preview`
- [x] Nine unmerged August branches preserved as `archive/*` branches
- [x] Stale pull requests #6, #7 and #8 closed
- [x] Security audit and preview status moved to the private app repo

## Your existing work is safe

Nothing was deleted. Specifically:

- `preview` in both repos was cut from the current `main`, so it contains
  everything you have.
- Nine branches held commits that were never merged into `main`. Each now
  has a permanent copy under `archive/`, so the work cannot be lost even
  after you delete the originals.
- Closing a pull request deletes nothing. All three can be reopened.
- The two security documents were copied into the private repo before being
  removed from the public one.
- Codex's `codex/*` branches were not touched.

**The one thing this does not protect:** anything sitting uncommitted on
your own computer. If you have local edits in either project, commit and
push them to `preview` before you go further.

---

## Step 1. Stop committing straight to main

**This is the most important one.**

Since September 10 there have been seven commits pushed directly to `main`
in the app repo, including MFA and account-security changes. No branch, no
review, straight to the branch Netlify publishes.

Nothing below matters until this stops.

From now on, when you or any AI tool makes a change, it goes on `preview`
first. That branch now exists in both repos.

---

## Step 2. Lock `main` so mistakes cannot reach it

Do this once per repo. Roughly five minutes each.

Go to:

- https://github.com/itbb-creator/Pravely/settings/rules
- https://github.com/itbb-creator/pravely.com/settings/rules

In each:

1. Click **New ruleset**, then **New branch ruleset**
2. Name it `protect-main`
3. Change **Enforcement status** from Disabled to **Active**
4. Leave **Bypass list** empty. Do not add yourself
5. **Target branches** → **Add target** → **Include default branch**
6. Tick these boxes:
   - Restrict deletions
   - Block force pushes
   - Require a pull request before merging
   - Set **Required approvals** to **1**
   - Dismiss stale pull request approvals when new commits are pushed
7. Click **Create**

**Why this is the whole trick.** GitHub does not count an approval from the
person who wrote the pull request. Claude writes the pull request, so only
you can approve it. Claude keeps full merge permission everywhere and still
cannot reach production, no matter what it is told to do.

Leave **Require signed commits** off. It blocks AI pushes and gains you
nothing here.

**If GitHub asks you to upgrade:** the app repo is private, and private-repo
rulesets usually need GitHub Pro, a few dollars a month. If you would rather
not pay, do Step 5 instead, which achieves most of the same thing from the
Netlify side.

---

## Step 3. Let Claude merge freely on `preview`

Same screens, one more ruleset per repo. Two minutes each.

1. **New ruleset** → **New branch ruleset**
2. Name it `preview-flow`
3. **Enforcement status** → **Active**
4. **Target branches** → **Add target** → **Include by pattern** → type
   `preview`
5. Tick:
   - Require a pull request before merging
   - Set **Required approvals** to **0**
   - Block force pushes
6. Click **Create**

Zero approvals is deliberate. It is what lets Claude finish a fix without
waiting on you, on the branch where being wrong is cheap.

---

## Step 4. Tell Netlify which branch is which

Do this for both sites. Five minutes each.

1. Go to https://app.netlify.com and click the site
   - App: **pravelyapp**
   - Marketing: **timely-palmier-9a6a82**
   - If your account says "Projects" instead of "Sites", same thing
2. Left sidebar → **Site configuration** → **Build & deploy**
3. Find **Branches and deploy contexts** → **Configure**
4. Set **Production branch** to `main`
5. Under branch deploys, choose **Let me add individual branches** and add
   exactly one: `preview`
6. Leave **Deploy Previews** enabled
7. **Save**

Do not choose "All branches". The marketing repo has fifteen dead branches
and each would get its own public URL.

You now get a permanent test site at `preview--pravelyapp.netlify.app`.

---

## Step 5. Add a second safety net in Netlify

One minute, and worth doing even after Step 2.

1. Netlify → the site → **Deploys**
2. Find the options menu near the top and click **Stop auto publishing**

Netlify keeps building `main` so you can see whether it works, but nothing
reaches the live URL until you open a build and click **Publish deploy**.

If you skipped Step 2 because of the GitHub Pro cost, this is the step
carrying your safety.

---

## Step 6. Check what the live site is using

Ten minutes. Do this once, now.

The preview work used Cloudflare's always-pass captcha test key. If that
value ever got set as a plain site-wide variable instead of a
preview-only one, the live signup form passes every bot.

1. Netlify → **pravelyapp** → **Site configuration** → **Environment
   variables**
2. Look for a variable whose name contains `TURNSTILE`. The app uses names
   starting with `VITE_`
3. Check its **Scopes** column
   - Says **All deploy contexts** → this is the problem case, go to Step 7
   - Lists Production and Deploy previews separately → you are fine
4. Check the production value. If it is `1x00000000000000000000AA`, that is
   Cloudflare's always-pass test key and your live captcha is not protecting
   anything

Also check any `VITE_SUPABASE_URL` variable the same way. The production
project reference is `vtrdkoeydzvrhtiuykja`.

**One trap to know about.** If `VITE_SUPABASE_URL` is not set at all, the
app silently falls back to the production database, because that fallback is
hardcoded in `client/src/lib/supabase.ts`. A preview build with no variables
set is talking to real customer data.

---

## Step 7. Separate preview values from production values

Only needed if Step 6 found shared values. Ten minutes.

1. Netlify → **pravelyapp** → **Site configuration** → **Environment
   variables**
2. Click a variable → **Options** → **Edit**
3. Change it from one shared value to **Different value for each deploy
   context**
4. Fill in:

   | Variable | Production | Deploy previews and branch deploys |
   | --- | --- | --- |
   | Turnstile site key | real widget key | `1x00000000000000000000AA` |
   | Supabase URL | production project | `security-preview` branch project |
   | Supabase publishable key | production | preview branch |
   | Stripe publishable key | live key | test key |

5. **Save**, then redeploy

---

## Step 8. Create the real captcha widget

Still outstanding from the September 9 notes. Ten minutes.

1. https://dash.cloudflare.com → left sidebar → **Turnstile**
2. **Add widget**
3. Name: `Pravely authentication`
4. Widget mode: **Managed**
5. Add hostnames, one per entry:
   - `app.pravely.com`
   - `pravely.com`
   - `pravelyapp.netlify.app`
   - `timely-palmier-9a6a82.netlify.app`
6. **Create**
7. Copy the **Site Key** into Netlify, production scope, per Step 7
8. Copy the **Secret Key** into Supabase → **Authentication** → **Attack
   Protection** → Captcha → provider Turnstile

The secret key goes in Supabase only. Never in Netlify, never in either
repo, never in chat.

Squarespace holding your DNS does not affect this.

---

## Step 9. Housekeeping

Small things, no rush. These need you because they cannot be done through
the API this session has.

**Delete the thirteen dead branches.** Go to
https://github.com/itbb-creator/pravely.com/branches → **All branches**,
and click the trash icon on each of these:

```
agent/automate-validation              arena/019fedf2-intheblackbudget-com
agent/remove-apple-numbers             arena/019fee04-intheblackbudget-com
agent/site-launch-updates              arena/019feec2-intheblackbudget-com
agent/update-site-copy-and-platforms   arena/019ff95b-intheblackbudget-com
arena/019fe8df-intheblackbudget-com    arena/019ffe6a-intheblackbudget-com
arena/019fede1-intheblackbudget-com    arena/01a002c0-intheblackbudget-com
                                       arena/01a006d4-intheblackbudget-com
```

Their content is already preserved under `archive/`. Do not delete anything
starting with `archive/`, `codex/`, `claude/`, `preview`, or `main`.

**Archive the duplicate app repo.** `Pravely-App` has been idle since
August, and two similarly named app repos is how a change ends up in the
wrong one.
https://github.com/itbb-creator/Pravely-App/settings → bottom → **Archive
this repository**

**Turn on leaked-password protection in Supabase.** Still open from
September 9. Dashboard → **Authentication** → **Sign In / Providers** →
**Email** → enable **Leaked password protection**.

---

## How work happens after this

1. You describe the problem in chat
2. Claude branches from `preview`, fixes it, opens a pull request
3. Netlify builds a test URL and posts the result on the pull request
4. You open the URL and check it
5. You say "merge it", Claude merges into `preview`, no approval needed
6. Repeat until you are happy
7. At release, one pull request from `preview` into `main`, which only you
   can approve and merge

Steps 5 and 7 are the whole difference. Automatic where being wrong is
cheap, manual where it is not.

---

## Working with Codex and Claude at the same time

Both now read `AGENTS.md`, which sits at the root of each repo and holds
one shared rule set. `CLAUDE.md` just points at it, so the rules cannot
drift apart.

What keeps them out of each other's way:

- **Separate branch names.** Codex uses `codex/...`, Claude uses
  `claude/...`. Neither may touch the other's branches.
- **Both merge into `preview`, never `main`.** That branch is the single
  place their work meets.
- **Both check open pull requests before starting.** If one is already
  editing a file, the other is told to stop and say so rather than open a
  competing change.
- **Neither may force-push.** That is the operation that destroys the
  other's work, so it is off limits for both.

What you should do:

- Give them different areas when you can. One on captcha, the other on
  billing, rather than both in the auth flow.
- Merge finished work into `preview` promptly. An open pull request left
  for days means the other assistant is building on stale code.
- If they do collide, the fix is always to merge `preview` into the stuck
  branch and resolve it there. Never force-push out of a conflict.

---

## If something bad reaches the live site

Fix the live site first, then fix the code. Not the other way round.

1. Netlify → the site → **Deploys**
2. Scroll to the last build you know was good
3. Click it, then click **Publish deploy**

The live site is restored in seconds and no git work happened. Then revert
the bad commit on GitHub with the **Revert** button on the pull request.

If a real secret was exposed, reverting does not help. Rotate it: Turnstile
secrets in Cloudflare, Supabase keys in Project Settings → API, Stripe keys
in Developers → API keys.
