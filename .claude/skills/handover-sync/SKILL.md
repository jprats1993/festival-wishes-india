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

**Token budget — this skill runs long, so be deliberate about what enters context:**
- Never `cat`/`Read` a whole file to change a few facts. Find the exact line with `grep -n` first,
  then `Read` only a small window around it (`offset`/`limit`), then `Edit`. This applies to
  HANDOVER.md (§3) and CHECKLIST.md (§4) alike — a 400-line full read to fix one commit SHA is waste.
  Only read a section in full when its structure itself is changing (e.g. adding a new "Fixed this
  session" entry with several bullets).
- Silence verbose command output — you need the pass/fail signal, not every line. See Step 1 for the
  `npm run ci` pattern; apply the same instinct elsewhere (pipe through `grep`/`tail`, don't dump raw).
- Combine independent read-only checks into one Bash call with `&&`/`;`/heredoc instead of one tool
  call per command — cuts round-trip overhead, not just output volume.
- Run `npm run ci` exactly once per invocation (Step 1). Never re-run it "to double check" — if you
  need to confirm a build-affecting edit didn't break anything, that's a sign the edit belonged in a
  real code change, not a docs sync.

## Step 1 — Ground in live repo state

Run these from `/Users/varshajain/festival-wishes-india`, read every line of output before writing
anything, but keep the `npm run ci` output itself small — it's the single biggest token cost in this
skill (Astro's build step prints one line per generated route, 40+ lines of pure noise on a healthy
build):

```bash
git status && git log -1 && git log --oneline | wc -l && git rev-parse HEAD && git log --oneline -20
npm run ci > /tmp/handover-sync-ci.log 2>&1; ci_status=$?
if [ $ci_status -eq 0 ]; then
  grep -E "✅|page\(s\) built|Checked .* references" /tmp/handover-sync-ci.log
else
  echo "CI FAILED (exit $ci_status) — full log:"; cat /tmp/handover-sync-ci.log
fi
```

The first line covers git status/log/count/SHA/trail in one call. The second block runs `npm run ci`
(validate + build + check:links) exactly once, but only surfaces the summary lines on success —
`✅ Content valid`, `43 page(s) built`, `Checked N references` / `✅ No dead links` — instead of the
full per-route build listing. On failure it dumps the whole log, because then you need the detail.

If `npm run ci` fails, do not report it as green. Record the actual failure in §9/§10 of HANDOVER.md
instead of silently reusing the last known-good status.

## Step 2 — Re-derive the facts HANDOVER.md depends on

Do not trust old prose in HANDOVER.md, STRUCTURE.md, or CHECKLIST.md for any of these — re-check each
one directly:

- **Wish count + relation distribution + review status, in one pass:** don't loop a `node -e` per file
  (that's 51+ process spawns for one fact) and don't grep `-A3` around `"relations"` (it bleeds into
  neighboring fields and produces a wrong tally — this happened once already). Instead read every wish
  file's JSON in a single script, e.g.:
  ```bash
  node -e '
    const fs=require("fs");
    const dir="src/content/wish";
    const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json"));
    const rel={}, status={};
    for (const f of files) {
      const w=JSON.parse(fs.readFileSync(dir+"/"+f));
      for (const r of w.relations) rel[r]=(rel[r]||0)+1;
      status[w.reviewStatus]=(status[w.reviewStatus]||0)+1;
    }
    console.log("total:", files.length);
    console.log("relations:", rel);
    console.log("reviewStatus:", status);
  '
  ```
  One process, one compact output block, no stale per-relation breakdown carried forward.
- **Card count:** `find public/images/rakhi/cards -name '*.webp' | wc -l`, and cross-check the filenames
  against `src/lib/cards.ts`'s registry (a card image with no matching `cards.ts` entry, or vice versa,
  is a defect to report in §9, not to paper over).
- **Analytics/ads wiring:** grep for real code, not prose — `grep -rn "api/event\|Web Analytics\|gtag\|PUBLIC_ADS_ENABLED" src/ public/` and read `src/components/AdSlot.astro` and `astro.config.mjs`. Report
  only what code actually does (e.g. if a previous session removed the `/api/event` stub, confirm it's
  gone, don't just carry the note forward).
- **Festival/collection coverage:** `find src/content/festival -name '*.json'` and diff against the
  `festival` enum in `src/content.config.ts`.
- **Package/build surface:** `grep -n "\"scripts\"\|\"dependencies\"\|\"engines\"" -A6 package.json`
  and a targeted read of `astro.config.mjs` (site URL, integrations, sitemap filter logic) — don't
  assume they match what HANDOVER.md currently claims, but don't full-`Read` package.json for this
  either.
- **`agent-rules/` and `scripts/`:** `ls agent-rules/ scripts/` and confirm the file list HANDOVER.md
  §4/§5 names still matches reality (files renamed, added, or removed since the last sync are defects
  or updates to call out, not silent no-ops).
- **Known defects / open decisions:** re-verify each item currently listed in HANDOVER.md §9/§11 is
  still true (e.g. re-check `public/_redirects` content, re-check whether `humanReviewedSeed` flags were
  flipped) rather than copying the list forward unchanged.
- **Git state:** working-tree cleanliness, ahead/behind `origin/main` (`git status -sb`, or
  `git rev-list --left-right --count origin/main...HEAD` if a remote is reachable), full + short HEAD
  SHA, and commit count all come from **Step 1's output** — don't re-run any of those commands here.

Where practical, run these checks in one combined Bash call (`&&`/`;`-chained or a single heredoc)
instead of one tool call per bullet — same information, fewer round trips.

## Step 3 — Update HANDOVER.md with targeted edits, not a full rewrite

**Do not `Read` the entire 400+-line file to patch a handful of facts.** For each fact from Step 2
that changed, `grep -n "<old value>" HANDOVER.md` to find its line(s), `Read` a small window
(`offset`/`limit`) around each hit, then `Edit` just that spot — the same surgical pattern Step 4 uses
for CHECKLIST.md. A full `Read` of HANDOVER.md is only justified when a section's structure itself
needs to change (a new "Fixed this session" entry with multiple new bullets, a new Known Issue, a
reordered list) — and even then, read only the section(s) actually changing, not the whole document.

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
