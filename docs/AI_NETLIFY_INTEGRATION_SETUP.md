# Connecting Claude to GitHub and Netlify

Owner runbook. Written September 10, 2026 for the captcha/security preview work.

Goal: let Claude edit, pull, push, and merge automatically, without any risk of an
unreviewed change reaching production.

---

## 0. The one thing to understand first

There is no direct permission link between Claude and Netlify. Netlify does not
grant edit or merge rights to anyone. Netlify watches GitHub and builds whatever
branch you told it to build.

So "give Claude permission to edit, pull, and merge" is a **GitHub** setting, and
"make sure the right change reaches the right URL" is a **Netlify** setting. They
are configured separately, on different screens, and the safety comes from the
combination.

There are three links to set up:

| Link | Direction | What it grants | Required? |
| --- | --- | --- | --- |
| A | GitHub → Claude | Read, edit, push, open PRs, merge | Required |
| B | GitHub → Netlify | Build and deploy branches | Already installed |
| C | Netlify → Claude | Read deploy status, logs, env var names | Optional |

Link C is the only thing that is literally "Claude connected to Netlify," and it
is read-and-configure access to your Netlify account, not deploy approval.

---

## 1. Verified current state

Checked directly against the repository and GitHub on September 10, 2026.

**Repositories**

- `itbb-creator/pravely.com` — the marketing site. This is the only repo Claude's
  session currently has access to.
- `itbb-creator/Pravely` — the app. Referenced in
  `docs/PREVIEW_RELEASE_STATUS_2026-09-09.md` as the source of the app preview.
  **Claude has no access to it yet.** Most captcha and auth code lives here, so
  this is the repo that actually needs step 2 below.

**Netlify sites**

- Marketing: `timely-palmier-9a6a82` (deploy preview 11 was verified live).
- App: `pravelyapp` (deploy preview 1 was verified live).

**Branches in `pravely.com`**

- `main` is the production branch and is **not protected**. Anyone or anything
  with write access can push straight to it today.
- `codex/security-preview` was the preview branch. Pull request #11 was **merged
  into `main` on September 10**, so the security preview work is now on the
  production branch of the marketing repo.
