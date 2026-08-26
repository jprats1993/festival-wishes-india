// Minimal content validation: checks every wish/festival JSON has required fields
// and no duplicate IDs. Run with: npm run validate
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const wishDir = path.join(root, 'src/content/wish');
const festivalDir = path.join(root, 'src/content/festival');

const WISH_REQUIRED = ['id', 'festival', 'languages', 'relations', 'source', 'reviewStatus'];
const LANGS = ['en', 'hi', 'hinglish'];
const FESTIVAL_REQUIRED = ['slug', 'displayName', 'date', 'dateSourceUrl', 'languages'];

let errors = 0;

async function validateWishes() {
  const ids = new Set();
  const files = (await readdir(wishDir)).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const d = JSON.parse(await readFile(path.join(wishDir, f), 'utf8'));
    for (const k of WISH_REQUIRED) {
      if (!(k in d)) { console.error(`[wish/${f}] missing ${k}`); errors++; }
    }
    for (const l of LANGS) {
      if (!d.languages || typeof d.languages[l] !== 'string' || d.languages[l].length < 5) {
        console.error(`[wish/${f}] bad/empty language ${l}`); errors++;
      }
    }
    if (d.source !== 'original') { console.error(`[wish/${f}] source != original`); errors++; }
    if (ids.has(d.id)) { console.error(`[wish/${f}] duplicate id ${d.id}`); errors++; }
    ids.add(d.id);
  }
  console.log(`wish: ${files.length} files`);
}

async function validateFestivals() {
  const files = (await readdir(festivalDir)).filter((f) => f.endsWith('.json'));
  for (const f of files) {
    const d = JSON.parse(await readFile(path.join(festivalDir, f), 'utf8'));
    for (const k of FESTIVAL_REQUIRED) {
      if (!(k in d)) { console.error(`[festival/${f}] missing ${k}`); errors++; }
    }
  }
  console.log(`festival: ${files.length} files`);
}

await validateWishes();
await validateFestivals();

if (errors > 0) {
  console.error(`\n❌ ${errors} validation error(s)`);
  process.exit(1);
}
console.log('\n✅ Content valid');
