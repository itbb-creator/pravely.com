# Connecting Claude to GitHub and Netlify

Owner runbook. Written September 10, 2026 for the captcha and security preview work.

Goal: let Claude edit, pull, push, and merge automatically, with no path for an
unreviewed change to reach production.

---

## How to read this document

Every step gives you a **URL to paste**, the **clicks**, the **exact values** to
enter, and a **check** to confirm it worked.

Two honest caveats:

- Vendor menu labels drift. Netlify renamed "Sites" to "Projects" in its UI, and
  GitHub is mid-migration from "Branch protection rules" to "Rulesets". Where a
  label may differ I give both. The URLs land you on the right screen regardless
  of wording.
- This sandbox blocks outbound traffic to `docs.netlify.com`, `docs.github.com`,
  and `netlify.com`, so I could not re-verify vendor documentation while writing
  this. Everything about **your repositories** below was verified directly
  against the GitHub API today. Everything about **vendor UI** is from knowledge
  and marked where it matters.

Names used throughout:

| Placeholder | Value |
| --- | --- |
| Marketing repo | `itbb-creator/pravely.com` (public) |
| App repo | `itbb-creator/Pravely` (private) |
| Marketing Netlify site | `timely-palmier-9a6a82` |
| App Netlify site | `pravelyapp` |

---

## Part 0 — Stop. Check what went to production today.

Do this before configuring anything. Verified against the GitHub API on
September 10, 2026:

| Repo | Pull request | Merged into `main` at (UTC) |
| --- | --- | --- |
| `itbb-creator/Pravely` (app) | #1 Security preview and product fixes | 2026-09-10 **17:59:46** |
| `itbb-creator/pravely.com` (marketing) | #11 Security preview and product fixes | 2026-09-10 **18:04** |

Both security-preview branches are now merged into `main` in both repositories.
Your September 9 status document states that Netlify and production were
deliberately not deployed, so these merges may have happened after that document
was written, and Netlify may have deployed them automatically.

This matters more than usual because the preview configuration used **Cloudflare's
always-pass Turnstile test key** and the **`security-preview` Supabase branch**.
If those values were set as plain site-wide environment variables rather than
per-context ones, production may now be running a captcha that passes everybody,
or pointing at the preview database.

### 0.1 Check what the app site published

1. Open https://app.netlify.com and sign in.
2. Click the site named **pravelyapp**. If your account shows "Projects" instead
   of "Sites", it is the same thing.
3. In the left sidebar click **Deploys**.
4. Look at the top entry in the list. For each deploy the list shows the branch,
   the commit message, the time, and a state label.
5. Find any deploy where the branch column says **main** and the state says
   **Published** with today's date, roughly 18:00 UTC or later.

If such a deploy exists, the September 10 merge is live on app.pravely.com.

### 0.2 Check the captcha and database that deploy is using

1. Still in the **pravelyapp** site, left sidebar → **Site configuration**
   (or **Project configuration**) → **Environment variables**.
2. Look at every variable that mentions Turnstile, captcha, or Supabase.
3. For each one, look at the **Scopes** or **Contexts** column.
   - If it reads **All deploy contexts** or **All scopes**, the same value is
     being used by production and by previews. That is the problem case.
   - If it lists **Production**, **Deploy previews**, **Branch deploys**
     separately, you are already scoped correctly.
4. Compare the production Turnstile site key against Cloudflare's test key,
   `1x00000000000000000000AA`. If production is using that value, the captcha on
   your live signup form currently passes every visitor including bots.

### 0.3 Decide

- **Production is fine** → continue to Part 1.
- **Production is running test values** → do Part 7 now, then redeploy. If you
  want the live site back to its prior state immediately while you sort it out,
  jump to Part 12 and republish the last known-good deploy. That takes seconds
  and needs no git work.

Repeat 0.1 and 0.2 for the marketing site **timely-palmier-9a6a82**. Its exposure
is smaller, because `netlify.toml` redirects `/account.html` to `app.pravely.com`,
so the marketing captcha form is not the one real users hit.

---

## Part 1 — Understand what you are actually granting

There is no permission link between Claude and Netlify. Netlify grants nobody
edit or merge rights. Netlify watches GitHub and builds whichever branch you
told it to build.

So this splits cleanly:

| What you want | Where it is configured |
| --- | --- |
| Claude can edit, pull, push, merge | GitHub (Parts 2 to 4) |
| The right branch reaches the right URL | Netlify (Parts 5 to 7) |
| Claude can see deploy status and logs | Netlify MCP server (Part 10, optional) |

