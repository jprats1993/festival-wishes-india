# Festival Wishes India — HANDOVER

> **Cold-start handover.** A fresh chat/model/harness on THIS SAME MACHINE should be able to
> resume the project from this document alone, with zero prior context. For a copy-paste prompt
> that bootstraps exactly that, see **`KICKOFF_PROMPT.md`** — keep it in sync with this file if
> the doc set or tooling it references ever changes.
>
> **Prepared:** 2026-08-27 (IST) · working tree clean, in sync with `origin/main`. Exact HEAD SHA,
> branch, and commit count are **not restated here** — see §8 for the single canonical record (this
> doc used to repeat that SHA in three places; git log/status are authoritative for history, this doc
> isn't). The `5e95b92` site fixes are **deployed to production** as of 2026-08-27 (verified via
> `curl` — see §6/§9); commits since then are docs-only, no new site deploy required.
>
> This document is grounded in the actual on-disk repo (git log/status, file tree, content
> collections, `package.json`, `astro.config.mjs`, `agent-rules/`, `scripts/`, and a live
> `npm run ci` run). It is the **sole authoritative cold-start doc** — the previously-duplicate
> `PROGRESS.md` was retired 2026-08-27 (it restated this document's exact scope under the same
> "cold-start handover" framing). `STRUCTURE.md` remains as a structural repo walkthrough (file/dir
> purposes) but is no longer kept in fact-lockstep with this doc — see §12.

---

## §1 — Project identity

| Field | Value |
|---|---|
| Name | **Festival Wishes India** |
| Purpose | Multilingual (Hindi / English / Hinglish) festival-greeting wishes + shareable image cards, ready to copy or forward on WhatsApp/status. Flagship festival: **Raksha Bandhan (Rakhi)**. |
| Local repo path | `/Users/varshajain/festival-wishes-india` |
| GitHub | https://github.com/jprats1993/festival-wishes-india (owner `jprats1993`) |
| Branch | `main` (see §8 for HEAD SHA/commit count — not restated here) |
| Primary domain | **https://festivalwishesindia.com** (canonical; `site` in `astro.config.mjs`) |
| Redirect domain | **rakhiwishes.in** → 301 → `https://festivalwishesindia.com/en/rakhi/` |
| Pages preview URL pattern | `https://<branch-or-hash>.festival-wishes-india.pages.dev` (Cloudflare Pages project `festival-wishes-india`) |

---

## §2 — Implementation status

### ✅ Complete (live / verified)
- **Astro 7 static site, live** at `festivalwishesindia.com` (deployed 2026-08-26 evening).
- **51 Rakhi wishes**, each in `en` + `hi` (Devanagari) + `hinglish` (Roman). All 51 are
  `reviewStatus: "approved"`, `reviewedBy: "reviewer-agent"`, `source: "original"`.
- **9 card images** (WebP) in `public/images/rakhi/cards/`: `rakhi-en-1/2/3`,
  `rakhi-hi-1/2/3`, `rakhi-hinglish-3/4/5`. (Single-language cards only; cards are decoupled
  from wish JSONs and driven by the `src/lib/cards.ts` registry — confirmed 1:1, all 9 files have a
  matching `cards.ts` entry and vice versa. The original `hinglish-1/2` cards were retired 2026-08-27
  in favor of the better-aligned `hinglish-3/4/5` set — see below.)
- **Tabbed wish listing** on the festival hub: "All wishes (51)" / "Popular (12)" / relation tabs,
  with per-card `#n` numbering.
- **CI pipeline** — `npm run ci` = `validate` + `build` + `check:links`. **Verified green** today:
  51 wish + 1 festival valid → 43 static pages built → 635 references, 0 dead links/missing assets.
- **Share / copy / download buttons** (`ShareBar.astro`): icon+label Copy (with `execCommand` fallback),
  Download, native Share (hidden on desktop where Web Share is unavailable), WhatsApp `wa.me` fallback.
