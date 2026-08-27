---
name: handover-sync
description: >-
  Regenerates and synchronizes HANDOVER.md, CHECKLIST.md, and STRUCTURE.md from the live repository state.
  Use when asked to sync the handover doc, refresh HANDOVER.md, regenerate the handover, update the cold-start doc, or verify live project metrics.
---

# Handover Sync — Festival Wishes India

Regenerate `/Users/varshajain/festival-wishes-india/HANDOVER.md` from the actual, live state of the repo, and patch matching facts into `CHECKLIST.md` (and `STRUCTURE.md` only if the file tree itself changed).

## Principles & Guardrails
- **Ground in live files:** Never fill in facts from memory or prior conversational turns. Every metric must be re-derived from disk during this run.
- **Token Efficiency:** Do not read whole 500-line files into context when checking or modifying a few facts. Use line ranges or targeted edits.
- **Single Source of Truth:** `HANDOVER.md` is the authoritative document. `PROGRESS.md` is retired; do not recreate it.
- **Secrets Safety:** Never output or commit credential values. Use secret names only (`~/.hermes/secrets/github-token`, `~/.hermes/secrets/cloudflare-token`).
- **Do Not Auto-Commit:** Report verified metrics and leave working tree uncommitted unless the user explicitly requested a commit.

---

## Step 1 — Verify Live State & CI

Run these commands from `/Users/varshajain/festival-wishes-india`:

```bash
git status && git log -1 && git log --oneline | wc -l && git rev-parse HEAD
npm run ci > /tmp/handover-sync-ci.log 2>&1; ci_status=$?
if [ $ci_status -eq 0 ]; then
  grep -E "✅|page\(s\) built|Checked .* references" /tmp/handover-sync-ci.log
else
  echo "CI FAILED (exit $ci_status) — full log:"; cat /tmp/handover-sync-ci.log
fi
```

If `npm run ci` fails, record the actual failure in `HANDOVER.md` §9/§10 instead of reporting it green.

---

## Step 2 — Re-derive Content & System Metrics

Run the combined inspection script:

```bash
node -e '
  const fs = require("fs");
  const path = require("path");
  
  // 1. Wish metrics
  const wishDir = "src/content/wish";
  const wishes = fs.readdirSync(wishDir).filter(f => f.endsWith(".json"));
  const rels = {}, status = {}, festivals = {};
  for (const f of wishes) {
    const w = JSON.parse(fs.readFileSync(path.join(wishDir, f), "utf8"));
    festivals[w.festival] = (festivals[w.festival] || 0) + 1;
    for (const r of w.relations || []) rels[r] = (rels[r] || 0) + 1;
    status[w.reviewStatus] = (status[w.reviewStatus] || 0) + 1;
  }
  
  // 2. Card count
  const cardFiles = [];
  ["rakhi", "diwali", "dussehra"].forEach(fest => {
    const dir = path.join("public/images", fest, "cards");
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).filter(f => f.endsWith(".webp")).forEach(f => cardFiles.push(path.join(fest, f)));
    }
  });

  console.log("=== LIVE METRICS ===");
  console.log("Total Wishes:", wishes.length);
  console.log("Per Festival:", festivals);
  console.log("Relations:", rels);
  console.log("Review Status:", status);
  console.log("Total Card Images:", cardFiles.length);
'
```

Cross-check `src/lib/cards.ts` to ensure every card image has a matching registry entry and vice versa.

---

## Step 3 — Update HANDOVER.md

Make targeted edits to `HANDOVER.md` for any changed metric:
1. **Header:** Update the prepared date.
2. **§2 (Implementation Status):** Update wish/card/page totals and live features.
3. **§8 (Current Git State):** Update HEAD SHA and commit count.
4. **§10 (Verification Checklist):** Update CI verification counts.
5. **§12 (Sign-off):** Update sign-off date and next actions.

---

## Step 4 — Synchronize CHECKLIST.md & STRUCTURE.md

- **`CHECKLIST.md`:** Update any changed task checkboxes or milestones.
- **`STRUCTURE.md`:** Touch **only** if files or directories were added, removed, or renamed. Do not touch for count-only updates.

---

## Step 5 — Report Summary

Summarize:
- Old values vs new values for all verified metrics.
- Result of `npm run ci`.
- Leave changes in the working tree uncommitted (or commit only if the user explicitly requested it).
