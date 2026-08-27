# Festival Wishes India — Agent Guide

Static festival-greetings site (Hindi / English / Hinglish) deployed on Cloudflare Pages.

## Quick Reference
- **Stack:** Astro 7 (SSG, strict glob loaders) + Tailwind CSS v4 (`@tailwindcss/vite`) + Sharp.
- **Locales:** `en`, `hi` (Devanagari), `hinglish` (`hi-Latn`). All routes are prefixed: `/[locale]/[festival]/[collection]/`.
- **Docs Hierarchy:** `HANDOVER.md` (authoritative status) > `CHECKLIST.md` (tasks) > `STRUCTURE.md` (architecture).
- **Governance:** Read `agent-rules/` before generating content (`content-policy.md`, `editorial-style.md`, `festival-rules.md`).
- **Secrets:** Names only (`~/.hermes/secrets/github-token`, `~/.hermes/secrets/cloudflare-token`). Never echo or commit values.

## Key Commands
- `npm run ci` — Run before every deploy (`validate` + `build` + `check:links`). Must pass with 0 errors.
- `npm run dev` — Local development server (`astro dev`).
- `npm run validate` — Validate wish and festival JSON schemas.
- `npm run check:links` — Check built HTML for broken links and missing assets.

## Critical Guardrails
1. **Approval Gate:** Never deploy to production or publish new seed batches without explicit owner approval.
2. **Originality:** All wishes must be original (`source: "original"`). No scraped/copied content.
3. **Content Loaders:** In `src/content.config.ts`, always use explicit `glob({ pattern, base })` loaders.