The safety does not come from restricting what Claude can do. It comes from
making `main` unmergeable without your approval, so that full automation
everywhere else is harmless.

---

## Part 2 — Confirm and extend Claude's GitHub access

**Correcting something I told you earlier in the session:** I said Claude had no
access to the app repo. That was wrong at the account level. Your Claude GitHub
authorization already covers three repositories:

- `itbb-creator/pravely.com` — public
- `itbb-creator/Pravely` — private, last pushed today. This is the live app.
- `itbb-creator/Pravely-App` — private, last pushed August 25. Stale.

What is scoped per session is which of those a given Claude session can touch.
This session started scoped to the marketing repo only, which is what I was
seeing.

### 2.1 Verify the account-level grant

1. Open https://github.com/settings/installations
2. Find **Claude** in the list and click **Configure**.
3. Scroll to **Repository access**.
4. Select **Only select repositories** if it is not already selected.
5. In the repository picker confirm these two are present, and add any that are
   missing:
   - `pravely.com`
   - `Pravely`
6. Leave `Pravely-App` **out** of the list. See 2.3.
7. Click **Save**.

Note that this is a personal account, not a GitHub organization, so there is no
organization admin screen to visit. This page is the whole grant.

### 2.2 Scope a session to the right repo

When you start work at https://claude.ai/code, the new-session screen has a
repository selector. Pick the repo the work belongs to:

- Captcha, login, signup, Turnstile widget, Supabase auth → **Pravely** (the app)
- Marketing pages, `netlify.toml`, redirects, `content.json` → **pravely.com**

If you are already mid-session and need the other repo, just say so in chat.
I can attach it without you restarting. I attached `Pravely` to this session
while writing this document, so both are in scope right now.

### 2.3 Retire the duplicate app repo

`Pravely-App` and `Pravely` are both private app repos. Two similarly named
repositories is precisely the setup that produces a correct change pushed to the
wrong place.

1. Open https://github.com/itbb-creator/Pravely-App/settings
2. Scroll to the bottom, to the **Danger Zone**.
3. Click **Archive this repository**, then type the repository name to confirm.

Archiving makes it read-only and permanently obvious. It is reversible. Do not
delete it until you are certain nothing references it.

### 2.4 Note on the public marketing repo

`itbb-creator/pravely.com` is **public**. Anyone can read it, including
`docs/PRODUCT_SECURITY_AUDIT_2026-09-08.md` and
`docs/PREVIEW_RELEASE_STATUS_2026-09-09.md`, which together list your open
security gaps, your Supabase project reference, and which protections are not yet
enabled.

No credentials are exposed. The Turnstile site key in `content.json` is public by
design, and the Supabase publishable key is meant for browsers. But a current,
dated list of your unfixed weaknesses is useful to an attacker.

Options, in order of preference:

1. Move both documents into the private app repo and delete them here.
2. Make the marketing repo private: https://github.com/itbb-creator/pravely.com/settings
   → Danger Zone → **Change repository visibility** → Private. Netlify keeps
   deploying it, because the Netlify GitHub App retains access.
3. Keep them public as a deliberate choice.

Either way, remember that git history keeps the old copies, so deleting the file
in a new commit does not remove it from the public record.

---

## Part 3 — Create a durable preview branch in each repo

`codex/security-preview` is now merged in both repos, so it is a spent branch.
Cutting new work from it stacks changes on top of already-merged history. Create
one long-lived preview branch per repo instead.

### 3.1 In the browser (easiest)

For each of these two URLs:

- https://github.com/itbb-creator/Pravely/branches
- https://github.com/itbb-creator/pravely.com/branches

Steps:

1. Click the green **New branch** button, top right.
2. **New branch name:** `preview`
3. **Source:** `main`
4. Click **Create new branch**.

### 3.2 Or from a terminal

```
git fetch origin main
git checkout -B preview origin/main
git push -u origin preview
```

### 3.3 The rule this creates

- Every Claude working branch is cut from `preview` and merges back into `preview`.
- `preview` merges into `main` only through a pull request you approve, at a
  release moment you choose.
- Until the captcha work is done, treat `main` as frozen in both repos.

### 3.4 Clean up the stale branches (marketing repo only)

The marketing repo has fifteen abandoned branches: eight `arena/*`, four
`agent/*`, and three `codex/*`. They matter because Part 5 offers a Netlify
setting that would deploy all of them to public URLs.

