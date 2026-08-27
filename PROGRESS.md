# Festival Wishes India — Project Handover

> Cold-start handover. A fresh agent (or human, Claude Code, or Codex) should be able to resume this
> project from this document alone, with zero prior context.
>
> **Snapshot:** 2026-08-26 ~23:55 IST · HEAD `4d47d97` · branch `main` · 27 commits · working tree clean
> at time of writing. This file is a living document — update it as milestones move.

---

## 1. Project overview & goal

**Festival Wishes India** is a multilingual festival-wishes website: sincere, original, ready-to-share
greeting messages and image cards for Indian festivals, in three languages (**Hindi**, **English**,
**Hinglish**). The flagship festival is **Raksha Bandhan (Rakhi)**, dated **2026-08-28**.

- **🟢 LIVE** at https://festivalwishesindia.com (deployed 2026-08-26 evening). Rakhi 2026 is the
  Phase-1 launch.
- Value prop: a visitor lands, picks a relationship/tone, copies a wish or downloads a shareable card,
  and forwards it on WhatsApp/status.
- Diwali, Holi, Dussehra, and Navratri are planned to follow.
- Monetization is **post-launch** (Cloudflare Web Analytics → AdSense → Amazon Associates gift guides
  for Diwali). No ads are live yet; analytics beacon is now wired (Cloudflare Web Analytics, automatic setup) (see §9).

---

## 2. Tech stack

- **Astro 7** static site generator (`astro ^7.2.7`), fully SSG — `build.format: "directory"`.
- **Cloudflare Pages** as the deployment/hosting target (project name `festival-wishes-india`).
- **Tailwind CSS v4** via the Vite plugin (`@tailwindcss/vite` + `tailwindcss ^4.3.3`) — no
  `tailwind.config`, CSS-first import in `src/styles/global.css`.
- **Content collections** with JSON schemas in `src/content.config.ts` (Zod, `zod ^3.23.8`).
- **`@astrojs/sitemap`** for sitemap generation (i18n-aware); **`sharp`** for image optimization.
- Node `>=22.12.0` (local dev machine runs v26.7.0); package manager **npm**.
- Tooling: **wrangler 4.126.0** installed for Pages deploys; **git** + **GitHub** (`gh`/HTTPS remote)
  for source control.
- **CI pipeline:** `npm run ci` = `npm run validate` + `npm run build` + `npm run check:links`
  (content schema/dup validation → static build → dead-link/asset check). Verified green.

No UI framework (React/Vue/Svelte) — plain `.astro` components only.

---

## 3. Domains & infrastructure

| Domain | Registrar | DNS | Purpose |
|---|---|---|---|
| `festivalwishesindia.com` | Cloudflare Registrar | Cloudflare | Primary production domain (**live**) |
| `rakhiwishes.in` | Spaceship | Nameservers pointed to Cloudflare | Rakhi vanity domain → **301 → `/en/rakhi/` (live)** |

- **Cloudflare account id:** `0ce865a7040b3f3b8ddf2ff1a2bf6afb`
- **Zones:**
  - `festivalwishesindia.com` → zone id `51652f6727f5fac666bfcaca52201f90`
  - `rakhiwishes.in` → zone id `827ace09edab57f8b3ffc6658694c491`
- **Pages project name:** `festival-wishes-india`
- **GitHub repo:** `https://github.com/jprats1993/festival-wishes-india` (owner `jprats1993`)

**Redirects (live, verified via `curl -I`):**
- `https://rakhiwishes.in/` → **301** → `https://festivalwishesindia.com/en/rakhi/` ✅
- `https://festivalwishesindia.com/` (root) → serves an Astro meta-refresh redirect → `/en/`
  (see §7). The "real" homepage lives at `/en/`.