- **Redirects**: `rakhiwishes.in` → `/en/rakhi/` 301 (zone-level rule, verified via `curl -I`);
  root `/` → `/en/` (Astro meta-refresh page).
- **Cache headers** (`public/_headers`, commit `e80aaa1`): HTML `max-age=0, must-revalidate`;
  `/_astro/*` immutable 1y; `/images/*` 1d.
- **Trust/compliance pages** (`/en|hi|hinglish/about|contact|privacy|disclaimer`), AI-assist
  disclosure in footer, sitemap (`sitemap-index.xml`), `robots.txt`, OG image, hreflang + canonical.
- **Search Console**: property verified for `festivalwishesindia.com` — confirmed live via DNS
  `google-site-verification` TXT record (2026-08-27; verification is DNS-based, not a meta tag, so
  it's invisible in page source). Sitemap submitted in GSC (owner-confirmed 2026-08-27).
- **Cloudflare Web Analytics**: enabled via the Cloudflare dashboard's **automatic** zone-level
  toggle (owner-confirmed 2026-08-27). This mode collects RUM at the edge with no JS beacon injected
  into the page — checked `/en/`, `/en/rakhi/`, `/hi/rakhi/` live HTML and confirmed no
  `cloudflareinsights.com` script is present, which is expected/correct for automatic mode, not a
  defect. Not independently verifiable via curl/DNS; taken on owner's word.
- **Fixed 2026-08-27, commit `5e95b92` (deployed to production):**
  - Collection subpages (`/[locale]/[festival]/[collection].astro`, e.g. `/hinglish/rakhi/friend-wishes/`)
    had **no tab navigation at all** — only the festival hub page (`[festival]/index.astro`) had the
    relation-tab bar. Added the same tab bar (relation tabs + `short-wishes`/`whatsapp-messages` +
    an "All" link back to the hub) to the collection page, with the active category highlighted.
    Applies to all 8 collection slugs × all 3 locales (verified 200 OK on every combination).
  - Festival names did not follow the language switcher — `festival.data.displayName` was a single
    locale-agnostic string ("Raksha Bandhan"), used verbatim even mid-sentence in Hindi copy (e.g.
    "Raksha Bandhan की शुभकामनाएँ"). Added an optional per-locale `displayNames: {en, hi, hinglish}`
    field to the festival schema (`src/content.config.ts`), populated it for `rakhi` (`hi`: "रक्षा
    बंधन"), and added a `festivalName(festival, locale)` helper in `src/lib/i18n.ts`, swapped into
    all 31 prior usages of `festival.data.displayName` across the home, hub, and collection pages.
    `displayName` itself is kept as the English fallback for any future festival not yet translated.
- **Fixed 2026-08-27, commit `b96f1dc` (deployed to production):**
  - Removed the dead `src/pages/api/event.ts` analytics stub and the client-side `fetch('/api/event', …)`
    calls in `ShareBar.astro`. On a static (non-SSR) Cloudflare Pages deploy a POST-only route can't
    actually be served, so every call was silently 404-ing — no analytics were ever really recorded.
  - Fixed the sitemap `filter` in `astro.config.mjs`: it used to match literal `/thin-`/`/search`
    substrings that don't exist anywhere in this site's URLs, so thin/`noindex` collection pages (e.g.
    `parent-wishes`) still shipped in `sitemap-0.xml`. It now recomputes the same threshold the page
    itself uses (`NOINDEX_THRESHOLD` in `src/lib/collections.ts`) and excludes them for real.
  - `short-wishes` and `whatsapp-messages` were unfiltered — both rendered all 51 wishes, identical to
    the "All wishes" tab. They now filter on `tones: ["short"]` and `formats: ["status"]`
    respectively, via new `collectionToneMap`/`collectionFormatMap` in `collections.ts`.
  - Native share cancel (`AbortError` from closing the OS share sheet) no longer force-opens a WhatsApp
    fallback popup in `ShareBar.astro` — only a real share failure does.
  - Wish `#n` numbering is now globally consistent: relation-tab collection pages show the badge
    (previously missing entirely), and the hub's "Popular" tab shows each wish's real position in the
    full list instead of its position within the small popular subset.
  - `og:image`/`twitter:image` now point to a real PNG (`public/og-default.png`, rasterized from the
    existing `og-default.svg` via `sharp`) instead of an SVG — WhatsApp/Facebook/X link-preview
    scrapers generally don't render SVG for these tags, so shared links likely had no thumbnail before.
    The previously dead `image` prop on `BaseLayout.astro` is now actually wired through.
  - Retired the 2 older Hinglish card images (`rakhi-hinglish-1/2.webp`) and their `cards.ts`/
    `card-specs.json` entries, keeping the 3 newer, alignment-verified ones (`hinglish-3/4/5`).

### 🟡 Partially complete
- **Card ↔ wish coupling**: schema has `imageAssets`/`altText` on wishes, but no wish file uses
  them — cards live independently in `cards.ts` (intentional).
- **`public/_redirects`**: still the stale blanket-splat rule (`rakhiwishes.in/* →
  festivalwishesindia.com/:splat`). Superseded by the real zone-level redirect; should be deleted
  or realigned (see §9).

### ⛔ Not started
- **AdSense** application/approval (no ads live; `PUBLIC_ADS_ENABLED` unset → house-promo shown).
- **Amazon Associates** (Diwali gift guides).
- **Diwali / Holi / Dussehra / Navratri** content (schema enums exist; zero content files).
- **Git-integrated auto-deploy** (connecting Cloudflare Pages to the GitHub repo) — still CLI-only.

### Known defects
1. `public/_redirects` is stale (blanket splat) — cosmetic/confusing but not harmful (governed at zone level).
2. Root `/` redirect is a **meta-refresh (HTTP 200)**, not a true 301 (Astro SSG limitation).
3. `npm run check` (i.e. `astro check`) is **not wired** — it prompts to install `@astrojs/check`
   + `typescript`, which are absent from `package.json` (see §9).
4. `humanReviewedSeed: false` on all 51 wishes, even though owner seed approval was recorded in
   `CHECKLIST.md`/`fa9cdd4` — flags not flipped (open question, §11).
5. `[locale]/privacy.astro` still says "We also log anonymous share/copy/download events via a
   serverless endpoint" — that endpoint (`/api/event`) was removed in `b96f1dc`; the copy was never
   updated to match. Found this sync (2026-08-27) while re-checking analytics wiring; not yet fixed.

### Content coverage (festival × language)
- **Festivals:** `rakhi` only (1 festival file). No Diwali/Holi/Dussehra/Navratri content yet.
- **Languages:** every wish carries `en`, `hi`, `hinglish`; `hi` is Devanagari (verified 51/51).
- **Relation distribution (51):** brother **19** · sister **13** · bhaiya-bhabhi **7** · family **7** ·
  friend **3** · parent **2**.
- **Cards (9):** English 3 · Hindi 3 · Hinglish 3. Cards are single-language, never mixed-script.

---

## §3 — Architecture

- **Stack:** Astro 7 (`^7.2.7`) fully-static SSG + **Tailwind CSS v4** (Vite plugin `@tailwindcss/vite`,
  CSS-first in `src/styles/global.css`; **no `tailwind.config`**) + Zod schemas + `sharp` (image) +
  `@astrojs/sitemap`. No UI framework — plain `.astro` components.
- **Node:** `>=22.12.0` (this machine runs v26.7.0). Package manager: **npm**.
- **Build commands** (`package.json`): `dev`, `build`, `preview`, `astro`, `check`, `validate`,
  `check:links`, `ci` (= validate → build → check:links).
- **Hosting:** Cloudflare Pages, project **`festival-wishes-india`**; DNS on Cloudflare.
- **Repo → deploy connection:** **manual `wrangler` CLI** (v4.126.0), **no `wrangler.toml`**,
  **NOT git-integrated**. Deploy = `wrangler pages deploy dist --project-name festival-wishes-india`.
- **Content collections:** `src/content/wish/*.json` + `src/content/festival/*.json`, both loaded via
  **explicit `glob()` loaders** (`src/content.config.ts`) — required in Astro 7.
- **Localization:** locales `en | hi | hinglish`; BCP-47 `hinglish → hi-Latn`; `prefixDefaultLocale: true`
  so every route is `/[locale]/[festival]/[collection]/`.
- **Analytics:** Cloudflare Web Analytics, enabled via the dashboard's automatic zone-level toggle
  (owner-confirmed 2026-08-27) — no code/beacon in the page, RUM is collected at the edge. The former
  cookieless `POST /api/event` stub was removed in `b96f1dc` (2026-08-27) — it 404'd on every call on
  this static, non-SSR Cloudflare Pages deploy, so no analytics were ever actually recorded through it.
- **Image storage:** `public/images/rakhi/cards/*.webp`; generated via **SVG → headless render → WebP**
  (text-to-image garbles Devanagari — see §9).

---

## §4 — Repository map

### `src/pages/`
| File | Route | Purpose |
|---|---|---|
| `index.astro` | `/` | 301 meta-refresh → `/en/` |
| `[locale]/index.astro` | `/en/`, `/hi/`, `/hinglish/` | Locale home / festival picker |
| `[locale]/[festival]/index.astro` | `/en/rakhi/` … | Festival hub: card gallery + tabbed wish listing |
| `[locale]/[festival]/[collection].astro` | `/en/rakhi/brother-wishes/` … | Relation-filtered collection page (`noindex` when <3 results) |
| `[locale]/{about,contact,privacy,disclaimer}.astro` | trust pages | Legal/info pages, per-locale copy |
| `robots.txt.ts` | `/robots.txt` | `User-agent: *` + sitemap pointer |

### `src/components/`
`WishCard.astro` (wish `<blockquote>` + `#n` + embedded `ShareBar`) · `ShareBar.astro` (copy/download/
share/WhatsApp client JS; no analytics tracking — the `/api/event` call was removed in `b96f1dc`) ·
`LanguageSwitcher.astro` (EN / हिन्दी / Hinglish pills) · `AdSlot.astro` (house-promo unless
`PUBLIC_ADS_ENABLED=true`).

### `src/layouts/`
`BaseLayout.astro` — the single page shell: `<html lang>`, head meta (title/description/canonical/
hreflang/OG/Twitter/favicon), header + language switcher, `<main>`, footer with trust links + AI
disclosure + editorial-policy link.

### `src/content/`
`wish/*.json` (51 wishes, `rakhi-<relation>-<NNN>.json`) · `festival/rakhi.json` (Rakhi festival config).

### `src/lib/`
`i18n.ts` (locales/labels/BCP-47) · `collections.ts` (`collectionMap`: collection slug → relation
values; empty-array slugs are non-filtering) · `cards.ts` (9-card registry) · `popular.ts` (12 curated
popular IDs).

### `public/`
`_headers` (cache policy) · `_redirects` (⚠️ stale) · `favicon.ico`/`favicon.svg` · `og-default.svg` ·
`og-default.png` (rasterized OG image, added `b96f1dc`) · `images/rakhi/cards/*.webp` (9 cards).

### `agent-rules/`
Governance source of truth — `content-policy.md`, `editorial-style.md`, `festival-rules.md`,
`festival-rules.yml`, `publish-checklist.md` (see §5).

### `scripts/`
`validate-content.mjs` (`npm run validate`) · `check-links.mjs` (`npm run check:links`) ·
`generate-hinglish-cards.mjs` · `card-specs.json` · `card-wish-ids.json` · `wish-assignments.json`
(authoring-time inputs only, not consumed at build).

### ⚠️ Sensitive / high-signal files — read before touching
`agent-rules/*` (governance) · `src/content.config.ts` (schemas — changing a field breaks every JSON) ·
`public/_headers` & `public/_redirects` (Cloudflare behavior) · `src/lib/cards.ts` & `src/lib/collections.ts`
(card registry + route filter map — must stay in sync with content).

---

## §5 — Content & editorial rules

**Source of truth = the `agent-rules/` directory** (absolute paths):
- `/Users/varshajain/festival-wishes-india/agent-rules/content-policy.md`
- `/Users/varshajain/festival-wishes-india/agent-rules/editorial-style.md`
- `/Users/varshajain/festival-wishes-india/agent-rules/festival-rules.md`
- `/Users/varshajain/festival-wishes-india/agent-rules/festival-rules.yml`
- `/Users/varshajain/festival-wishes-india/agent-rules/publish-checklist.md`

**Locales:** `en` (English), `hi` (Devanagari), `hinglish` (Roman-script Hindi; `hi-Latn`). One primary
language per page; do not mix scripts inside a single sentence.

**URL conventions:** always locale-prefixed — `/{locale}/{festival}/` and
`/{locale}/{festival}/{collection}/`. Collection slugs from `src/lib/collections.ts`: `short-wishes`,
`brother-wishes`, `sister-wishes`, `bhaiya-bhabhi-wishes`, `whatsapp-messages`, `family-wishes`,
`friend-wishes`, `parent-wishes`.

**Festival slug convention:** `rakhi`, `diwali`, `holi`, `dussehra`, `navratri` (enum in
`content.config.ts`).

**Wish schema** (`src/content.config.ts`): `id` (`/^[a-z0-9-]+$/`), `festival` (enum), `languages`
`{en,hi,hinglish}` each 5–500 chars, `relations` (enum array), `tones` (default `["warm"]`),
`formats` (default `["whatsapp"]`), `imageAssets{square?,portrait?}`, `altText`, `source` (literal
`"original"`), `reviewStatus` (`pending|approved|rejected`), `reviewedBy` (`reviewer-agent|owner`),
`humanReviewedSeed` (bool).

**Required metadata:** `source: "original"`, `reviewStatus` present, all three languages present and
non-trivial. Festival files additionally need `date`, `dateSourceUrl`, `dateVerifiedAt`,
`dateVerifiedBy`, `isSmokeTest`.

**Hindi/Hinglish rules:** natural contemporary Hindi (not over-Sanskritised); respectful `आप` for
elders; consistent Hinglish spellings; preserve meaning (not word-for-word translation).

**Copyright:** original content only — no scraped Pinterest/Google Images/greeting sites, no copied
poems/quotes/lyrics/forwards. **Duplicate-content policy:** publication gate rejects near-duplicates,
keyword-stuffed lists, and synonym-variations of the same wish.

**Image licensing:** generated or original artwork only, with an asset record; image text must exactly
match approved text; high-contrast readable Devanagari.

**Review + publish gate:** reviewer-agent audits every batch; a new festival's **first seed batch
requires explicit owner approval**; 42-day publish lead time (waived for `isSmokeTest: true`, e.g.
Rakhi 2026). Full gate = `agent-rules/publish-checklist.md`.

---

## §6 — Deployment procedure

> **NO TOKENS in this document.** Only secret *names* are stated (§7). Never commit credentials to
> git remotes, source files, or Markdown.

```bash
cd /Users/varshajain/festival-wishes-india
npm install                      # first time (Node >=22.12.0)
npm run ci                       # validate + build + check:links  ← MUST be green before deploy
```

- **Build:** `npm run build` → `dist/` (43 static pages).
- **Local preview:** `npm run preview -- --port 4321` (background) → `http://localhost:4321/`.
- **Preview deploy (branch alias):**
  `CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" wrangler pages deploy dist --project-name festival-wishes-india --branch <name>`
  → publishes `https://<name>.festival-wishes-india.pages.dev`.
- **Production deploy (custom domain):**
  same command **without `--branch`** → publishes `festival-wishes-india.pages.dev` +
  `https://festivalwishesindia.com`.
- **Custom domains:** `festivalwishesindia.com` (Cloudflare Registrar) attached to the Pages project;
  `rakhiwishes.in` (Spaceship registrar, Cloudflare nameservers) is a **separate zone**.
- **Redirects:** `rakhiwishes.in → /en/rakhi/` 301 is a **zone-level rule on the rakhiwishes.in zone**
  (NOT the repo `_redirects` — that file is stale). Zone IDs: fwi `51652f6727f5fac666bfcaca52201f90`,
  rwi `827ace09edab57f8b3ffc6658694c491`.
- **Rollback:** re-deploy the previous commit's `dist` (`git checkout <sha> && npm run ci && wrangler
  pages deploy …`) — Pages serves the last successful upload, so redeploying an older build restores it.
- **Logs:** Cloudflare Pages dashboard → Deployments (per-deploy logs). Local build logs come from
  `npm run ci`.

---

## §7 — Environment variables & permissions

Secrets live on this machine under `~/.hermes/secrets/` (never in the repo, no `.env` committed).
Owner of all credentials: **Prateek Jain** (`jprats1993`).

| Var | Purpose | Permission scope | Storage | Rotation |
|---|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `wrangler pages deploy` auth | **Cloudflare Pages — Edit** (project `festival-wishes-india`; zone-scoped if you also manage DNS) | `~/.hermes/secrets/cloudflare-token` | Cloudflare dashboard → My Profile → API Tokens → Roll/revoke, then rewrite the secret file |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy target account | n/a (identifier, not a secret) | `0ce865a7040b3f3b8ddf2ff1a2bf6afb` (in docs) | n/a |
| `CLOUDFLARE_PROJECT_NAME` | Pages project target | n/a | `festival-wishes-india` (flag value) | n/a |
| `GITHUB_TOKEN` | `git push` / `gh` auth | `repo` scope (read/write to `jprats1993/festival-wishes-india`) | `~/.hermes/secrets/github-token` | GitHub → Settings → Developer settings → Personal access tokens → revoke/regenerate |
| `PUBLIC_SITE_URL` | Documented config knob | n/a | **Not currently consumed** — `site` is hardcoded in `astro.config.mjs` | n/a |
| `PUBLIC_ADS_ENABLED` | **Only runtime var actually read** (`AdSlot.astro`); `"true"` shows ad placeholder | n/a | unset today (ads off) | set in Pages env when ads go live |

**⚠️ Never** put credentials in git remotes, source files, or Markdown. (The `origin` remote is
currently clean — a PAT was embedded in an earlier state and has since been removed; see §8.)

---

## §8 — Current Git state

- **Branch:** `main`; **up to date with `origin/main`** (no unpushed commits, `git status -sb`
  confirms `## main...origin/main` with no ahead/behind markers).
- **HEAD:** `73a6389eaab9b418905274d0fbe0029eb0ee1fa2` (`73a6389` "docs: log 5e95b92 deploy in
  deployment-notes.md").
- **Remote:** `https://github.com/jprats1993/festival-wishes-india.git` (fetch + push) — **clean URL,
  no embedded token**.
- **Commit count:** 41.
- **Uncommitted changes:** none (`git status` clean at time of this sync, before this skill's own edits).
- **History rewritten:** all commits are authored `Prateek Jain <jprats1993@outlook.com>`; the GitHub
  user is `jprats1993`. Don't be surprised by the author/remote-user mismatch.
- **Why "Last verified commit" always ends up one commit behind right after you commit this file:**
  this header bakes in an *exact* SHA for traceability. A commit's hash doesn't exist until after its
  content (including this file) is finalized, so the file can never contain its own commit's SHA —
  the instant a HANDOVER.md sync is committed, that commit becomes the new HEAD, and this field is by
  construction describing the commit *before* it. This is a fixed, self-correcting one-commit lag, not
  drift — the next sync fixes it, and creates a new one-commit lag of its own. Not a bug, not worth
  chasing away (it would mean either dropping exact-SHA traceability or having this skill auto-commit,
  both worse trade-offs than a cosmetic off-by-one).
- `CLAUDE.md` is a symlink → `AGENTS.md` (confirmed via `ls -la`).

---

## §9 — Known issues & failed attempts

1. **OpenCode Go 429/503 quota errors** — long single subagents get dropped. **Fix:** split work into
   **short, parallel subagents** (one per language or relation ~10–25 items; one per ~2 card images).
2. **Astro 7 `glob()` loader pitfall** — the *default* loader silently returned **empty collections**
   (site built with zero wishes, no errors). **Always** use `loader: glob({ pattern, base })` (fixed in
   `e2c8c22`; see `src/content.config.ts`).
3. **`astro check` missing deps** — `npm run check` is interactive and prompts to install
   `@astrojs/check` + `typescript`, neither of which is in `package.json`. The CI gate therefore uses
   `validate + build + check:links` (no type-check). Either add the deps or keep `check` out of CI.
4. **`image_generate` garbles Devanagari** — text-to-image mangles Hindi text. **Fix:** build **SVG
   cards → headless Chrome/WebKit render → Pillow/sharp → WebP** (`scripts/generate-hinglish-cards.mjs`).
5. **Interrupted subagents** leave partial artifacts (half-written card/wish JSONs). Recover by
   re-running `npm run validate` and re-generating only the missing items — never assume a batch is
   complete without validating.
6. **Caching** — mobile browsers served stale content; fixed by adding `public/_headers` (`e80aaa1`).
   If you change HTML and don't see it live, check the cache headers + do a hard reload.
7. **Multiple checkouts** — the repo has been worked on by several agent sessions; docs can drift.
   Trust `git log`/`git status`/live `npm run ci` output over prose in older `.md` files.
8. **NOT A BUG: ad-blockers hide the WhatsApp button.** Investigated 2026-08-27 after a report of the
   WhatsApp button "missing" on production. Confirmed via live DOM inspection that `ShareBar.astro`'s
   WhatsApp `<a>` renders correctly with no site-side CSS/JS hiding it — swapping its `href` away from
   `wa.me` on the live page instantly un-hid it, proving a browser-side cosmetic filter (confirmed:
   AdGuard) hides any link matching `wa.me`, not a site defect. This may be the same root cause as the
   still-open "Firefox Focus renders differently than Samsung Internet" report (§11) — Firefox Focus's
   built-in tracking protection is known to interfere with `wa.me` deep links similarly. Do not attempt
   to "fix" the WhatsApp button in code based on a single-browser report; ask whether an ad-blocker or
   privacy extension is active first.
9. **OPEN, unreproduced: mobile view reportedly differs between Firefox Focus and Samsung Internet on
   Android.** Reported 2026-08-27; not yet investigated (owner asked to defer). Leading hypotheses if
   picked up later: (a) Tailwind v4 compiles its palette to `oklch()` color values — confirmed present
   in the compiled CSS (`dist/_astro/*.css`) — which could render differently on an older/lagging
   Gecko build; (b) `BaseLayout.astro`'s `<ClientRouter />` (Astro View Transitions) natively supported
   in Chromium (Samsung Internet) but falling back to simulated `animate` mode in Firefox-based engines,
   which can cause flashing/scroll-jump differences; (c) per defect #8 above, Firefox Focus's tracking
   protection interfering with something client-side. Ask what specifically differs (colors, layout,
   navigation) before guessing further — see the conversation this was raised in for context.

---

## §10 — Verification checklist

Run/confirm these before signing off or deploying:

- [x] `npm run ci` (re-run today: ✅ validate 51 wish + 1 festival → build 43 pages → 635 refs, 0 dead)
- [x] `npm run validate` (✅ Content valid)
- [x] `npm run build` (✅ 43 pages, static)
- [x] `npm run check:links` (✅ no dead links)
- [ ] `npm run check` (`astro check`) — **NOT wired** (needs `@astrojs/check` + `typescript`; see §9.3)
- [x] `git diff --check` — clean (no whitespace errors; working tree clean)
- [ ] Mobile smoke test (Android Chrome / iOS Safari): copy/download/share/WhatsApp, Devanagari render
- [ ] Desktop smoke test: share button hidden where Web Share unsupported; tabs switch
- [ ] Language-switch test: EN/हिन्दी/Hinglish pills on every page
- [ ] Share-link test: `wa.me` fallback + copy fallback (`execCommand`)
- [ ] Canonical/redirect test: `curl -I` on `rakhiwishes.in` → 301 → `/en/rakhi/`; root `/` → `/en/`
- [ ] Sitemap/robots test: `/sitemap-index.xml`, `/robots.txt` reachable and valid
- [ ] Ad placement test: house-promo shows; no ad if `PUBLIC_ADS_ENABLED` unset

---

## §11 — Open decisions

| Decision | Status |
|---|---|
| Canonical domain | `festivalwishesindia.com` (confirmed) |
| `rakhiwishes.in` permanent redirect | **Yes** — 301 → `/en/rakhi/` (live) |
| Hinglish as first-class locale | **Yes** (`hinglish` locale, BCP-47 `hi-Latn`) |
| Ad network | AdSense — **not yet applied** (owner applies ~mid-Sep) |
| User-submitted wishes | **NO for v1** (all content original, agent-authored) |
| Content per festival | 51 wishes / 9 cards is the **Rakhi baseline** (minimums: 24 wishes, 8 cards) |
| Production deploy requires manual approval | **Yes** — never deploy without owner approval |
| `humanReviewedSeed` flags | Open — owner approval recorded in docs but flags still `false` (flip or document intent) |
| `public/_redirects` stale file | Open — delete or realign (zone-level rule governs) |

---

## §12 — Sign-off

- **Prepared by:** Claude Code (`/handover-sync` skill run).
- **Date:** 2026-08-27 (IST).
- **Last verified commit:** see §8 (not restated here — single canonical record).
- **Deployment verified by:** production deploy of `festivalwishesindia.com` for `5e95b92` (collection
  tabs + locale-aware festival names) was completed 2026-08-27, this session — verified live via
  `curl` (`role="tablist"` present on `/hinglish/rakhi/friend-wishes/`; "रक्षा बंधन" present on `/hi/`)
  immediately after `wrangler pages deploy` (preview hash `f0970e7b`, logged in
  `deployment-notes.md`). This sync additionally re-verified the local repo/build state (§1 header,
  `npm run ci`) and re-derived wish/card counts and analytics wiring from source.
- **Known deviations from older docs:** none — `HANDOVER.md` and `CHECKLIST.md` agree with current
  HEAD (§8) on all live facts (wish/card counts, relation distribution, cards.ts registry all
  re-verified this run and unchanged since the last sync; `CHECKLIST.md` needed no edits). One new
  defect surfaced this run and is now recorded in §2/§9: `privacy.astro` still describes the
  `/api/event` endpoint that `b96f1dc` removed. `PROGRESS.md` remains retired. `STRUCTURE.md` is kept
  only as a structural walkthrough — no file/dir changes since the last sync (this session's commit
  only edited existing files), so it was left untouched, per the skill's Step 4.
- **Recommended next 3 actions:**
  1. Fix the stale `privacy.astro` copy (§2 known defect 5), delete/realign `public/_redirects`, and
     flip (or document) the 51 `humanReviewedSeed` flags.
  2. Wire `astro check` (add `@astrojs/check` + `typescript`) so type-checking joins the CI gate.
  3. Owner: AdSense application (~mid-Sep) — the remaining go-live monetization item now that Search
     Console and Cloudflare Web Analytics are both confirmed done.