1. Open https://github.com/itbb-creator/pravely.com/branches
2. Click the **All branches** tab.
3. For each `arena/*` and `agent/*` branch, click the trash-can icon at the right
   of its row.
4. Leave `main`, `preview`, and any branch with an open pull request you still
   want.

Also close the three stale pull requests, #6, #7, and #8, all from August:
https://github.com/itbb-creator/pravely.com/pulls

---

## Part 4 — Protect `main`. This is the step that makes automation safe.

Do this in **both** repos. It is the single most important part of this document.

### 4.1 A plan caveat, read first

- `pravely.com` is **public**, so rulesets are available on the free plan.
- `Pravely` is **private**. On a free personal account, branch protection and
  rulesets on private repositories are typically unavailable, requiring GitHub
  Pro. Pro is a few dollars a month. I could not verify current plan gating from
  this sandbox, so treat this as the thing to check, not as fact.
- If the ruleset UI is unavailable for the private repo, use the fallback in 4.4.

### 4.2 Create the ruleset

For each repo, open:

- https://github.com/itbb-creator/Pravely/settings/rules
- https://github.com/itbb-creator/pravely.com/settings/rules

Then:

1. Click **New ruleset** → **New branch ruleset**.
2. **Ruleset Name:** `protect-main`
3. **Enforcement status:** switch from Disabled to **Active**.
4. **Bypass list:** leave it **empty**. Do not add yourself, and do not add any
   app. A bypass that exists will eventually be used by accident, which is the
   exact failure you are trying to prevent.
5. **Target branches:** click **Add target** → **Include default branch**. That
   is `main` in both repos.
6. Under **Rules**, tick these boxes:

   | Checkbox | Setting |
   | --- | --- |
   | Restrict deletions | on |
   | Block force pushes | on |
   | Require a pull request before merging | on |
   | ↳ Required approvals | **1** |
   | ↳ Dismiss stale pull request approvals when new commits are pushed | on |
   | ↳ Require conversation resolution before merging | on |
   | Require status checks to pass | on, see 4.3 |

7. Leave **Require signed commits** off. It will block Claude's pushes and buys
   you little here.
8. Leave **Require review from Code Owners** off. You have no CODEOWNERS file.
9. Click **Create**.

**Why this works.** Claude keeps full merge permission. But GitHub will not let
any pull request into `main` without one approving review, and GitHub does not
count a review from the author of the pull request. Since Claude authors these
pull requests, only you can supply that approval. Claude physically cannot reach
production on its own, no matter what it is asked to do or what it misreads.

One caveat: leave **Require approval of the most recent reviewable push**
**off**. With it on, if you ever push a commit to a Claude branch yourself, you
become that push's author and can no longer approve the pull request, and you
will be stuck.

### 4.3 Add the Netlify build as a required check

Do this after Part 5, because the check name only appears in GitHub once Netlify
has posted at least one build status.

1. Return to the ruleset: Settings → Rules → click `protect-main` → **Edit**.
2. Under **Require status checks to pass**, click **Add checks**.
3. Type `netlify` in the search box.
4. Select the entry named something like **netlify/pravelyapp/deploy-preview**.
   The exact string is generated by Netlify.
5. Tick **Require branches to be up to date before merging**.
6. Click **Save changes**.

Now a pull request whose Netlify build failed cannot be merged at all.

### 4.4 Fallback if rulesets are unavailable on the private repo

If GitHub will not let you protect `main` in `Pravely` without an upgrade, you
have three options in order of strength:

1. **Upgrade to GitHub Pro.** https://github.com/settings/billing/plans →
   **Upgrade**. This is the real fix.
2. **Turn off auto-publishing in Netlify** (Part 5.4). Merges to `main` still
   happen, but nothing reaches the live URL until you click Publish. This moves
   the gate from GitHub to Netlify. It is a genuine control, not a nominal one.
3. **Instruction only,** via the `CLAUDE.md` in Part 9. This is the weakest,
   because it depends on an agent following instructions rather than on a
   mechanism refusing the action. Do not rely on it alone.

Doing 2 as well as 1 is better than either alone.

---

## Part 5 — Protect `preview` lightly, so automatic merging is possible there

Same screens as Part 4, one ruleset per repo.

1. https://github.com/itbb-creator/Pravely/settings/rules → **New ruleset** →
   **New branch ruleset**.