**Note — stale `public/_redirects`:** the repo still contains the *old blanket-splat* rule
(`rakhiwishes.in/* → festivalwishesindia.com/:splat`). It is **superseded** by the live fixed-target
redirect to `/en/rakhi/`, which is configured at the `rakhiwishes.in` **zone level** in Cloudflare
(a separate zone from the Pages project, so `_redirects` never governed it anyway). Minor follow-up:
delete or realign `public/_redirects` to avoid confusion.

---

## 4. Secrets & credentials

Secrets live on the local machine under `~/.hermes/secrets/` (NOT in the repo, NOT in `.env` — the
repo has no `.env`/`.env.production`). **Never echo, print, or commit these values.**

- `~/.hermes/secrets/github-token` — GitHub PAT (mode `0600`).
- `~/.hermes/secrets/cloudflare-token` — Cloudflare API token. **Confirmed working** (the production
  deploy completed with it). Consider tightening file mode to `0600` (minor hardening TODO).

For deploy, these are exported as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
(= `0ce865a7040b3f3b8ddf2ff1a2bf6afb`).

**Security note:** the `origin` remote URL currently embeds the GitHub PAT inline
(`https://jprats1993:ghp_…@github.com/…`). Recommend migrating to the macOS keychain credential
helper and stripping the token from the remote URL.

---

## 5. Build & deploy

```bash
npm install                  # first time
npm run dev                  # local dev server (localhost:4321); or `astro dev --background` per AGENTS.md
npm run build                # static build → ./dist
npm run preview              # preview the production build locally
npm run check                # astro check (type-check)
npm run validate             # node scripts/validate-content.mjs  (schema/dup/provenance)
npm run check:links          # node scripts/check-links.mjs       (dead links / missing assets)
npm run ci                   # validate + build + check:links  ← run this before every deploy
```

**Deploy (Cloudflare Pages) — CLI-driven, no `wrangler.toml`:**
```bash
CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" \
CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" \
wrangler pages deploy dist --project-name festival-wishes-india
```
Git auto-deploy (connecting Pages to the GitHub repo) is **not wired** — deploys are manual via CLI.
That is the working, confirmed path; Git integration is an optional future improvement.

---

## 6. Content model & schema

