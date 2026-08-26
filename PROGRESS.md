# Festival Wishes India — Project Handover

> Cold-start handover. A fresh agent (or human, Claude Code, or Codex) should be able to resume this
> project from this document alone, with zero prior context.
>
> **Snapshot:** 2026-08-26 ~23:15 IST · HEAD `14e2660` · branch `main` · 17 commits · working tree clean
> at time of writing. This file is a living document — update it as milestones move.

---

## 1. Project overview & goal

**Festival Wishes India** is a multilingual festival-wishes website: sincere, original, ready-to-share
greeting messages and image cards for Indian festivals, in three languages (**Hindi**, **English**,
**Hinglish**). The flagship festival is **Raksha Bandhan (Rakhi)**, dated **2026-08-28**, with Diwali,
Holi, Dussehra, and Navratri planned to follow.

- Value prop: a visitor lands, picks a relationship/tone, copies a wish or downloads a shareable card,
  and forwards it on WhatsApp/status.
- Phase 1 = Rakhi 2026 launch. Target go-live is tightly coupled to the Aug 28 festival date.
- Monetization is **post-launch** (Cloudflare Web Analytics → AdSense → Amazon Associates gift guides
  for Diwali). No ads are live yet.

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

No UI framework (React/Vue/Svelte) — plain `.astro` components only.

---

## 3. Domains & infrastructure

| Domain | Registrar | DNS | Purpose |
|---|---|---|---|
| `festivalwishesindia.com` | Cloudflare Registrar | Cloudflare | Primary production domain |
| `rakhiwishes.in` | Spaceship | Nameservers pointed to Cloudflare | Rakhi-specific vanity domain → 301 redirect |

- **Cloudflare account id:** `0ce865a7040b3f3b8ddf2ff1a2bf6afb`
- **Zones:**
  - `festivalwishesindia.com` → zone id `51652f6727f5fac666bfcaca52201f90`
  - `rakhiwishes.in` → zone id `827ace09edab57f8b3ffc6658694c491`
- **Pages project name:** `festival-wishes-india`
- **GitHub repo:** `https://github.com/jprats1993/festival-wishes-india` (owner `jprats1993`)

**Redirect rule (committed in `public/_redirects`):**
```
https://rakhiwishes.in/*   https://festivalwishesindia.com/:splat   301!
http://rakhiwishes.in/*    https://festivalwishesindia.com/:splat   301!
```
⚠️ **Discrepancy to resolve:** the committed rule is a *blanket* 301 to the root domain with path
passthrough (`/:splat`). Project intent is for `rakhiwishes.in` to land on the Rakhi hub
(`/en/rakhi/`). The rule likely needs to become a fixed-target redirect (`…→ https://festivalwishesindia.com/en/rakhi/ 301!`)
rather than splat passthrough. Confirm before go-live.

---

## 4. Secrets & credentials

Secrets live on the local machine under `~/.hermes/secrets/` (NOT in the repo, NOT in `.env` — the
repo has no `.env`/`.env.production`). **Never echo, print, or commit these values.**

