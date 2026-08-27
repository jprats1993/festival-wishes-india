# Kickoff prompt — Festival Wishes India

> Copy-paste this into a brand-new chat/model/harness on this machine to resume the project with
> zero prior context. Keep this file itself in sync as the project's tooling changes — see the
> "keeping this current" note at the bottom.

```
You are resuming the "Festival Wishes India" project on THIS machine. You have
zero prior context — ground yourself in the on-disk files before touching anything.

1. Read the source-of-truth handover doc:
   /Users/varshajain/festival-wishes-india/HANDOVER.md
   It is the single authoritative doc — current facts (wish/card counts, git state,
   deploy status, analytics/SEO status) live there ONLY. Don't trust facts from:
     - CHECKLIST.md — a live owner/agent task tracker, kept in sync with HANDOVER.md,
       but HANDOVER.md wins on any conflict.
     - STRUCTURE.md — a structural walkthrough (what files exist, what they do) only.
       It is NOT kept in sync for counts/status, only for actual file/dir changes.
     - PROGRESS.md — retired 2026-08-27 (it duplicated HANDOVER.md; if you see it back
       in the repo, that's a regression, not a doc to trust).

2. Enter the repo and verify state — don't rely on any commit count or SHA quoted in
   this prompt or in older docs; it drifts. Check it live:
   cd /Users/varshajain/festival-wishes-india
   git status && git log -1 && git log --oneline | wc -l
   (GitHub: jprats1993/festival-wishes-india, branch `main`.)

3. If HANDOVER.md looks stale (its §8 HEAD SHA doesn't match `git log -1`, or
   it's been a while since "Prepared:"), refresh it before trusting its facts. The
   runbook for this is at:
   /Users/varshajain/festival-wishes-india/.claude/skills/handover-sync/SKILL.md
   It's plain markdown, not Claude-specific — any agent with shell + file-edit access
   can open it and follow Steps 1-5 directly. (In Claude Code specifically, it's also
   wired up as the `/handover-sync` skill, invokable by name.) It re-derives every
   fact from the live repo and patches CHECKLIST.md to match; only commits if asked.

4. Read the governance rules before generating or editing any content:
   /Users/varshajain/festival-wishes-india/agent-rules/
   (content-policy.md, editorial-style.md, festival-rules.md, festival-rules.yml,
   publish-checklist.md)

5. Secrets (NAMES ONLY — never echo, print, or commit values):
   ~/.hermes/secrets/github-token
   ~/.hermes/secrets/cloudflare-token

6. Goal: maintain and extend this multilingual (en / hi / hinglish) festival-greeting
   static site (Astro 7 + Tailwind v4, Cloudflare Pages, live at
   festivalwishesindia.com). Run `npm run ci` (validate + build + check:links) before
   any deploy. Next actions are in HANDOVER.md §12.
   NEVER deploy to production without explicit owner approval.
```

---

## Keeping this current

This prompt references live tooling (the `handover-sync` runbook, the doc set, the secrets paths) —
if any of those change, update this file in the same commit, the same way that runbook patches
`CHECKLIST.md` when facts drift. Specifically re-check this file whenever:
- A doc in the "don't trust" list (§1 above) is added, removed, or renamed.
- The `handover-sync` runbook is renamed, moved, or replaced.
- The secrets convention (`~/.hermes/secrets/...`) changes.

Deliberately **not** included here: a hardcoded commit count, HEAD SHA, or wish/card count — those
belong only in HANDOVER.md, which is designed to be re-derived every sync. Baking a number into this
prompt just recreates the multi-doc drift problem the `handover-sync` runbook exists to prevent.