Two content collections, both loaded via **explicit `glob()` loaders** (see pitfall #1):

- `src/content/wish/` — 51 wish JSON files (one per wish).
- `src/content/festival/` — 1 file today: `rakhi.json` (the festival config).

Schemas are defined in `src/content.config.ts`:

**Wish schema** (`wish`):
- `id` (lowercase kebab, e.g. `rakhi-brother-001`)
- `festival` ∈ `rakhi | diwali | holi | dussehra | navratri`
- `languages` = `{ en, hi, hinglish }` strings (5–500 chars each)
- `relations` ∈ `brother | sister | bhaiya-bhabhi | family | friend | spouse | parent`
- `tones` (default `["warm"]`), `formats` (default `["whatsapp"]`)
- `imageAssets { square?, portrait? }`, `altText` (optional — currently **decoupled**; see §9)
- `source: "original"`, `reviewStatus` ∈ `pending | approved | rejected`, `reviewedBy` ∈
  `reviewer-agent | owner`, `humanReviewedSeed` (bool)

**Festival schema** (`festival`):
- `slug`, `displayName`, `aliases`, `date` (YYYY-MM-DD), `dateSourceUrl`, `dateVerifiedAt`,
  `dateVerifiedBy` (new), `isSmokeTest` (new, default false), `region`, `calendarConvention`,
  `languages`, `defaultIndexableCollections`,
  `minimums { approvedWishes, approvedCards, uniqueIndexableCollections }`,
  `publishLeadTimeDays` (default 42), `humanReviewRequired` (default true).
- **Smoke-test exemption** (added `a13b628`): `is_smoke_test: true` waives the 42-day lead-time
  gate (documented in `agent-rules/festival-rules.yml`).

**Rakhi specifics** (`src/content/festival/rakhi.json`):
- date `2026-08-28` (source: drikpanchang), `dateVerifiedAt: 2026-08-26T18:00:00Z`,
  `dateVerifiedBy: "owner"`, `isSmokeTest: true`, region "India and Indian diaspora".
- `defaultIndexableCollections`: `short-wishes`, `brother-wishes`, `sister-wishes`, `whatsapp-messages`.
- `minimums`: 24 approved wishes, 8 approved cards, 3 unique indexable collections (all met).
- `publishLeadTimeDays: 2` (override of the 42-day default) because Rakhi is imminent.

---

## 7. URL & language structure

- Three locales, always **prefixed** (`prefixDefaultLocale: true`): `en`, `hi`, `hinglish`.
  - BCP-47 mapping (for sitemap/hreflang): `hinglish → hi-Latn`.
- Route shapes:
  - `/` (root `src/pages/index.astro`) → `Astro.redirect('/en/', 301)`. In the SSG build this emits a
    **meta-refresh page** (200 + `<meta http-equiv="refresh">`), not a true 301 — acceptable, but a
    Cloudflare-level 301 would be marginally better for SEO (minor follow-up).
  - `/[locale]/` — locale home (festival picker).
  - `/[locale]/[festival]/` — festival hub (e.g. `/en/rakhi/`): "Shareable cards" gallery
    (locale-filtered via `cards.ts`) + **tabbed wish listing** — "All wishes (51)", "Popular wishes
    (12)", and relation tabs (Brother/Sister/Bhaiya-Bhabhi/Family/Friend/Parents). Cards are numbered.
  - `/[locale]/[festival]/[collection]/` — collection page (e.g. `/en/rakhi/brother-wishes/`).
- Collection → relation mapping lives in `src/lib/collections.ts` (`collectionMap`).
- "Popular" tab is driven by `src/lib/popular.ts` (`popularWishIds` — 12 curated IDs).
- Static pages: `/[locale]/about`, `/[locale]/contact`, `/[locale]/privacy`, `/[locale]/disclaimer`.
- `src/pages/robots.txt.ts` and `src/pages/api/event.ts` (analytics event stub — currently a no-op).
- Locale/collection pages emit `noindex` when the result set is too thin (collection < 3 wishes).

---

## 8. Governance — `agent-rules/`

The project runs a **reviewer-agent model**: an independent "reviewer-agent" pass audits every content
batch; the **owner must explicitly approve the first seed batch of a new festival** before publication.

Files in `agent-rules/`:
- `content-policy.md` — editorial + language rules, AI transparency, and a **publication gate**
  (reject near-duplicates, unnatural Hindi, unsupported claims, unclear copyright, missing alt text,
  keyword-stuffed pages).
- `editorial-style.md` — voice, wish format (1–3 sentences), Hindi/Hinglish conventions, image rules
  (image text must exactly match approved text, high-contrast readable Devanagari).
- `festival-rules.md` — human-readable per-festival rules (Rakhi: 24 wishes + 11 cards minimum).
- `festival-rules.yml` — machine-readable example config + **smoke-test exemption** (`is_smoke_test`).
- `publish-checklist.md` — full pre-publish checklist (content, SEO, images/sharing, monetization,
  release).

---

## 9. Current status

**🟢 LIVE** at `festivalwishesindia.com`. Done:
- Domains registered; `rakhiwishes.in` nameservers pointed to Cloudflare.
- GitHub repo created and pushed (`f03ec8e`); 27 commits on `main`.
- Astro 7 scaffold + i18n + content collections + base layout + Tailwind + sitemap + OG image +
  robots + event endpoint + trust pages (About/Contact/Privacy/Disclaimer).
- **51 Rakhi wishes** committed (`12a6db2`): conversational-Hindi rewrite + 20 new. All
  `reviewStatus: approved`, `reviewedBy: reviewer-agent`.
  - Relations: brother 19 · sister 13 · bhaiya-bhabhi 7 · family 7 · friend 3 · parent 2.
- **11 language-tagged card images** (`14e2660`): `rakhi-en-1/2/3`, `rakhi-hi-1/2/3`,
  `rakhi-hinglish-1/2/3/4/5` in `public/images/rakhi/cards/`, driven by `src/lib/cards.ts` registry and a
  locale-filtered "Shareable cards" gallery on the hub. Cards are **decoupled** from wish JSONs
  (no `imageAssets` refs remain in wish files).
- **Tabbed wish listing** (`999c7b1`): All (51) / Popular (12) / relation tabs, with per-card numbering.
- **CI pipeline** (`a13b628`): `npm run ci` = validate + build + check:links — verified green
  (validate: 51 wish + 1 festival ✅; check:links: 43 HTML / 633 refs ✅).
- **Schema additions** (`a13b628`): `dateVerifiedBy` + `isSmokeTest` (smoke-test lead-time exemption).
- **Share buttons** (`96a91f9`): icon+label Copy / Download / Share(native) / WhatsApp, with a robust
  copy fallback (`execCommand('copy')`) and a `navigator.share` → `wa.me` fallback.
- **Root `/` → `/en/`** redirect (meta-refresh) live; `rakhiwishes.in` → `/en/rakhi/` 301 live.
- **AI-assisted content disclosure** now live in the footer (`BaseLayout`), About, and Disclaimer.

**Remaining (see §10 / CHECKLIST.md):**
- Real-device QA (Android Chrome + iOS Safari) — owner.
- Search Console property + verification + sitemap submission — owner.
- `rakhiwishes.in` NIXI registrant-verification confirmation — owner.
- Cloudflare Web Analytics beacon (privacy copy already discloses it; endpoint is a no-op stub).
- AdSense application/approval + Diwali content + Amazon Associates gift guides (post-launch).

**Data-level follow-up note:** owner seed-batch approval was recorded in the tracker (`fa9cdd4`), but
the 51 wish JSONs still carry `humanReviewedSeed: false` / `reviewedBy: reviewer-agent`. Either flip
those fields to reflect the owner sign-off or confirm the flags are intentionally left as-is.

---

## 10. Open decisions & owner pending actions

1. **Real-device QA** (Android Chrome + iOS Safari) by **Aug 28 afternoon** — download/share flows,
   native share, WhatsApp text-link fallback, Devanagari rendering.
2. **Search Console**: create/verify the `festivalwishesindia.com` property and submit the sitemap.
3. **NIXI**: confirm the `rakhiwishes.in` registrant-verification email was actioned (redirect is
   already live, but confirm for `.in` compliance to avoid suspension).
4. **Cloudflare Web Analytics**: enable and add the beacon (post-launch).
5. **AdSense**: prepare application (owner applies ~mid-Sep); Diwali + Amazon Associates later.

---

## 11. Known pitfalls & gotchas

1. **Astro 7 content collections require explicit `glob()` loaders.** A past bug: using the *default*
   loader silently returned **empty collections** (site built with zero wishes and no errors). Fixed in
   `e2c8c22`. Always define `loader: glob({ pattern, base })` when adding a collection.
2. **OpenCode Go 503s on long single subagents** — keep subagents short and run them **in parallel**
   rather than chaining one long agent, or the backend may drop the request.
3. **`Astro.redirect` in SSG emits a meta-refresh page (HTTP 200), not a real 301.** The root `/`
   redirect works but is a meta-refresh. For a true 301 use a Cloudflare redirect rule or a `_redirects`
   entry for same-zone Pages routes.
4. **Git history is authored as `Prateek Jain <jprats1993@outlook.com>`** — every commit carries this
   identity, and the GitHub remote user is `jprats1993`. Don't be surprised by the name/author mismatch.
5. **Embedded PAT in the git remote URL** — `origin` includes `jprats1993:ghp_…@`. Rotate if the token
   ever leaks, and prefer the credential helper.
6. **`rakhi.json` sets `publishLeadTimeDays: 2`** (not the 42-day default) — Rakhi is an imminent
   launch, not a 6-week-planned one. `isSmokeTest: true` waives the lead-time gate.
7. **`noindex` logic** — collection pages with < 3 approved wishes and thin filter/search pages are
   meant to be noindex'd; the sitemap filter references `/thin-` and `/search` patterns that don't
   exist as pages yet (forward-looking).
8. **Cloudflare token file is `0644`** — tighten to `0600` for parity with the GitHub token.
9. **`public/_redirects` is stale** — still the blanket `/:splat` passthrough; the real rakhiwishes.in
   redirect is a zone-level rule → `/en/rakhi/`. Delete/realign the file.
10. **`humanReviewedSeed` flags not flipped** — owner approval is tracked in docs but not in the wish
    JSONs (see §9). Decide and either flip or document the intent.

---

## 12. Cold-start quickstart

```bash
cd /Users/varshajain/festival-wishes-india
npm install
npm run ci              # validate + build + check:links (must be green before deploy)
# deploy (CLI-driven):
CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" \
CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" \
wrangler pages deploy dist --project-name festival-wishes-india
# local preview:
npm run preview -- --port 4321   # → http://localhost:4321/
```

Read these before making changes: `agent-rules/content-policy.md`, `agent-rules/editorial-style.md`,
`agent-rules/festival-rules.md`, `agent-rules/publish-checklist.md`, and `src/content.config.ts`.

---

## 13. Key files map

```
astro.config.mjs                            # site URL, i18n locales, sitemap, Tailwind Vite plugin
src/content.config.ts                        # wish + festival Zod schemas (glob loaders)
src/content/wish/*.json                      # 51 wishes (rakhi-*-NNN.json)
src/content/festival/rakhi.json              # Rakhi festival config (smoke test, dateVerifiedBy)
src/lib/collections.ts                       # collection slug → relation map
src/lib/i18n.ts                              # locales, labels, BCP-47 mapping
src/lib/cards.ts                             # language-tagged card registry (11 cards)
src/lib/popular.ts                           # curated "popular" wish IDs (12) for the Popular tab
src/components/WishCard.astro                # wish card + numbered display
src/components/ShareBar.astro                # icon+label share buttons + copy fallback
src/components/AdSlot.astro                  # ad placeholder slots (empty until monetization)
src/layouts/BaseLayout.astro                 # layout + footer (AI disclosure, editorial-policy link)
src/pages/index.astro                        # root → /en/ redirect (meta-refresh)
src/pages/[locale]/index.astro               # locale festival picker
src/pages/[locale]/[festival]/index.astro    # festival hub (card gallery + tabbed listing)
src/pages/[locale]/[festival]/[collection].astro  # collection page
src/pages/[locale]/{about,contact,privacy,disclaimer}.astro  # trust pages
src/pages/api/event.ts                       # analytics event stub (no-op)
src/pages/robots.txt.ts                      # robots.txt
public/_redirects                            # ⚠️ stale blanket rakhiwishes.in rule (see §3/§11.9)
public/images/rakhi/cards/*.webp             # 11 language-tagged card images
scripts/validate-content.mjs                 # content validation (npm run validate)
scripts/check-links.mjs                      # dead-link/asset checker (npm run check:links)
scripts/{card-specs.json,card-wish-ids.json,wish-assignments.json}  # card-generation inputs
agent-rules/*                                # governance rules
CHECKLIST.md                                 # owner/agent shared launch tracker
```

---

## 14. Version control identity & remote

- Branch: `main` (also `origin/main`, `origin/HEAD`). 27 commits.
- Remote: `https://github.com/jprats1993/festival-wishes-india.git` (clean — no token).
- Author: `Prateek Jain <jprats1993@outlook.com>` on all commits (history rewritten — see §11.4).
