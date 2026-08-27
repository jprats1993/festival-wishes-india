---
name: handover-sync
description: This skill should be used when the user asks to "sync the handover doc", "refresh HANDOVER.md", "regenerate the handover", "run handover-sync", "update the cold-start doc", or wants HANDOVER.md and the secondary docs (STRUCTURE.md, PROGRESS.md, CHECKLIST.md) re-grounded in the live state of the Festival Wishes India repo. Manual-only: never invoke automatically.
argument-hint: [commit]
disable-model-invocation: true
allowed-tools: Read, Edit, Bash(git:*), Bash(npm:*), Bash(find:*), Bash(wc:*), Bash(ls:*), Glob, Grep
---

# Handover sync — Festival Wishes India

Regenerate `/Users/varshajain/festival-wishes-india/HANDOVER.md` from the actual, live state of the
repo, then patch matching facts into `STRUCTURE.md`, `PROGRESS.md`, and `CHECKLIST.md` so they don't
contradict it. This skill exists so a brand-new chat with zero prior context can run it and trust the
result — never fill in a fact from memory of a previous handover, from this conversation's earlier
turns, or from assumption. Every fact in the rewritten document must trace to a command run or a file
read during *this* invocation.

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

Do not trust old prose in HANDOVER.md, STRUCTURE.md, PROGRESS.md, or CHECKLIST.md for any of these —
re-check each one directly:

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
to either "none" (only after Step 4 patches are actually applied) or an explicit list of what's still
out of sync and why.

Do not remove §7's "NO TOKENS" warning or the credential-name-only convention. Do not add secret values
anywhere.

## Step 4 — Patch the secondary docs

STRUCTURE.md, PROGRESS.md, and CHECKLIST.md are explicitly superseded by HANDOVER.md but must stay
roughly in sync. Do **not** rewrite them wholesale — make targeted `Edit` calls that fix only the facts
that just changed:

- Wish count and relation distribution (STRUCTURE.md §2.5/§3.1, PROGRESS.md §6/§9, CHECKLIST.md content
  rows) wherever a stale number appears.
- Card count and filenames (STRUCTURE.md §6, PROGRESS.md, CHECKLIST.md).
- Analytics/ads status (STRUCTURE.md's `api/event` note, PROGRESS.md §9, CHECKLIST.md "Analytics &
  Monetization" section) — match whatever Step 2 found in the actual code, including if a mechanism was
  added, removed, or is still just a stub.
- Any file that HANDOVER.md's repo map (§4) shows as renamed/added/removed since these docs were last
  touched (e.g. a script or `agent-rules/` file that no longer exists).
- Git state lines that quote a specific HEAD SHA or commit count (PROGRESS.md §14, CHECKLIST.md if
  present).

Grep each doc for the specific stale value before editing (`grep -n "<old count>\|<old SHA>"
STRUCTURE.md PROGRESS.md CHECKLIST.md`) so the patch is surgical, not a rewrite. If a secondary doc
already agrees with the newly-verified facts, leave it untouched.

## Step 5 — Report, do not commit

Summarize what changed (old value → new value, per fact) and the `npm run ci` result. Leave the
working tree edited but **uncommitted** — committing is a separate, explicit, user-approved step and is
not this skill's job by default, matching this repo's convention of small standalone `docs: ...`
commits (confirmed via `git log`).

Only stage and commit if the user's invocation explicitly asked for it — i.e. `$ARGUMENTS` contains
`commit` (e.g. `/handover-sync commit`) or the user's own message alongside the invocation says to
commit. In that case, stage exactly the four docs that were touched (`git add HANDOVER.md STRUCTURE.md
PROGRESS.md CHECKLIST.md` — only the ones actually changed) and commit with a short `docs: ...` message
in the style of this repo's existing history (see `git log` for examples). Never push.

## Guardrails

- Never fabricate a fact. If something can't be verified this run (e.g. no network access to check
  `origin` ahead/behind), say so explicitly in the doc rather than silently repeating the old claim.
- Never commit or push unless explicitly asked at invocation time.
- Never write credentials, tokens, or secret values into any of these docs — names only.
- If `npm run ci` or any check fails, the doc must say so plainly; do not round a failure up to green.
