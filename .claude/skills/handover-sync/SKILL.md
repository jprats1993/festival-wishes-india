---
name: handover-sync
description: This skill should be used when the user asks to "sync the handover doc", "refresh HANDOVER.md", "regenerate the handover", "run handover-sync", "update the cold-start doc", or wants HANDOVER.md re-grounded in the live state of the Festival Wishes India repo, with matching facts patched into CHECKLIST.md (and STRUCTURE.md only if the repo's file layout itself changed). Manual-only: never invoke automatically.
argument-hint: [commit]
disable-model-invocation: true
allowed-tools: Read, Edit, Bash(git:*), Bash(npm:*), Bash(find:*), Bash(wc:*), Bash(ls:*), Glob, Grep
---

# Handover sync — Festival Wishes India

Regenerate `/Users/varshajain/festival-wishes-india/HANDOVER.md` from the actual, live state of the
repo, then patch matching facts into `CHECKLIST.md` so it doesn't contradict it. `STRUCTURE.md` is a
structural walkthrough (what files exist and what they do), not a fact tracker — touch it only when
Step 2's repo-map check finds files actually added, removed, or renamed, never for count/status
changes (wish/card counts, analytics status, git state — those live in HANDOVER.md alone). This skill
exists so a brand-new chat with zero prior context can run it and trust the result — never fill in a
fact from memory of a previous handover, from this conversation's earlier turns, or from assumption.
Every fact in the rewritten document must trace to a command run or a file read during *this*
invocation.

**`PROGRESS.md` was retired 2026-08-27** — it duplicated HANDOVER.md's exact "cold-start handover"
scope under a different name, and the two had already drifted out of sync more than once. Do not
recreate it and do not patch facts into it. If it has reappeared in the repo, that's a regression to
flag to the user, not a file to sync.

## Step 1 — Ground in live repo state

Run these from `/Users/varshajain/festival-wishes-india` and read every line of output before writing
anything:

```bash
git status
git log -1
git log --oneline | wc -l          # commit count
git rev-parse HEAD                 # full SHA
git log --oneline -20               # for the "features deployed by commit" trail
npm run ci                          # validate + build + check:links — must actually run, not be assumed
```

If `npm run ci` fails, do not report it as green. Record the actual failure in §9/§10 of HANDOVER.md
instead of silently reusing the last known-good status.

## Step 2 — Re-derive the facts HANDOVER.md depends on

Do not trust old prose in HANDOVER.md, STRUCTURE.md, or CHECKLIST.md for any of these — re-check each
one directly:

- **Wish count:** `find src/content/wish -name '*.json' | wc -l`, then read a sample to confirm
  `reviewStatus`/`reviewedBy`/`source` values and re-tally the relation distribution (grep `"relations"`
  or read files) — don't reuse last session's per-relation breakdown without recomputing it.
- **Card count:** `find public/images/rakhi/cards -name '*.webp' | wc -l`, and cross-check the filenames
  against `src/lib/cards.ts`'s registry (a card image with no matching `cards.ts` entry, or vice versa,
  is a defect to report in §9, not to paper over).
