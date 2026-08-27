# Festival Wishes India — Launch Checklist

> Shared tracker. Agent updates `[agent]` rows; owner updates `[owner]` rows.
> Last updated: 2026-08-27 (Search Console + Cloudflare Web Analytics confirmed done)

**Status:** 🟢 LIVE at https://festivalwishesindia.com (initial deploy Aug 26 evening; bug-fix
redeploy 2026-08-27, commit `b96f1dc` — see HANDOVER.md §2).
`rakhiwishes.in` → `/en/rakhi/` 301 live. Rakhi 2026 content complete (51 wishes + 9 cards, reduced
from 11 on 2026-08-27 — see HANDOVER.md §2).

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
- [ ] Diwali festival content + Amazon Associates gift guides — future  ⏳ REMAINING

## Owner Blockers / Decisions
- [ ] Confirm rakhiwishes.in NIXI registrant-verification email was actioned  ⏳ REMAINING
- [ ] Real-device QA (Android Chrome + iOS Safari) by Aug 28 afternoon  ⏳ REMAINING
