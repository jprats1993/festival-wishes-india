// Static dead-link / missing-asset checker for the built site (dist/).
// Walks every HTML file, resolves internal href/src, verifies the target
// file exists. Ignores external URLs, mailto/tel/#, and /api/ endpoints.
// Run with: npm run check:links
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const SITE_HOST = 'festivalwishesindia.com';

let errors = 0;
let checked = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (e.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function resolveTarget(href, fromFile) {
  // strip fragment + query
  let h = href;
  const q = h.indexOf('?'); if (q !== -1) h = h.slice(0, q);
  const f = h.indexOf('#'); if (f !== -1) h = h.slice(0, f);
  if (!h) return null; // pure anchor

  // external
  if (/^https?:\/\//i.test(h)) {
    if (h.includes(SITE_HOST)) {
      const u = new URL(h);
      h = u.pathname;
    } else {
      return null; // external, skip
    }
  }
  if (/^(mailto:|tel:)/i.test(h)) return null;
  if (/^\/api\//i.test(h)) return null; // POST endpoint, no HTML
  if (/^(javascript:|data:)/i.test(h)) return null;

  if (h.startsWith('/')) {
    // absolute internal path
    const clean = h === '/' ? '/index.html' : h.endsWith('/') ? h + 'index.html' : h;
    return path.join(dist, clean.replace(/^\//, ''));
  }
  // relative
  const base = path.dirname(fromFile);
  return path.join(base, h);
}

async function fileExists(p) {
  if (!p) return true;
  try { await stat(p); return true; }
  catch { return false; }
}

const htmlFiles = await walk(dist);
console.log(`Checking ${htmlFiles.length} HTML files...`);

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const rel = path.relative(dist, file);

  // collect href and src targets
  const refs = [];
  const hrefRe = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const val = m[1];
    // only check links (href) and image src; skip <script src> and <link href> to css/astro
    const isImg = m[0].startsWith('src=') && (val.startsWith('/images/') || val.startsWith('images/'));
    const isLink = m[0].startsWith('href=') && !val.startsWith('/_astro/') && !val.includes('favicon') && !val.startsWith('data:');
    if (isImg || isLink) refs.push(val);
  }

  for (const ref of refs) {
    const target = resolveTarget(ref, file);
    if (target === null) continue;
    checked++;
    if (!(await fileExists(target))) {
      // ignore known non-HTML assets that are generated at runtime
      console.error(`[${rel}] dead ref: ${ref} → ${path.relative(dist, target)}`);
      errors++;
    }
  }
}

console.log(`\nChecked ${checked} references.`);
if (errors > 0) {
  console.error(`❌ ${errors} dead link(s)/missing asset(s)`);
  process.exit(1);
}
console.log('✅ No dead links or missing assets');
