# Festival Wishes India — Directory Structure & File Walkthrough

> A clear, purpose-oriented walkthrough of this repository. Use this to understand where
> everything lives, what each file does, how content is modeled, and how the site is built
> and deployed.
>
> Stack: **Astro 7** (fully static SSG) · **Tailwind CSS v4** (Vite plugin, CSS-first) ·
> **Zod** content schemas · **Cloudflare Pages** hosting. No UI framework — plain `.astro`
> components. Languages: English (`en`), Hindi (`hi`), Hinglish (`hinglish`).
>
> **This is a structural reference, not a live fact tracker.** For current wish/card counts, git
> state, deploy status, and analytics/SEO status, see **`HANDOVER.md`** — the single authoritative
> cold-start doc. This file is only refreshed when the repo's actual file/directory layout changes
> (files added, removed, or renamed), not on every count or status change.

---

## 1. Top-level layout

```
festival-wishes-india/
├── agent-rules/            # Governance & editorial rules for content agents
├── public/                 # Static assets copied verbatim to the build output
├── scripts/                # Content/card-generation inputs + validation scripts
├── src/                    # All source code, pages, components, content
├── .astro/                 # GENERATED — Astro type/schema artifacts (git-ignored)
├── .vscode/                # Editor config (recommended extension + launch profile)
├── .wrangler/              # Cloudflare Pages deploy state (currently empty)
├── dist/                   # GENERATED — production build output (git-ignored)
├── .gitignore
├── AGENTS.md               # Dev instructions for coding agents (Astro docs pointers)
├── CLAUDE.md               # Symlink → AGENTS.md
├── CHECKLIST.md            # Shared owner/agent launch tracker (checkboxes)
├── HANDOVER.md             # Authoritative cold-start handover doc (full project state)
├── KICKOFF_PROMPT.md       # Copy-paste prompt to bootstrap a new chat/model/harness
├── STRUCTURE.md            # This file — structural walkthrough, not a fact tracker
├── README.md               # Stock Astro starter README (boilerplate, not project-specific)
├── astro.config.mjs        # Astro config: site URL, i18n, sitemap, Tailwind
├── package.json            # Scripts + dependencies
├── package-lock.json       # Lockfile
└── tsconfig.json           # TypeScript config (extends Astro strict)
```

**Root markdown docs (purpose in brief):**
- `AGENTS.md` — instructions for AI coding agents working in the repo (use `astro dev --background`, consult the linked Astro docs before touching routing/components/content/i18n). Symlinked as `CLAUDE.md`.
- `CHECKLIST.md` — a live launch checklist split into `[agent]` and `[owner]` rows (infrastructure, content, trust/compliance, SEO, analytics/monetization, owner blockers).
- `HANDOVER.md` — the single authoritative cold-start handover: tech stack, domains/infrastructure, secrets locations, content model, URL structure, current status, open decisions, and known pitfalls. This is the doc to trust for any current fact.
- `KICKOFF_PROMPT.md` — a copy-paste prompt for bootstrapping a brand-new chat/model/harness on this project; points at `HANDOVER.md` and the `handover-sync` runbook rather than duplicating their content, and deliberately carries no hardcoded facts (commit count, SHA, etc.) that could go stale.
- `README.md` — the default Astro "Minimal" starter README; boilerplate only, not maintained for this project.

> A prior `PROGRESS.md` duplicated HANDOVER.md's scope almost exactly (both called themselves the
> "cold-start handover") and was retired 2026-08-27 to remove that redundancy — see HANDOVER.md §12.

---

## 2. `src/` — source tree

```
src/
├── components/             # Reusable .astro UI components
├── content/                # Content-collection JSON data (wish + festival)
├── layouts/                # Shared page shell (BaseLayout)
├── lib/                    # TypeScript helpers (no UI)
├── pages/                  # Routes (file-based routing)
├── styles/global.css       # Tailwind v4 CSS-first entry + global styles
└── content.config.ts       # Zod schemas for the two content collections
```