- Fifteen other stale `agent/*` and `arena/*` branches exist, plus three open
  pull requests (#6, #7, #8) dating to August.

**Action before anything else:** confirm what Netlify did with that September 10
merge. If the marketing site's production branch is `main` and auto-publish is
on, that merge is already live at pravely.com. Open Netlify → the marketing site
→ Deploys and look at the most recent production deploy. Decide whether that is
what you wanted before adding any automation on top.

**Captcha wiring, for reference**

- `content.json` carries `captchaSiteKey` = `0x4AAAAAAEt8971O6gT1siud`. A
  Turnstile *site* key is public by design, so this is fine in the repo.
- `account.js` falls back to Cloudflare's always-pass test key only on
  `localhost`, and to an empty string otherwise. An empty key disables the
  widget silently, so a missing or wrong `captchaSiteKey` in a deploy context
  means no captcha rather than a visible error. Watch for that.
- The Turnstile **secret** lives in Supabase Auth settings, never in this repo.

---

## 2. Link A — give Claude GitHub access

This is what grants edit, pull, push, and merge.

1. Go to https://claude.ai/settings/connectors and open the GitHub connector.
   If GitHub is not connected yet, connect it and authorize the account that owns
   `itbb-creator`.
2. When GitHub asks which repositories to expose, choose **Only select
   repositories** rather than All repositories. Select:
   - `itbb-creator/pravely.com`
   - `itbb-creator/Pravely`
3. Confirm the app is granted Contents: read and write, Pull requests: read and
   write. That set covers clone, pull, commit, push, open a PR, comment, and
   merge.
4. Back in a Claude Code session, confirm access by asking Claude to list the
   branches in each repo. If the app repo is missing, Claude can attach it
   mid-session, but the org-level grant in step 2 has to exist first.

Nothing here is Netlify-specific. Once Claude can push a branch, Netlify sees it
within seconds.

**Do not** create a separate deploy key, personal access token, or machine user
for this. The GitHub App grant is revocable in one click and is scoped per repo;
a token in a config file is neither.

---

## 3. Lock `main` before you turn automation on

This is the step that makes automatic merging safe. Do it in **both** repos.

GitHub → repo → Settings → Branches → Add branch ruleset (or classic branch
protection) targeting `main`:

- Require a pull request before merging.
- Require **1 approval**, and make that approval yours. This is the switch that
  keeps Claude from merging to production even though it technically has merge
  permission.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass. Once Netlify is building deploy previews, add
  the Netlify check here so a failed build blocks the merge.
- Block force pushes.
- Do **not** add an exemption for apps or for yourself. An exemption that exists
  will eventually be used by accident.

After this, Claude can do everything except the final merge to production. That
is exactly the boundary you described wanting.

---

## 4. Establish a durable preview branch

`codex/security-preview` has been merged and is now a dead branch. Rather than
reusing it, create one long-lived preview branch per repo and keep it forever:

```
git fetch origin main
git checkout -B preview origin/main
git push -u origin preview
```

Rules for it:

- Every Claude working branch is cut **from `preview`** and merges **back into
  `preview`**, never into `main`.
- `preview` merges into `main` only through a pull request you approve, in one
  batch, at a release moment.
- Protect `preview` too, but lightly: require a pull request, require the Netlify
  check, and allow Claude to merge without approval. That gives you automatic
  merging where it is safe.

While the captcha work is in flight, treat `main` as frozen.

---

## 5. Link B — point Netlify at the right branches

Netlify → site → Site configuration → Build & deploy → Branches and deploy
contexts. Do this for **both** sites.

1. **Production branch:** `main`. Confirm it is not set to `preview` or to a
   feature branch.
2. **Branch deploys:** choose *Let me add individual branches* and add exactly
   one, `preview`. Do not choose "All". With fifteen stale branches sitting in
   the marketing repo, "All" would spin up fifteen deploys and fifteen public
   URLs.
3. **Deploy previews:** leave enabled. Each pull request gets its own
   `deploy-preview-N--sitename.netlify.app` URL, which is what you have been
   testing against.
4. **Deploy Preview protection:** keep the team-login requirement that is already
   on the marketing site, and turn the same thing on for the app site. A preview
   running test captcha keys should never be publicly reachable.

Optional but recommended while a release is pending: Netlify → Deploys → and use
**Stop auto publishing** on the production context. Netlify keeps building `main`
but will not promote a build to the live URL until you click Publish. It is a
second seatbelt underneath the branch protection.

---

## 6. Keep preview secrets out of production

This is where captcha work most often leaks. Preview uses Cloudflare's
always-pass test key; production must use the real widget. Scope them by deploy
context so a merge cannot carry the test key forward.

In Netlify → Site configuration → Environment variables, set values **per
context** rather than one shared value:

| Variable | Production | Deploy preview / branch deploy |
| --- | --- | --- |
| Turnstile site key | Real `Pravely authentication` widget key | Cloudflare test key |
| Supabase URL / publishable key | Production project | `security-preview` branch project |

For anything that lives in this repo instead of Netlify env vars, `netlify.toml`
supports the same split:

```toml
[context.production.environment]
  # real values

[context.deploy-preview.environment]
  # test values

[context.branch-deploy.environment]
  # test values
```

Two matching Cloudflare steps, from the September 9 status doc and still open:

- Create the real **Managed** Turnstile widget named `Pravely authentication`.
- Add `app.pravely.com`, `pravely.com`, and the Netlify preview hostnames to its
  hostname allowlist. Turnstile does not care that Squarespace holds the DNS.

The Turnstile **secret** goes only into Supabase Auth captcha settings. It never
goes into Netlify, this repo, chat, or a screenshot.

---

## 7. Link C — connect Claude to Netlify itself (optional)

This gives Claude the ability to read deploy status and build logs, and to manage
site settings and environment variables, so it can diagnose a failed preview
build without you pasting logs.

Netlify publishes an MCP server. Add it from **your own machine**, in the Claude
Code CLI:

```
claude mcp add --transport http netlify https://mcp.netlify.com/mcp
```

Then run `/mcp` inside Claude Code and complete the browser OAuth prompt against
your Netlify account.

Two caveats, stated plainly:

- I could not verify Netlify's current MCP documentation from this session
  because the sandbox blocks egress to `docs.netlify.com`. Confirm the exact
  command at https://docs.netlify.com/build/build-with-ai/netlify-mcp-server/
  before running it.
- The same egress block means this connector will not function from a
  Claude Code web session. It works in the local CLI and desktop app.

Grant this only after steps 2 through 6 are in place. It is a convenience, and
it carries real write access to your Netlify configuration.

---

## 8. What "automatic" should and should not mean

Write this down and hold to it. Recommended split:

**Claude does automatically, no approval:**

- Pull, branch, edit, commit, push on any branch cut from `preview`.
- Open pull requests into `preview`.
- Merge its own pull requests into `preview` once the Netlify preview build is
  green.
- Fix its own failing preview builds and push again.

**Claude never does without your explicit go-ahead in that session:**

- Merge anything into `main`.
- Push directly to `main` or `preview`.
- Force-push or rewrite history on any branch.
- Change Netlify production settings, production env vars, or publish a
  production deploy.
- Touch Supabase production, Stripe live mode, or any real secret.

Branch protection from step 3 enforces the first line of that second list
mechanically. The rest is instruction, so it belongs in a `CLAUDE.md` at the root
of each repo where Claude reads it automatically at the start of every session.

---

## 9. The working loop for captcha and security fixes

1. You describe the bug.
2. Claude pulls `preview`, cuts `claude/<short-name>`, makes the change, pushes.
3. Claude opens a pull request into `preview`.
4. Netlify builds `deploy-preview-N--pravelyapp.netlify.app`.
5. You test the captcha flow on that URL. Signup, login, forgot password.
6. Green and correct → Claude merges into `preview`. Red → Claude fixes and
   pushes again, no merge.
7. The `preview` branch deploy becomes your running integration environment.
8. At release, one pull request from `preview` into `main`, reviewed by you,
   approved by you, merged by you.

Note that this loop mostly runs in `itbb-creator/Pravely`, the app repo. Grant
access there first or the captcha work cannot proceed.

---

## 10. If something reaches production by mistake

1. Netlify → site → Deploys → find the last known-good production deploy →
   **Publish deploy**. This rolls the live site back in seconds without any git
   operation.
2. Then fix git: revert the merge commit on `main` with a pull request. Do not
   force-push `main`.
3. If a secret was exposed, rotate it at the source. A Cloudflare Turnstile
   secret is rotated in Cloudflare and re-entered in Supabase. Reverting the
   commit does not un-expose it.

---

## Setup checklist

- [ ] Confirm what the September 10 merge of #11 deployed to pravely.com
- [ ] Grant Claude GitHub access to `pravely.com` **and** `Pravely`
- [ ] Protect `main` in both repos, requiring your approval
- [ ] Create and protect a long-lived `preview` branch in both repos
- [ ] Set Netlify production branch, restrict branch deploys to `preview`
- [ ] Turn on deploy preview password protection for the app site
- [ ] Split Turnstile and Supabase values by deploy context
- [ ] Create the real Turnstile widget and hostname allowlist
- [ ] Add `CLAUDE.md` branch rules to both repos
- [ ] Optionally connect the Netlify MCP server from the local CLI
- [ ] Close or delete the stale `agent/*`, `arena/*` branches and PRs #6, #7, #8
