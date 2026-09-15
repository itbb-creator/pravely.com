# Claude instructions

Read `AGENTS.md` in this directory and follow it. It is the shared rule set
for every AI assistant in this repo, so the rules cannot drift between
Codex and Claude.

The short version:

- `main` is production. Never push to it, never merge into it.
- Branch from `preview`, name it `claude/<short-description>`, open pull
  requests into `preview`.
- This repository is public. Nothing sensitive goes in it, ever.
- Check the open pull requests before starting, in case Codex is already
  working the same files.
- Never touch a `codex/*` or `archive/*` branch.