2. **Ruleset Name:** `preview-flow`
3. **Enforcement status:** **Active**
4. **Target branches:** **Add target** → **Include by pattern** → type `preview`
   → **Add Inclusion pattern**.
5. Rules to tick:

   | Checkbox | Setting |
   | --- | --- |
   | Require a pull request before merging | on |
   | ↳ Required approvals | **0** |
   | Require status checks to pass | on, add the Netlify check once available |
   | Block force pushes | on |

6. Click **Create**.

Zero required approvals is deliberate. Claude can merge its own work into
`preview` the moment the Netlify preview build goes green, with no wait on you.
That is the "merge automatically" you asked for, confined to the branch where it
is safe.

---

## Part 6 — Point Netlify at the right branches

Do this for **both** sites. Steps are written for the app site; repeat for
marketing.

1. Open https://app.netlify.com and click the **pravelyapp** site.
2. Left sidebar → **Site configuration** (or **Project configuration**).
3. Click **Build & deploy** → the **Continuous deployment** section.
4. Find **Branches and deploy contexts** and click **Configure**.

### 6.1 Production branch

- **Production branch:** `main`
- Confirm it is not set to `preview`, `codex/security-preview`, or a feature
  branch. If it points anywhere but `main`, that alone explains a surprise
  deploy.

### 6.2 Branch deploys

- Select **Let me add individual branches**.
- In the box, add exactly one: `preview`
- Do **not** select **All**. In the marketing repo that would spin up a public
  URL for every stale branch.

This gives `preview` a stable URL of the form
`preview--pravelyapp.netlify.app`, which becomes your running integration
environment.

### 6.3 Deploy previews

- Set **Deploy Previews** to **Any pull request against your production branch /
  branch deploy branches**.

This is what produced `deploy-preview-1--pravelyapp.netlify.app` during your
Codex work. Each pull request gets its own throwaway URL.

Click **Save**.

### 6.4 Stop auto-publishing production while the release is pending

1. Left sidebar → **Deploys**.
2. Near the top right there is a **Deploy settings** or options menu, sometimes
   shown as **Stop auto publishing**.
3. Click **Stop auto publishing**.

Netlify keeps building `main` on every push, so you still see whether it builds,
but no build becomes the live site until you open a deploy and click **Publish
deploy**. Turn this back on after the captcha release ships, or leave it off
permanently. Many teams leave it off.

---

## Part 7 — Password-protect the previews

Preview URLs run test captcha keys. They should not be publicly reachable. The
marketing site already has team-login protection on; the app site needs checking.

1. **pravelyapp** → **Site configuration** → **Access & security**.
2. Find **Visitor access** or **Password protection**.
3. Under the deploy preview or branch deploy option, choose **Require Netlify
   team login** if your plan offers it, otherwise **Password** and set one.
4. Click **Save**.

Verify by opening a preview URL in a private browsing window. You should be
challenged rather than shown the app.

---

## Part 8 — Split preview and production values by deploy context

This is the mechanism that makes it structurally impossible for the always-pass
test captcha key to ride a merge into production.

### 8.1 Set them in Netlify

1. **pravelyapp** → **Site configuration** → **Environment variables**.
2. For each variable below, click it, then **Options** → **Edit**, and change
   **Scopes / Values** from a single shared value to **Different value for each
   deploy context**.
3. Fill in:

   | Variable | Production | Deploy previews | Branch deploys |
   | --- | --- | --- | --- |
   | Turnstile site key | your real widget key | `1x00000000000000000000AA` | `1x00000000000000000000AA` |
   | Supabase URL | production project | `security-preview` branch project | `security-preview` branch project |
   | Supabase publishable key | production | preview branch | preview branch |
   | Stripe publishable key | live key | test key | test key |

4. Click **Save** on each.

The exact variable names come from your app's build configuration. Ask me to read
them out of the app repo and I will list them precisely.

### 8.2 Or set them in `netlify.toml`

Anything not secret can live in the repo instead, using deploy contexts. Site
keys and public URLs qualify; secrets never do.

```toml
[context.production.environment]
  VITE_TURNSTILE_SITE_KEY = "your-real-widget-key"

[context.deploy-preview.environment]
  VITE_TURNSTILE_SITE_KEY = "1x00000000000000000000AA"

[context.branch-deploy.environment]
  VITE_TURNSTILE_SITE_KEY = "1x00000000000000000000AA"
```

