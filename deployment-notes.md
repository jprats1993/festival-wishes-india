# Deployment Notes — Festival Wishes India

Deploys are performed via `wrangler pages deploy` (CLI), NOT git-integrated. Each deploy
produces a unique `*.festival-wishes-india.pages.dev` preview URL; the custom domain
`festivalwishesindia.com` always serves the latest production deploy on `main`.

## Deploy command (no secrets inline)
```bash
export CLOUDFLARE_API_TOKEN=$(cat ~/.hermes/secrets/cloudflare-token)
export CLOUDFLARE_ACCOUNT_ID=0ce865a7040b3f3b8ddf2ff1a2bf6afb
wrangler pages deploy dist --project-name festival-wishes-india --branch main
```

## Recent deploy history (newest first)
| Commit | What changed | Preview URL |
|---|---|---|
| `a0547d2` | Replaced SVG homepage banners with owner-supplied AI-illustrated artwork; deleted generate-banners.mjs/banners/*.svg | 67bcb761 |
| `093ac69` | Homepage festival header banners (original illustrated SVG->WebP art, 3 festivals) | be356eb3 |
| `82fff8f` | Diwali + Dussehra launch: 100 wishes, 18 cards, spouse-wishes collection | 57b918ec |
| `f766d5c` | Diwali/Dussehra scaffold: festival config, cards.ts festival-tagging, generalized card-gen script | (bundled with 82fff8f's deploy) |
| `ee21b1d` | Localized AdSlot house-promo text + footer nav labels (Contact/Privacy/Disclaimer) | a50204ea |
| `5e95b92` | Category tabs on collection subpages + localized festival names (displayNames) | f0970e7b |
| `e80aaa1` | Cache headers (`public/_headers`: HTML revalidate, hashed assets immutable) | aa78f2a7 |
| `1807a85` | +3 well-aligned Hinglish cards (5 total) | b4f445f6 |
| `a907958` | Language consistency (bhaiya-bhabhi typo, localized titles, Hindi spelling) + STRUCTURE.md | 555229a5 |
| `96a91f9` | Icon+label share buttons, robust copy fallback | fc696545 |
| `fa9cdd4` | Docs: seed approval + deploy marked complete | 72239d4f |
| `a13b628` | CI pipeline (validate+build+check:links), smoke-test exemption, dateVerifiedBy | (earlier) |
| `999c7b1` | Tabbed wish listing + numbering | — |
| `f8af333` | friend/parent collections, validate script, root → /en/ redirect | — |
| `e2c8c22` | **glob() loaders fix** (content collections were silently empty) | c4499410 |

## Redirects
- `rakhiwishes.in` → `https://festivalwishesindia.com/en/rakhi/` (301), implemented as a
  Cloudflare **Page Rule** on the `rakhiwishes.in` zone (API), not via `_redirects`.
- Root `/` → `/en/` via Astro `Astro.redirect('/en/', 301)`.

## Rollback
Re-deploy a previous commit:
```bash
git checkout <commit> && npm run build && wrangler pages deploy dist --project-name festival-wishes-india --branch main
git checkout main
```
Or in Cloudflare Dashboard → Pages → festival-wishes-india → Deployments → pick an older
deployment → "Rollback to this deployment".

## Rollout approval
Production deployment requires explicit owner approval. Local review first via
`npm run preview -- --port 4321`.