### 2.1 `src/pages/` — routes (file-based)

| File | Route(s) generated | Purpose |
|---|---|---|
| `index.astro` | `/` | Root entry — immediately 301-redirects to `/en/` (the real homepage). |
| `[locale]/index.astro` | `/en/`, `/hi/`, `/hinglish/` | Locale homepage — the "choose a festival" picker grid, each tile topped with a `banner.webp` header image. |
| `[locale]/[festival]/index.astro` | `/en/rakhi/`, etc. | Festival hub: intro copy, "Shareable cards" gallery (locale-filtered), All/Popular wish tabs, and relation-tab links. |
| `[locale]/[festival]/[collection].astro` | `/en/rakhi/brother-wishes/`, etc. | Collection page: filters approved wishes by relation, emits `noindex` when fewer than 3 results. |
| `[locale]/about.astro` | `/en/about/`, … | About page (per-locale copy). |
| `[locale]/contact.astro` | `/en/contact/`, … | Contact page (email link). |
| `[locale]/privacy.astro` | `/en/privacy/`, … | Privacy policy (analytics/ads/affiliate disclosures). |
| `[locale]/disclaimer.astro` | `/en/disclaimer/`, … | Disclaimer (dates/regional-customs caveats). |
| `robots.txt.ts` | `/robots.txt` | Emits `User-agent: *` + sitemap pointer. |
> Note: `api/event.ts` (a POST analytics stub) was removed 2026-08-27 — it 404'd in production
> because this is a static (non-SSR) deploy, so it never actually worked. See HANDOVER.md §2.

### 2.2 `src/components/`

| Component | Purpose |
|---|---|
| `BaseLayout.astro` | (lives in `layouts/`, listed here for clarity) |
| `WishCard.astro` | Renders a single wish (`<blockquote>` + number) and embeds a `ShareBar`. |
| `ShareBar.astro` | Copy / Download / native-share / WhatsApp-fallback buttons; client JS handles clipboard and the Web Share API (no analytics tracking — the `/api/event` call was removed, see note above). |
| `LanguageSwitcher.astro` | Pill-style EN / हिन्दी / Hinglish switcher using `alternateUrls`. |
| `AdSlot.astro` | Placeholder ad slot; shows a house-promo unless `PUBLIC_ADS_ENABLED=true`. |

### 2.3 `src/layouts/`

| File | Purpose |
|---|---|
| `BaseLayout.astro` | The single page shell: `<html lang>`, head metadata (title, description, canonical, hreflang alternates, OG/Twitter cards, favicon), header with logo + language switcher, `<main>` slot, footer with trust-page links and AI-assist disclosure. All pages render through this. |

### 2.4 `src/lib/`

