# Festival Wishes India — Launch Checklist

> Shared tracker. Agent updates `[agent]` rows; owner updates `[owner]` rows.
> Last updated: 2026-08-27 (homepage banners replaced with owner-supplied AI art, commit `a0547d2`)

**Status:** 🟢 LIVE at https://festivalwishesindia.com (initial deploy Aug 26 evening; latest
redeploy 2026-08-27, commit `a0547d2` — see HANDOVER.md §2).
`rakhiwishes.in` → `/en/rakhi/` 301 live. Rakhi 2026 content complete (51 wishes + 9 cards).
**Diwali and Dussehra 2026 content is deployed and owner-approved** (50 wishes + 9 cards each,
seed-batch approval given 2026-08-27 — see "Content — Diwali & Dussehra 2026" below and
HANDOVER.md §11). The researched festival dates themselves are still unconfirmed by the owner
(separate open item).

## Infrastructure
- [x] Buy festivalwishesindia.com (Cloudflare Registrar) — owner
- [x] Buy rakhiwishes.in (Spaceship) — owner
- [x] Point rakhiwishes.in nameservers to Cloudflare — owner
- [x] Create GitHub repo — owner
- [x] Astro 7 scaffold with i18n, content collections, components — agent
- [x] Build succeeds locally — agent
- [x] Push repo to GitHub — agent
- [x] Production deploy on festivalwishesindia.com — agent (live Aug 26)
- [x] Configure rakhiwishes.in 301 redirect → /en/rakhi/ — agent (live, verified)
- [x] Root `/` redirects to `/en/` — agent
- *Deploys are CLI-driven (`wrangler pages deploy`); Git auto-deploy (connect Pages to GitHub) is optional and not yet wired.*

## Content — Rakhi 2026 (Phase 1)
- [x] Generate English / Hindi / Hinglish Rakhi wishes — agent
- [x] Merge + de-duplicate + audit all 51 wishes (30 seed + 20 expansion, conversational Hindi rewrite) — agent
- [x] Generate 9 language-tagged card images (en/hi/hinglish) + src/lib/cards.ts registry — agent
- [x] Decouple cards from wish JSONs + hub "Shareable cards" gallery — agent
- [x] Tabbed wish listing (All 51 / Popular 12 / relation tabs) with numbering — agent
- [x] Owner seed-batch approval for Rakhi — owner (approved Aug 26)
- [x] Go-live — owner (Aug 26)

## Content — Diwali & Dussehra 2026 (Phase 2)
- [x] Diwali + Dussehra festival config (`src/content/festival/{diwali,dussehra}.json`), dates
  sourced from drikpanchang.com — agent (2026-08-27; `dateVerifiedBy: "reviewer-agent"`, not yet
  owner-confirmed — see HANDOVER.md §11)
- [x] Generalize the Rakhi-only card-generation script into a festival-parameterized one
  (`scripts/generate-cards.mjs`); fixed a real pixel-alignment bug found while validating it — agent
- [x] Add `spouse-wishes` collection (schema already supported `spouse`, no page existed for it) —
  agent
- [x] Generate 50 wishes each (family/friend/parent/spouse × en/hi/hinglish) for Diwali and
  Dussehra — agent (2026-08-27, commit `82fff8f`)
- [x] Generate 9 cards each (3 en/hi/hinglish) for Diwali and Dussehra — agent
- [x] Deploy to production — agent (2026-08-27, commit `82fff8f`)
- [x] Owner seed-batch approval for Diwali — owner (approved 2026-08-27)
- [x] Owner seed-batch approval for Dussehra — owner (approved 2026-08-27)
- [ ] Owner: sanity-check the researched dates (Diwali 8 Nov 2026, Dussehra 20 Oct 2026) against
  drikpanchang.com or another source — still open, not part of the seed-batch approval above
  ⏳ REMAINING