For the marketing site the equivalent value is `captchaSiteKey` in
`content.json`, which is read at runtime rather than at build time, so it cannot
be switched by deploy context without a code change. Currently it holds
`0x4AAAAAAEt8971O6gT1siud`, a real site key, which is correct for production.

One trap specific to your code. In `account.js`:

```js
const captchaSiteKey = config.captchaSiteKey || (
  ['localhost', '127.0.0.1'].includes(location.hostname) ? '1x00000000000000000000AA' : ''
);
```

An empty key makes `setupCaptcha` return early and `requireCaptcha` return true.
A missing or misspelled key therefore disables the captcha **silently**, with no
error anywhere. Whenever you change captcha configuration, verify by loading the
page and confirming the widget renders, not by reading the config.

### 8.3 Where the Turnstile secret goes

The secret key goes into Supabase Auth settings only. Never into Netlify, never
into either repository, never into chat, never into a screenshot. Your
`supabase/config.toml` already sets `provider = "turnstile"`, so the secret is
read from the Supabase Auth configuration for whichever Supabase branch is in
use.

---

## Part 9 — Create the real Turnstile widget

Still outstanding from your September 9 status document.

1. Open https://dash.cloudflare.com and sign in.
2. Left sidebar → **Turnstile**.
3. Click **Add widget**.
4. **Widget name:** `Pravely authentication`
5. **Hostnames:** click **Add hostname** for each of these, one per entry:
   - `app.pravely.com`
   - `pravely.com`
   - `www.pravely.com`
   - `pravelyapp.netlify.app`
   - `timely-palmier-9a6a82.netlify.app`

   Cloudflare matches subdomains of a listed hostname, so
   `pravelyapp.netlify.app` covers `deploy-preview-1--pravelyapp.netlify.app`.
   Confirm this on the widget's settings page rather than assuming it.

   The same rule means `books.pravely.com` needs no entry of its own; the
   `pravely.com` line covers it. See 14.3.
6. **Widget mode:** **Managed**
7. Click **Create**.
8. Copy the **Site Key** into Netlify production scope per Part 8.
9. Copy the **Secret Key** into Supabase → **Authentication** → **Attack
   Protection** → **Enable Captcha protection** → provider **Turnstile** → paste
   the secret. Do this on the **production** Supabase project, and use the test
   secret `1x0000000000000000000000000000000AA` on the `security-preview` branch.

Squarespace holding your DNS does not affect any of this. Turnstile only cares
about the hostname allowlist.

---

## Part 10 — Write the rules where Claude reads them

Branch protection stops the dangerous action. `CLAUDE.md` stops Claude from
trying it, which saves you rejections and confusion. It is loaded automatically
at the start of every session in that repo.

Create `CLAUDE.md` at the root of **both** repos with content along these lines:

```markdown
# Working rules

## Branches
- Production branch is `main`. Never push to it, never merge into it.
- Integration branch is `preview`. All work branches from `preview`.
- Name work branches `claude/<short-description>`.
- Open pull requests into `preview`, never into `main`.
- Merge into `preview` only after the Netlify preview build is green.
- Only the owner merges `preview` into `main`.

## Never without explicit approval in the current session
- Force-push or rewrite history on any branch.
- Change Netlify production settings, production environment variables,
  or publish a production deploy.
- Touch the production Supabase project, Stripe live mode, or any real secret.
- Commit any secret key. Turnstile site keys are public; secret keys are not.

## Captcha specifics
- Preview and deploy-preview contexts use Cloudflare test keys.
- Production uses the real `Pravely authentication` widget.
- An empty captcha site key disables the widget silently. Always verify the
  widget renders in a browser after changing captcha configuration.
```

Ask me to create these and I will, on a branch, as a pull request.

---

## Part 11 — Optional: let Claude see Netlify itself

This is the only part that is literally "Claude connected to Netlify". It gives
Claude read access to deploy status and build logs, and write access to site
configuration, so it can diagnose a failed preview build without you pasting
logs.

On **your own machine**, in a terminal with Claude Code installed:

```
claude mcp add --transport http netlify https://mcp.netlify.com/mcp
```

Then inside Claude Code:

1. Run `/mcp`
2. Select **netlify**
3. Choose **Authenticate**, which opens a browser
4. Approve the Netlify OAuth prompt

Two caveats, stated plainly:

- I could not verify Netlify's current MCP documentation, because this sandbox
  blocks `docs.netlify.com`. Confirm the command at
  https://docs.netlify.com/build/build-with-ai/netlify-mcp-server/ before running
  it. The server address may have changed.
