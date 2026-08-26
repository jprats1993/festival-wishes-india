# Festival Wishes India — Launch Checklist

> Shared tracker. Agent updates `[agent]` rows; owner updates `[owner]` rows.
> Last updated: 2026-08-26 (post-go-live)

**Status:** 🟢 LIVE at https://festivalwishesindia.com (deployed Aug 26 evening).
`rakhiwishes.in` → `/en/rakhi/` 301 live. Rakhi 2026 content complete (51 wishes + 8 cards).

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
- [x] Generate 8 language-tagged card images (en/hi/hinglish) + src/lib/cards.ts registry — agent
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
- [ ] Search Console property + verification — owner (agent guides)  ⏳ REMAINING
- [ ] Submit sitemap in GSC — owner/agent  ⏳ REMAINING

## Analytics & Monetization (post-launch)
- [x] Cookieless event endpoint stub — agent
- [ ] Cloudflare Web Analytics enabled (beacon) — agent  ⏳ REMAINING
- [ ] AdSense application — owner (apply ~mid-Sep)  ⏳ REMAINING
- [ ] AdSense approval + ads enabled — future  ⏳ REMAINING
- [ ] Diwali festival content + Amazon Associates gift guides — future  ⏳ REMAINING

## Owner Blockers / Decisions
- [ ] Confirm rakhiwishes.in NIXI registrant-verification email was actioned  ⏳ REMAINING
- [ ] Real-device QA (Android Chrome + iOS Safari) by Aug 28 afternoon  ⏳ REMAINING