## Homepage
- [x] Illustrated header banner per festival (Rakhi, Diwali, Dussehra) on the `/{locale}/` festival
  grid — no text baked in, so one image works across all 3 locales.
  - First pass — agent (2026-08-27, commit `093ac69`): hand-authored SVG artwork (no stock images —
    nothing free/unlicensed existed for this subject; content-policy.md doesn't allow unattributed
    use of attribution-required stock). Went through 2 owner review rounds (abstract icons → full
    illustrated scenes → faceless silhouette treatment for Rakhi after two more-detailed hairstyle
    attempts read worse) before sign-off.
  - Replaced — owner (2026-08-27, commit `a0547d2`): owner generated notably higher-quality
    illustrated artwork via Claude Code Desktop's image tool and asked for a comparison; agent
    confirmed it was better and swapped it in wholesale, deleting the now-superseded
    `scripts/banners/*.svg` + `generate-banners.mjs`. Owner's Dussehra draft had bilingual text
    baked in — regenerated without text rather than accepted or cropped. **No in-repo source for
    the banners anymore** — committed directly as `public/images/{festival}/banner.webp`.

## Trust & Compliance
- [x] About page — agent
- [x] Contact page — agent
- [x] Privacy page — agent
- [x] Disclaimer page — agent
- [x] AI-assisted content disclosure (footer + about + disclaimer) — agent

## SEO & Discovery
- [x] Sitemap generation — agent
- [x] robots.txt — agent
- [x] hreflang + canonical — agent
- [x] OG image — agent
- [x] Search Console property + verification — owner (verified via DNS `google-site-verification`
  TXT record on `festivalwishesindia.com`, confirmed 2026-08-27)
- [x] Submit sitemap in GSC — owner (confirmed submitted 2026-08-27)

## Analytics & Monetization (post-launch)
- [x] ~~Cookieless event endpoint stub~~ — removed 2026-08-27: it 404'd on this static (non-SSR)
  Cloudflare Pages deploy and never actually recorded anything; see HANDOVER.md §2 — agent
- [x] Cloudflare Web Analytics enabled — owner, via the dashboard's **automatic** zone-level toggle
  (no JS beacon in page source by design — automatic mode collects RUM at the edge; confirmed with
  owner 2026-08-27, not independently verifiable via curl/DNS)
- [ ] AdSense application — owner (apply ~mid-Sep)  ⏳ REMAINING

### AdSense application — next steps
- [ ] Owner: review Google's AdSense program policies/eligibility (original content, clear nav, privacy
  policy) — this site already has about/contact/privacy/disclaimer pages, so should qualify
- [ ] Owner: submit application at adsense.google.com for `festivalwishesindia.com`
- [ ] Owner: hand the agent Google's site-ownership verification snippet (meta tag or JS) once issued
- [ ] Agent: wire the verification snippet into `BaseLayout.astro`'s `<head>`
- [ ] Owner: wait for Google's review (can take anywhere from a few days to a few weeks)
- [ ] Owner: once approved, get the Publisher ID (`pub-XXXXXXXXXXXXXXXX`) and per-slot ad unit IDs from
  the AdSense dashboard
- [ ] Agent: add `public/ads.txt` with the `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
  line (exact Publisher ID from owner)
- [ ] Agent: replace `AdSlot.astro`'s placeholder with the real AdSense loader script (`<head>`) and
  `<ins class="adsbygoogle">` markup, targeting the existing `data-ad-slot` names (`hub-top`,
  `hub-bottom`, `collection-top`, `collection-bottom`) — the toggle scaffold already exists, this is
  the only code change needed
- [ ] Agent: set `PUBLIC_ADS_ENABLED=true` in the Cloudflare Pages project's production env vars
- [ ] Owner: spot-check ad placement doesn't resemble/overlap the Copy/Download/Share buttons, per
  `agent-rules/publish-checklist.md`'s "ad slots do not resemble download or share controls" rule

- [ ] AdSense approval + ads enabled — future  ⏳ REMAINING
- [ ] Amazon Associates gift guides — future  ⏳ REMAINING

## Owner Blockers / Decisions
- [ ] Confirm rakhiwishes.in NIXI registrant-verification email was actioned  ⏳ REMAINING
- [ ] Real-device QA (Android Chrome + iOS Safari) by Aug 28 afternoon  ⏳ REMAINING