| File | Purpose |
|---|---|
| `i18n.ts` | Locale constants (`en`, `hi`, `hinglish`), display labels, BCP-47 mapping (`hinglish → hi-Latn`), `isLocale()` guard, and `festivalName(festival, locale)` (resolves a festival's locale-specific display name, falling back to `displayName`). |
| `collections.ts` | `collectionMap`: collection slug → list of relation values (e.g. `brother-wishes → ["brother"]`, `spouse-wishes → ["spouse"]`); empty-array slugs (`short-wishes`, `whatsapp-messages`) are non-filtering. |
| `relations.ts` | `relationTabs`: the relation-tab bar data (slug + per-locale label) shown on both the festival hub and every collection subpage — single source of truth so the two pages can't drift out of sync. |
| `cards.ts` | Registry of shareable card images (`id → festival/lang/src/alt/text`), decoupled from wish JSONs. `festival` field lets each hub filter to only its own cards. |
| `popular.ts` | Curated list of "popular" wish IDs (across all festivals) surfaced under the Popular tab on each festival's hub. |

### 2.5 `src/content/`

| Path | Purpose |
|---|---|
| `wish/*.json` | 151 wish files, one per wish, named `<festival>-<relation>-<NNN>.json`. |
| `festival/rakhi.json`, `diwali.json`, `dussehra.json` | Per-festival configuration (slug, date, minimums, etc.). |

### 2.6 `src/content.config.ts`

Defines the two Zod-validated content collections. **Important:** both use explicit
`loader: glob({ pattern, base })` — Astro 7 requires this (the default loader silently
returned empty collections in an earlier bug).

---

## 3. Content model

### 3.1 `wish` collection (`src/content/wish/*.json`)

Each file describes one wish in three languages. Schema fields:

| Field | Type / constraint | Meaning |
|---|---|---|
| `id` | string `/^[a-z0-9-]+$/` | Unique kebab-case id, e.g. `rakhi-brother-001`, `diwali-family-001`. |
| `festival` | enum `rakhi \| diwali \| holi \| dussehra \| navratri` | Owning festival slug. |
| `languages` | `{ en, hi, hinglish }`, each string 5–500 chars | The wish text in each language. |
| `relations` | array of enum `brother \| sister \| bhaiya-bhabhi \| family \| friend \| spouse \| parent` | Audience/relationship tags used for collection filtering. |
| `tones` | array of enum `short \| emotional \| funny \| formal \| devotional \| warm` (default `["warm"]`) | Mood tags. |
| `formats` | array of enum `card \| whatsapp \| status \| long` (default `["whatsapp"]`) | Where the wish is meant to be used. |
| `imageAssets` | `{ square?, portrait? }` (optional) | Image URLs per wish (currently decoupled — cards live in `lib/cards.ts`). |
| `altText` | `Record<string,string>` (optional) | Per-language alt text. |
| `source` | literal `"original"` | Must be original content (no scraped/copied material). |
| `reviewStatus` | enum `pending \| approved \| rejected` (default `pending`) | Publication gate state. |
| `reviewedBy` | enum `reviewer-agent \| owner` (optional) | Who last approved it. |
| `humanReviewedSeed` | boolean (default `false`) | Whether the owner has personally signed off the seed batch. |

### 3.2 `festival` collection (`src/content/festival/*.json`)

Each file configures one festival. Schema fields:

| Field | Type / constraint | Meaning |
|---|---|---|
| `slug` | string | URL slug, e.g. `rakhi`. |
| `displayName` | string | Human name (English fallback), e.g. `Raksha Bandhan`. |
| `displayNames` | `{ en, hi, hinglish }` (optional) | Per-locale display name, resolved via `festivalName()` in `lib/i18n.ts`; falls back to `displayName` if absent. |
| `aliases` | string[] | Alternate names. |
| `date` | string `/^\d{4}-\d{2}-\d{2}$/` | Festival date (must be manually verified). |
| `dateSourceUrl` | URL string | Where the date was sourced. |
| `dateVerifiedAt` | datetime | When the date was verified. |
| `dateVerifiedBy` | string (optional) | Who verified it. |
| `isSmokeTest` | boolean (default `false`) | Waives the 42-day lead time for pipeline tests. |
| `region` | string | Target region, e.g. "India and Indian diaspora". |
| `calendarConvention` | string | E.g. "Hindu lunar calendar (Shravana Purnima)". |
| `languages` | array of enum `en \| hi \| hinglish` | Supported languages. |
| `defaultIndexableCollections` | string[] | Collections treated as indexable SEO targets. |
| `minimums` | `{ approvedWishes, approvedCards, uniqueIndexableCollections }` | Launch minimums. |
| `publishLeadTimeDays` | number (default `42`) | How far ahead the hub should publish. |
| `humanReviewRequired` | boolean (default `true`) | Whether owner approval is required. |

---

## 4. `agent-rules/` — governance rules

A reviewer-agent model governs content: an independent "reviewer-agent" audits every batch,
and the owner must explicitly approve a new festival's first seed batch.

| File | Purpose (1–2 sentences) |
|---|---|
| `content-policy.md` | Editorial and language rules: publish only original, culturally respectful, natural-sounding wishes; no scraped or unlicensed material. Defines the AI-transparency requirement and a **publication gate** that rejects near-duplicates, unnatural Hindi, unsupported claims, unclear copyright, missing alt text, and keyword-stuffed pages. |
| `editorial-style.md` | Voice and craft guidance: warm, concise, 1–3-sentence wishes; per-language conventions (natural Hindi, consistent Hinglish spelling); plus image rules (text on image must exactly match approved text, high contrast, readable Devanagari). |
| `festival-rules.md` | Human-readable, per-festival rules — now has sections for Rakhi, Dussehra, and Diwali (date, audience, minimum wishes/cards, lead time) — and the review requirements every batch must pass. |
| `festival-rules.yml` | Machine-readable example festival config ("copy this file per festival") mirroring the `festival` JSON schema, including the smoke-test exemption note. Still the original Rakhi-only file (never renamed). |
| `festival-rules-diwali.yml`, `festival-rules-dussehra.yml` | Machine-readable per-festival configs, added by literally following `festival-rules.yml`'s own "copy this file for each festival" instruction when Diwali/Dussehra launched. |
| `publish-checklist.md` | A full pre-publish checklist across content, SEO, images/sharing, monetization/compliance, and release — used as the final gate before go-live. |

---

## 5. `scripts/`

| File | Purpose |
|---|---|
| `validate-content.mjs` | Content validator (`npm run validate`): checks every wish/festival JSON has required fields, each of the three languages is present and non-trivial, `source === "original"`, and no duplicate wish IDs. Exits non-zero on any error. |
| `check-links.mjs` | Static dead-link / missing-asset checker (`npm run check:links`): walks every HTML file in `dist/`, resolves internal `href`/`src`, and verifies the target file exists. Skips external URLs, `mailto:`/`tel:`/`#`, and `/api/` endpoints. |
| `generate-hinglish-cards.mjs` | Lightweight runner that delegates to `generate-cards.mjs` for Rakhi Hinglish cards. |
| `generate-cards.mjs` | Generalized, festival-parameterized card generator (SVG → headless Chrome → WebP) supporting `rakhi`, `diwali`, and `dussehra` themes; exports `generateCards()` and `THEMES`. |
| `card-specs.json` | Card-generation input: the 8 language-tagged card texts (`id`, `lang`, `text`) — note the live registry (`cards.ts`) now has 27 cards total across 3 festivals; `card-specs.json` predates all of that and only covers the original Rakhi batch. |
| `card-wish-ids.json` | List of wish IDs selected for card generation. |
| `wish-assignments.json` | Seed-batch mapping of wish `id` → `numeric_id`, `relation`, and `tones` used to generate the initial wish set. |

> Note: `scripts/` data files (`card-specs.json`, `card-wish-ids.json`, `wish-assignments.json`)
> are authoring-time inputs for the content/card generators, not consumed by the site at build time.

---

## 6. `public/` — static assets

| Path | Purpose |
|---|---|
| `_redirects` | Cloudflare Pages redirect rules: `rakhiwishes.in/* → festivalwishesindia.com/:splat` (301). |
| `favicon.ico`, `favicon.svg` | Site favicons (referenced from `BaseLayout`). |
| `og-default.svg` | Default Open Graph / social-share image. |
| `images/{rakhi,diwali,dussehra}/cards/*.webp` | 9 language-tagged shareable card images per festival (27 total): `<festival>-en-1/2/3`, `<festival>-hi-1/2/3`, `<festival>-hinglish-1/2/3` (Rakhi's Hinglish set is `hinglish-3/4/5` specifically, a historical numbering artifact). |
| `images/{rakhi,diwali,dussehra}/banner.webp` | One 1376×768 illustrated header banner per festival, shown above its tile on the `/{locale}/` homepage grid. Text-free (locale-agnostic). AI-generated by the owner (not built from an in-repo source/script — an earlier hand-authored SVG version was fully replaced 2026-08-27 after the owner's version came back higher quality); originals are JPGs converted to WebP, not committed to the repo — see HANDOVER.md §2 for provenance. |

Everything in `public/` is copied verbatim to the site root of the build output.

---

## 7. Key config files

### `astro.config.mjs`

- `site: 'https://festivalwishesindia.com'` — canonical base URL.
- `@astrojs/sitemap` integration with i18n config (default locale `en`, BCP-47 `hi-Latn` for Hinglish) and a filter that excludes thin (`/thin-`) and search (`/search`) pages.
- `i18n`: locales `en`/`hi`/`hinglish`, default `en`, `prefixDefaultLocale: true` (every URL is locale-prefixed).
- `build.format: 'directory'` — static output as `dist/…/index.html`.
- `image.service` — Sharp for image optimization.
- `vite.plugins` — Tailwind CSS v4 via `@tailwindcss/vite`.

### `package.json`

- **Engines:** Node `>=22.12.0`.
- **Scripts:**

| Script | Command | Purpose |
|---|---|---|
| `dev` | `astro dev` | Local dev server (localhost:4321). |
| `build` | `astro build` | Static production build → `dist/`. |
| `preview` | `astro preview` | Preview the production build locally. |
| `astro` | `astro` | Direct Astro CLI access. |
| `check` | `astro check` | Type-check the project. |
| `validate` | `node scripts/validate-content.mjs` | Validate content JSON. |
| `check:links` | `node scripts/check-links.mjs` | Check built site for dead links. |
| `ci` | `npm run validate && npm run build && npm run check:links` | Full CI gate. |

- **Dependencies:** `astro`, `@astrojs/sitemap`, `tailwindcss` + `@tailwindcss/vite`, `sharp`, `zod`.

### `tsconfig.json`

Extends `astro/tsconfigs/strict`; includes `.astro` generated types; excludes `dist/`.

---

## 8. URL routing model

All routes are locale-prefixed (`prefixDefaultLocale: true`). BCP-47: `hinglish → hi-Latn`.

| URL | Source file | Description |
|---|---|---|
| `/` | `src/pages/index.astro` | 301 → `/en/`. |
| `/{locale}/` | `[locale]/index.astro` | Locale home / festival picker. |
| `/{locale}/{festival}/` | `[locale]/[festival]/index.astro` | Festival hub (cards + wish tabs). |
| `/{locale}/{festival}/{collection}/` | `[locale]/[festival]/[collection].astro` | Collection page (relation-filtered). |
| `/{locale}/about\|contact\|privacy\|disclaimer/` | `[locale]/*.astro` | Trust/static pages. |
| `/robots.txt` | `robots.txt.ts` | Robots file. |

- **Collection slugs** come from `src/lib/collections.ts`: `short-wishes`, `brother-wishes`,
  `sister-wishes`, `bhaiya-bhabhi-wishes`, `whatsapp-messages`, `family-wishes`,
  `friend-wishes`, `parent-wishes`, `spouse-wishes`.
- **`noindex`:** collection pages with fewer than 3 approved wishes emit
  `<meta name="robots" content="noindex, follow">`; the sitemap filter additionally excludes
  `/thin-*` and `/search*` patterns (forward-looking).

---

## 9. Build & deploy commands

```bash
npm install        # first time (requires Node >=22.12.0)
npm run dev        # local dev server → http://localhost:4321 (or `astro dev --background`)
npm run build      # static build → dist/
npm run preview    # preview the production build locally
npm run check      # type-check (astro check)
npm run validate   # validate content JSON
npm run check:links# check dist/ for dead links / missing assets
npm run ci         # validate → build → check:links (full gate)
```

**Deploy (Cloudflare Pages):**

```bash
CLOUDFLARE_API_TOKEN="$(cat ~/.hermes/secrets/cloudflare-token)" \
CLOUDFLARE_ACCOUNT_ID="0ce865a7040b3f3b8ddf2ff1a2bf6afb" \
wrangler pages deploy dist --project-name festival-wishes-india
```

There is no `wrangler.toml` — deploys are driven entirely by CLI flags. Deploy credentials
live outside the repo under `~/.hermes/secrets/` (see `HANDOVER.md` §7 for details).