- The same egress block means this will not work from a Claude Code session on
  the web. It works in the local CLI and the desktop app.

Do this only after Parts 4 through 8 are in place. It carries real write access
to your Netlify configuration.

---

## Part 12 — The daily working loop

Once the setup above is done, a captcha fix looks like this. The literal words to
type at Claude are in quotes.

1. **You:** "Work in the Pravely app repo. Branch from preview. The Turnstile
   widget does not reload after a failed login, so the second attempt always
   fails. Fix it and open a pull request into preview."
2. **Claude:** pulls `preview`, cuts `claude/turnstile-reset-on-failure`, edits,
   pushes, opens the pull request into `preview`.
3. **Netlify:** builds `deploy-preview-N--pravelyapp.netlify.app` and posts the
   status back onto the pull request.
4. **You:** open that URL, sign in with a wrong password, confirm the widget
   resets and a second attempt works.
5. **You:** "Looks right, merge it."
   **Claude:** merges into `preview`. No approval needed, because Part 5 set
   required approvals to zero there.
6. **Repeat** for each fix. `preview--pravelyapp.netlify.app` accumulates them.
7. **At release:** "Open a pull request from preview into main." You review the
   full diff, click **Approve**, click **Merge**. If Part 6.4 is on, you then
   open Netlify → Deploys → the new `main` build → **Publish deploy**.

Steps 5 and 7 are the whole distinction you asked for. Automatic where it is
cheap to be wrong, manual where it is not.

---

## Part 13 — If something reaches production by mistake

Fix the live site first, then fix git. Do not reverse that order.

### 13.1 Roll back the live site, about thirty seconds

1. https://app.netlify.com → the affected site → **Deploys**.
2. Scroll to the last deploy you know was good. The list shows commit messages
   and times.
3. Click that deploy to open it.
4. Click **Publish deploy** at the top.

The live URL now serves that build. No git operation happened, and nothing was
lost.

### 13.2 Then fix git

1. Open the merge commit on GitHub.
2. Click **Revert** on the pull request, which opens a new pull request.
3. Review and merge that revert pull request.

Never force-push `main` to undo a merge. Reverting keeps everyone's clones valid.

### 13.3 If a secret was exposed

Reverting the commit does not un-expose it. The value must be rotated at its
source:

- **Turnstile secret:** Cloudflare → Turnstile → the widget → **Settings** →
  **Rotate secret key**, then update Supabase Auth.
- **Supabase service role key:** Supabase → Project Settings → API → **Reset**.
- **Stripe key:** Stripe → Developers → API keys → **Roll key**.

Assume any secret that reached a public repository is compromised the moment it
was pushed, regardless of how quickly it was removed.

---

## Part 14 — Pravely Books (`books.pravely.com`)

Pravely Books is the internal bookkeeping tool. It is a second, separate build
of the `Pravely` repo, not a third repo and not part of the customer app. It
went live on 16 September 2026.

### 14.1 Why it exists

The `business_*` tables were always admin-only and always required AAL2, so the
accounting module was never a customer feature. It was still **compiled into the
customer bundle**: the app imported it statically and only hid the rendering
behind an admin check, so the internal tooling was readable in devtools by
anyone. Splitting it into its own build removes it from the customer bundle
entirely.

### 14.2 Netlify site configuration

A separate Netlify site, publishing a different output directory from the same
repository:

| Setting | Value |
| --- | --- |
| Branch to deploy | `preview` (see 14.4 before changing this) |
| Build command | `npm run build:books` |
| Publish directory | `dist-books` |
| Custom domain | `books.pravely.com` |

`npm run build` and `npm run build:books` write to `dist/` and `dist-books/`
respectively and never collide, so the app site and the books site can build
from the same commit without interfering.

No Netlify environment variables are required on the books site. The Supabase
URL, the Supabase publishable key, and the Turnstile site key all have
production fallbacks compiled into the client, so an unset variable yields the
production value rather than an empty one. That is deliberate: it is the same
"missing key disables the captcha silently" failure described in 8.2, and the
fallback is what prevents it.

### 14.3 Turnstile needs no new hostname

`books.pravely.com` does **not** need its own entry in the Part 9 hostname
allowlist. Cloudflare Turnstile matches subdomains of a listed hostname, and
`pravely.com` is already listed, so the subdomain was covered the moment DNS
resolved.