- **Analytics/ads wiring:** grep for real code, not prose — `grep -rn "api/event\|Web Analytics\|gtag\|PUBLIC_ADS_ENABLED" src/ public/` and read `src/components/AdSlot.astro` and `astro.config.mjs`. Report
  only what code actually does (e.g. if a previous session removed the `/api/event` stub, confirm it's
  gone, don't just carry the note forward).
- **Festival/collection coverage:** `find src/content/festival -name '*.json'` and diff against the
  `festival` enum in `src/content.config.ts`.
- **Package/build surface:** re-read `package.json` (`scripts`, `dependencies`, `engines`) and
  `astro.config.mjs` (site URL, integrations, sitemap filter logic) directly — don't assume they match
  what HANDOVER.md currently claims.
- **`agent-rules/` and `scripts/`:** `ls agent-rules/ scripts/` and confirm the file list HANDOVER.md
  §4/§5 names still matches reality (files renamed, added, or removed since the last sync are defects
  or updates to call out, not silent no-ops).
- **Known defects / open decisions:** re-verify each item currently listed in HANDOVER.md §9/§11 is
  still true (e.g. re-check `public/_redirects` content, re-check whether `humanReviewedSeed` flags were
  flipped) rather than copying the list forward unchanged.
- **Git state:** working-tree cleanliness (`git status --porcelain`), ahead/behind `origin/main`
  (`git status -sb` or `git rev-list --left-right --count origin/main...HEAD` if a remote is
  reachable), full + short HEAD SHA, and commit count all come from the Step 1 output, not from memory.

## Step 3 — Rewrite HANDOVER.md

Preserve the existing section structure exactly — do not invent a new outline:

- §1 Project identity
- §2 Implementation status (Complete / Fixed this session / Partially complete / Not started /
  Features deployed by commit / Known defects / Content coverage)
- §3 Architecture
- §4 Repository map
- §5 Content & editorial rules
- §6 Deployment procedure
- §7 Environment variables & permissions
- §8 Current Git state
- §9 Known issues & failed attempts
- §10 Verification checklist
- §11 Open decisions
- §12 Sign-off

Update the header block (prepared date, last-verified commit SHA + short SHA + subject, branch,
working-tree cleanliness, commit count) to match Step 1's output exactly. In §2, fold anything that was
listed as "Fixed this session (uncommitted)" in the previous version into "Complete" once `git status`
shows it's now committed, or leave it under a session dated to when it was actually made if still
dirty — never relabel a still-uncommitted change as complete. In §12, set "Prepared by" to whatever
session/agent identity is running this skill, "Date" to today, and "Known deviations from older docs"
to either "none" (only after Step 4's CHECKLIST.md patch is actually applied, and after confirming
STRUCTURE.md's file/dir descriptions still match reality) or an explicit list of what's still out of
sync and why.

Do not remove §7's "NO TOKENS" warning or the credential-name-only convention. Do not add secret values
anywhere.

## Step 4 — Patch CHECKLIST.md (and STRUCTURE.md only if structure changed)

CHECKLIST.md is explicitly superseded by HANDOVER.md but must stay roughly in sync, since it's an
actively-used owner/agent tracker. Do **not** rewrite it wholesale — make targeted `Edit` calls that
fix only the facts that just changed:

- Wish count and relation distribution, wherever a stale number appears in its content rows.
- Card count and filenames.
- Analytics/ads status (its "Analytics & Monetization" section) — match whatever Step 2 found in the
  actual code/dashboard state, including if a mechanism was added, removed, enabled, or is still just
  a stub.
- Git state lines that quote a specific HEAD SHA or commit count, if present.

Grep for the specific stale value before editing (`grep -n "<old count>\|<old SHA>" CHECKLIST.md`) so
the patch is surgical, not a rewrite. If it already agrees with the newly-verified facts, leave it
untouched.

**STRUCTURE.md** only needs a patch when Step 2's `agent-rules`/`scripts` check or HANDOVER.md's repo
map (§4) shows a file actually added, removed, or renamed since STRUCTURE.md was last touched — e.g. a
new component, a retired script, a renamed content folder. Do **not** patch it for count or status
facts (wish/card counts, analytics wiring, git state) — those belong in HANDOVER.md only, and
STRUCTURE.md's own header says as much. If nothing structural changed, leave it untouched entirely.

## Step 5 — Report, do not commit

Summarize what changed (old value → new value, per fact) and the `npm run ci` result. Leave the
working tree edited but **uncommitted** — committing is a separate, explicit, user-approved step and is
not this skill's job by default, matching this repo's convention of small standalone `docs: ...`
commits (confirmed via `git log`).

Only stage and commit if the user's invocation explicitly asked for it — i.e. `$ARGUMENTS` contains
`commit` (e.g. `/handover-sync commit`) or the user's own message alongside the invocation says to
commit. In that case, stage exactly the docs that were actually touched this run (`git add HANDOVER.md`
and, only if changed, `CHECKLIST.md` and/or `STRUCTURE.md`) and commit with a short `docs: ...` message
in the style of this repo's existing history (see `git log` for examples). Never push.

## Guardrails

- Never fabricate a fact. If something can't be verified this run (e.g. no network access to check
  `origin` ahead/behind), say so explicitly in the doc rather than silently repeating the old claim.
- Never commit or push unless explicitly asked at invocation time.
- Never write credentials, tokens, or secret values into any of these docs — names only.
- If `npm run ci` or any check fails, the doc must say so plainly; do not round a failure up to green.
- Do not recreate `PROGRESS.md` and do not patch facts into `STRUCTURE.md` beyond structural
  (file-existence) changes — that reintroduces the multi-doc drift this consolidation removed.