- `~/.hermes/secrets/github-token` — GitHub PAT (mode `0600`).
- `~/.hermes/secrets/cloudflare-token` — Cloudflare API token (mode `0644`; consider tightening to
  `0600` — minor hardening TODO).

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
npm run validate             # ⚠️ see pitfall #3 below — script does not exist yet
```

**Deploy (Cloudflare Pages):**
```bash
CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" \
CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" \
wrangler pages deploy dist --project-name festival-wishes-india
```
There is **no `wrangler.toml`** in the repo — deploys are driven entirely by CLI flags. Note the
`~/.hermes/secrets/cloudflare-token` file already exists on disk, but the token has not yet been
formally confirmed/provided by the owner for automation (see §10).

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
  `region`, `calendarConvention`, `languages`, `defaultIndexableCollections`,
  `minimums { approvedWishes, approvedCards, uniqueIndexableCollections }`,
  `publishLeadTimeDays` (default 42), `humanReviewRequired` (default true).

**Rakhi specifics** (`src/content/festival/rakhi.json`):
- date `2026-08-28` (source: drikpanchang; verified 2026-08-26), region "India and Indian diaspora".
- `defaultIndexableCollections`: `short-wishes`, `brother-wishes`, `sister-wishes`, `whatsapp-messages`.
- `minimums`: 24 approved wishes, 8 approved cards, 3 unique indexable collections.
- ⚠️ `publishLeadTimeDays: 2` (override of the 42-day default) because Rakhi is imminent — do not
  assume a 6-week lead for this launch.

---

## 7. URL & language structure

- Three locales, always **prefixed** (`prefixDefaultLocale: true`): `en`, `hi`, `hinglish`.
  - BCP-47 mapping (for sitemap/hreflang): `hinglish → hi-Latn`.
- Route shapes:
  - `/[locale]/` — locale home (festival picker).
  - `/[locale]/[festival]/` — festival hub (e.g. `/en/rakhi/`), now includes a "Shareable cards"
    gallery filtered by locale (`festivalCards = cards.filter(c => c.lang === locale)`).
  - `/[locale]/[festival]/[collection]/` — collection page (e.g. `/en/rakhi/brother-wishes/`).
  - `/` (root `src/pages/index.astro`) — English homepage; `/en/` serves the same picker via
    `[locale]/index.astro`.
- Collection → relation mapping lives in `src/lib/collections.ts` (`collectionMap`).
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
- `festival-rules.md` — human-readable per-festival rules (Rakhi: 24 wishes + 8 cards minimum).
- `festival-rules.yml` — machine-readable example config ("copy this file per festival").
- `publish-checklist.md` — full pre-publish checklist (content, SEO, images/sharing, monetization,
  release).

---

## 9. Current status

**Live / done:**
- Domains registered; `rakhiwishes.in` nameservers pointed to Cloudflare.
- GitHub repo created and pushed (`f03ec8e`). 17 commits on `main`.
- Astro 7 scaffold + i18n + content collections + base layout + Tailwind + sitemap + OG image +
  robots + event endpoint + trust pages (About/Contact/Privacy/Disclaimer).
- Build passes locally (`dist/` present).
- **51 Rakhi wishes** committed — all `reviewStatus: approved`, all `reviewedBy: reviewer-agent`,
  all `humanReviewedSeed: false` (i.e. **nothing has owner sign-off yet**).
  - Relations: brother 19 · sister 13 · bhaiya-bhabhi 7 · family 7 · friend 3 · parent 2.
- **Conversational Hindi rewrite** of the seed wishes — done (`12a6db2`).
- **Wish expansion** 30 → 51 (added 20 new + new `friend`/`parent` relations) — done (`12a6db2`).
- **Image regen** — done (`14e2660`): replaced 16 per-wish mixed-language cards with **8
  language-tagged cards** (`rakhi-en-1/2/3`, `rakhi-hi-1/2/3`, `rakhi-hinglish-1/2`) in
  `public/images/rakhi/cards/`, driven by a new `src/lib/cards.ts` registry and a locale-filtered
  "Shareable cards" gallery on the festival hub. Cards are now **decoupled** from wish JSONs
  (no `imageAssets` refs remain in wish files).

**Not yet live / remaining (agent):**
- Connect Cloudflare Pages to GitHub; first production deploy on `festivalwishesindia.com`.
- Fix/confirm the `rakhiwishes.in` redirect target (see §3) and deploy it.
- AI-assisted content disclosure note on the site (Trust & Compliance).
- Cloudflare Web Analytics enablement; Search Console property + sitemap submission (owner-led).

**Owner blockers** (nothing ships until these clear — see §10).

---

## 10. Open decisions & owner pending actions

1. **Approve the Rakhi seed batch** before go-live (all 51 wishes currently only reviewer-agent
   approved; `humanReviewedSeed` still `false` everywhere).
2. **Confirm the `rakhiwishes.in` NIXI registrant-verification email** was clicked (domain may not
   resolve/redirect until then).
3. **Confirm the Cloudflare API token** for Pages/DNS automation (token file exists at
   `~/.hermes/secrets/cloudflare-token`, but CHECKLIST still tracks "provide token" as open).
4. **Real-device QA** (Android Chrome + iOS Safari) by **Aug 28 afternoon** — download/share flows,
   native share, WhatsApp text-link fallback, Devanagari rendering.
5. **Go-live decision** — timing is critical given the Aug 28 festival date.

---

## 11. Known pitfalls & gotchas

1. **Astro 7 content collections require explicit `glob()` loaders.** A past bug: using the *default*
   loader silently returned **empty collections** (site built with zero wishes and no errors). Fixed in
   `e2c8c22`. Always define `loader: glob({ pattern, base })` when adding a collection.
2. **OpenCode Go 503s on long single subagents** — keep subagents short and run them **in parallel**
   rather than chaining one long agent, or the backend may drop the request.
3. **`npm run validate` is broken** — `package.json` points to `scripts/validate-content.mjs`, which
   does **not exist** (scripts/ only has `card-specs.json`, `card-wish-ids.json`, `wish-assignments.json`).
   Either write the validator or drop the script entry.
4. **Git history was rewritten to `Prateek Jain <jprats1993@outlook.com>`** — every commit carries this
   author/identity, and the GitHub remote user is `jprats1993`. Don't be surprised by the name/author
   mismatch if you expected a different committer.
5. **Embedded PAT in the git remote URL** — `origin` includes `jprats1993:ghp_…@`. Rotate if the token
   ever leaks, and prefer the credential helper.
6. **`rakhiwishes.in` redirect is blanket, not `/en/rakhi/`** (see §3) — verify the intended target.
7. **`rakhi.json` sets `publishLeadTimeDays: 2`** (not the 42-day default) — Rakhi is an imminent
   launch, not a 6-week-planned one.
8. **`noindex` logic** — collection pages with < 3 approved wishes and thin filter/search pages are
   meant to be noindex'd; the sitemap filter references `/thin-` and `/search` patterns that don't
   exist as pages yet (forward-looking).
9. **Cloudflare token file is `0644`** — tighten to `0600` for parity with the GitHub token.

---

## 12. Cold-start quickstart

```bash
cd /Users/varshajain/festival-wishes-india
npm install
npm run build          # verify a clean build → dist/
npm run dev            # optional; localhost:4321
# deploy (after owner confirms token):
CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" \
CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" \
wrangler pages deploy dist --project-name festival-wishes-india
```

Read these before making changes: `agent-rules/content-policy.md`, `agent-rules/editorial-style.md`,
`agent-rules/festival-rules.md`, `agent-rules/publish-checklist.md`, and `src/content.config.ts`.

---

## 13. Key files map

```
astro.config.mjs                         # site URL, i18n locales, sitemap, Tailwind Vite plugin
src/content.config.ts                     # wish + festival Zod schemas (glob loaders)
src/content/wish/*.json                   # 51 wishes (rakhi-*-NNN.json)
src/content/festival/rakhi.json           # Rakhi festival config
src/lib/collections.ts                    # collection slug → relation map
src/lib/i18n.ts                           # locales, labels, BCP-47 mapping
src/lib/cards.ts                          # language-tagged card registry (id → lang/src/alt/text)
src/pages/index.astro                     # root English homepage
src/pages/[locale]/index.astro            # locale festival picker
src/pages/[locale]/[festival]/index.astro  # festival hub (+ card gallery)
src/pages/[locale]/[festival]/[collection].astro  # collection page
src/pages/[locale]/{about,contact,privacy,disclaimer}.astro  # trust pages
src/pages/api/event.ts                    # analytics event stub (no-op)
src/pages/robots.txt.ts                   # robots.txt
public/_redirects                         # rakhiwishes.in → festivalwishesindia.com 301
public/images/rakhi/cards/*.webp          # 8 language-tagged card images
scripts/{card-specs.json,card-wish-ids.json,wish-assignments.json}  # card-generation inputs
agent-rules/*                             # governance rules
CHECKLIST.md                              # owner/agent shared launch tracker
```

---

## 14. Version control identity & remote

- Branch: `main` (also `origin/main`, `origin/HEAD`).
- Remote: `https://jprats1993:<token>@github.com/jprats1993/festival-wishes-india.git`.
- Author: `Prateek Jain <jprats1993@outlook.com>` on all 17 commits (history rewritten — see §11.4).