This was verified by signing in, not by reading configuration. The sign-in form
refuses to submit without a captcha token, so a hostname Cloudflare rejected
would have blocked the attempt. A successful sign-in is therefore proof that the
widget rendered, Cloudflare issued a token for this hostname, and Supabase
accepted it.

Squarespace holding the DNS has no bearing on this. Turnstile only checks the
hostname.

### 14.4 Which branch the books site should deploy

It deploys `preview` today, which means the tool used for real bookkeeping
tracks the integration branch and changes on every merge, with no release step.
`main` would be the better source.

**It cannot move yet.** As of 16 September 2026 `main` contains no `books/`
directory, no `vite.books.config.ts`, no `script/build-books.ts`, and no
`build:books` script. Pointing the books site at `main` today fails the build
immediately.

Moving it is blocked behind a larger problem: **`main` and `preview` have
diverged.** Their merge base is `96bbd51` "Keep MFA authenticator-only", from
15 September. Since then `main` has taken three direct pushes that never went
through `preview`:

| Commit | Subject |
| --- | --- |
| `4a62e47` | Complete web v1 product gates |
| `09a8a23` | Add hosted web v1 acceptance suite |
| `404a013` | Clarify internal accounting and add release checks |

`preview` is fifteen commits ahead on its own line, carrying the Books split and
the officer skills.

### 14.5 What the merge actually does

`git merge origin/main` into `preview` produces **one conflict**, in the
`client/src/App.tsx` sidebar. `preview` deleted the "Business accounting" nav
item when the module moved to Pravely Books; `main`'s `404a013` renamed its
label to "Pravely accounting". Resolve it in `preview`'s favour: the item should
not exist in the customer app at all.

Keep `main`'s relabel inside `Accounting.tsx`. Pravely Books renders that page,
and the clearer wording belongs there.

The other three pieces of the split — the `AccountingPage` import, the
`"accounting"` member of the `View` type, and the render block — merge correctly
with no intervention. `package.json` also merges cleanly in both directions,
keeping `build:books` from `preview` alongside `engines.node >= 22` and the
three test scripts from `main`.

**Verify the outcome anyway.** Typecheck, tests and both builds all pass happily
with the accounting module compiled back into the customer app, so none of them
can tell you whether the split survived. The only check that can is a grep of
the built bundle:

```
grep -rE 'business_(accounts|transactions|invoices|contacts)' dist/public
```

That must return nothing. Grep the build output, not the source — a source grep
passes while the bundle is still wrong.

`main` also adds `.github/workflows/verify.yml`, which runs on every pull
request: a tracked-file secret scan, `npm run check`, four test scripts,
`npm run build`, and `npm audit`. As written it builds the customer app only, so
it covers neither the Books build nor the property above.

### 14.6 The order that keeps production safe

1. Merge `main` **into** `preview` on a branch. A broken result costs nothing
   there. Never resolve any of this on `main`.
2. Resolve the single `App.tsx` conflict as described in 14.5.
3. Verify: `npm run check`, `npm run build`, `npm run build:books`, the four
   test scripts, and the `dist/public` grep above.
4. Add `npm run build:books` and that grep to `verify.yml` so neither can
   regress unnoticed.
5. Only then open `preview` → `main`, which by the rules in Part 10 is the
   owner's merge to make.
6. After that lands, change the books site's branch to `main` and redeploy.
7. Sign in at `books.pravely.com` and confirm the captcha widget renders and the
   ledger loads before considering the move done.

Steps 1 to 4 are done in `Pravely` pull request #5. Until step 5, production
still ships the accounting module inside the customer app. The split exists only
on `preview`.

### 14.7 A caution about stale refs

The first version of this section reported that the merge was clean and silently
undid the split. That was wrong, and worth recording because the mistake is easy
to repeat: the local clone's `origin/preview` was stale, pinned a commit before
the Books split, so the merge was computed against the wrong base.

Before reasoning about what a merge will do, force-update the refs and confirm
the tips are what you expect:

```
git fetch origin preview:refs/remotes/origin/preview --force
git log --oneline -1 origin/preview
```

A shallow or long-lived clone is the usual culprit. Paginated commit listings
from the GitHub API mislead the same way: they show a window, not the graph, and
two branches whose recent commits do not overlap can still share a base a few
commits back. Use `git merge-base` rather than inferring divergence from a list.

---

## Setup checklist

Last reconciled against the live repositories on 17 September 2026. Items are
ticked only where the evidence is named. A stale security checklist is worse
than no checklist, because it reports work that was never done as finished.

### Done, with the evidence

