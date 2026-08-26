# Festival Wishes India — Launch Checklist

> Shared tracker. Agent updates `[agent]` rows; owner updates `[owner]` rows.
> Last updated: 2026-08-26

## Infrastructure
- [x] Buy festivalwishesindia.com (Cloudflare Registrar) — owner
- [x] Buy rakhiwishes.in (Spaceship) — owner
- [x] Point rakhiwishes.in nameservers to Cloudflare — owner
- [x] Create GitHub repo — owner
- [x] Astro 7 scaffold with i18n, content collections, components — agent
- [x] Build succeeds locally — agent
- [x] Push repo to GitHub — agent
- [ ] Connect Cloudflare Pages to GitHub — agent
- [ ] Production deploy on festivalwishesindia.com — agent
- [ ] Configure rakhiwishes.in 301 redirect to festivalwishesindia.com — agent

## Content — Rakhi 2026 (Phase 1)
- [x] Generate English Rakhi wishes (10) — agent
- [x] Generate Hindi Rakhi wishes (10) — agent
- [x] Generate Hinglish Rakhi wishes (10) — agent
- [x] Merge + de-duplicate + audit all 30 wishes — agent
- [x] Generate 8-10 card images (square + portrait) — agent
- [x] Update wish JSONs with imageAssets + altText — agent
- [x] Final build with content passes — agent
- [ ] Owner seed-batch approval for Rakhi — owner
- [ ] Real-device QA (Android Chrome + iOS Safari) — owner
- [ ] Go-live — owner

## Trust & Compliance
- [x] About page — agent
- [x] Contact page — agent
- [x] Privacy page — agent
- [x] Disclaimer page — agent
- [ ] AI-assisted content disclosure — agent

## SEO & Discovery
- [x] Sitemap generation — agent
- [x] robots.txt — agent
- [x] hreflang + canonical — agent
- [x] OG image — agent
- [ ] Search Console property + verification — owner (agent guides)
- [ ] Submit sitemap in GSC — owner/agent

## Analytics & Monetization (post-launch)
- [x] Cookieless event endpoint stub — agent
- [ ] Cloudflare Web Analytics enabled — agent
- [ ] AdSense application prepared — owner (apply mid-Sep when agent signals)
- [ ] AdSense approval + ads enabled — future
- [ ] Amazon Associates + gift guides — future (Diwali)

## Owner Blockers / Decisions Needed
- [ ] Confirm rakhiwishes.in NIXI registrant-verification email clicked
- [ ] Approve final Rakhi seed batch before go-live
- [ ] Provide Cloudflare API token for Pages/DNS automation
- [ ] Real-device QA results by Aug 28 afternoon