- [x] `preview` exists in both repos, and `CLAUDE.md` is in both
- [x] Branch protection on **both** repos. `protect-main` and `preview-flow`
      are `active` in each, with empty bypass lists, force-push blocked, and
      `main` requiring a reviewed pull request. `Pravely`'s were created on
      15 September and were correct all along — the pre-Pro `403` on its
      rulesets endpoint hid them from the API, and an earlier version of this
      document read that silence as absence. GitHub Pro bought visibility,
      not protection
- [x] Archive `Pravely-App`. Archived, and referenced by nothing: no Netlify
      site builds from it (all three build from `Pravely` or `pravely.com`),
      and neither repo references it outside `pravely-app-icon.png` and the
      paragraphs in these docs
- [x] Leaked-password protection enabled. The Supabase linter reports it only
      when it is off, and it is absent from the advisor output
- [x] Deploy previews isolated from production captcha.
      `VITE_TURNSTILE_SITE_KEY` is set to Cloudflare's test key on
      `deploy-preview` and `branch-deploy` only; production sets no value and
      so resolves to the compiled production key. Note that the Netlify MCP
      returns `"Environment variable upserted"` even when the write silently
      does nothing — passing `newVarScopes` triggers this. Always read the
      variables back rather than trusting the success string
- [x] App site previews closed to the public. `pravelyapp` now requires team
      login on non-production, matching the other two sites
- [x] The real `Pravely authentication` Turnstile widget exists and is in use.
      Its production site key is the compiled fallback in
      `client/src/components/Turnstile.tsx`, and a live sign-in at
      `books.pravely.com` was accepted, which only happens when Cloudflare
      issues a token for that hostname and Supabase verifies it
- [x] Books site building `npm run build:books` into `dist-books`
- [x] `books.pravely.com` resolving, sign-in and ledger confirmed working
- [x] Turnstile hostname confirmed covered by the `pravely.com` entry
- [x] `main` → `preview` merged with the accounting nav conflict resolved
      (`Pravely` #5)
- [x] `preview` → `main` merged (`Pravely` #10, tip `2a10ed6`), so the
      accounting module is out of the customer app on `main`. Verified on that
      tree: `check`, `build` and `build:books` pass, and `dist/public` carries
      no `business_*` reference
- [x] Books site repointed from `preview` to `main`, deploy confirmed at
      `2a10ed6`

### Open, and verifiable from the repos

- [ ] **Make `verify` a required status check on both `Pravely` rulesets.**
      Both rulesets require a pull request but neither requires a passing
      build, so a red `verify` can still be merged. That makes the customer
      bundle check in 14.5 advisory rather than binding, which is the one
      thing it exists to prevent.

      This cannot be done from a Claude session: `PUT` to the rulesets API
      returns *"Write access to this GitHub API path is not permitted through
      this proxy"*, whatever the plan. Do it by hand at
      https://github.com/itbb-creator/Pravely/settings/rules — for each of
      `protect-main` and `preview-flow`, tick **Require status checks to
      pass** and add `verify`.

      Add only `verify`. The Netlify checks report `neutral` on deploys that
      change no pages, which would block merges for no reason.
- [ ] Consider the same on the `pravely.com` rulesets
- [ ] Archive `Pravely-App`, and confirm the grant covers `pravely.com` and
      `Pravely` only
- [ ] Delete the merged `claude/*` branches in both repos. Never touch
      `codex/*` or `archive/*`
- [ ] Decide what to do about the public security documents

### Open, and only checkable in a dashboard

Nothing in the repository can confirm or deny these. Each needs someone signed
in to look.

- [ ] Confirm the production deploy of `main` actually published, and that the
      live `app.pravely.com` bundle carries no `business_*` reference
- [ ] Confirm production is not running the always-pass test captcha key
      `1x00000000000000000000AA`
- [ ] Confirm production is not pointing at the `security-preview` Supabase
      branch
- [ ] Turnstile, Supabase and Stripe values split by deploy context. Note the
      compiled production fallbacks described in 14.2: an unset variable in a
      preview context silently yields the *production* value, so preview
      contexts must set theirs explicitly
- [ ] Branch deploys limited to `preview` only; deploy previews enabled
- [ ] Preview password or team-login protection on the app site
- [ ] Real Turnstile secret in production Supabase Auth, test secret on the
      preview branch
- [ ] Enable leaked-password protection, still open from 9 September
- [ ] Optionally connect the Netlify MCP server from the local CLI
