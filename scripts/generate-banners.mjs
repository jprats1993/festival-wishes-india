// Render the homepage festival banners (scripts/banners/*.svg) to WebP.
// Same SVG -> headless Chrome -> WebP pipeline as generate-cards.mjs, but for the wider,
// text-free hero scenes used above each festival's tile on the homepage (not the greeting cards).
// Run with: node scripts/generate-banners.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP_DIR = join(__dirname, '.tmp-banners');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Logical SVG size is 800x500 (viewBox); rendered at 2x device scale for a crisp 1600x1000 WebP.
const WIDTH = 800;
const HEIGHT = 500;
const SCALE = 2;

const BANNERS = ['rakhi', 'diwali', 'dussehra'];

function renderPng(svgPath, pngPath) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    `--force-device-scale-factor=${SCALE}`,
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${pngPath}`,
    `file://${svgPath}`,
  ];
  execFileSync(CHROME, args, { stdio: 'ignore', timeout: 60000 });
}

async function main() {
  mkdirSync(TMP_DIR, { recursive: true });
  const results = [];

  for (const festival of BANNERS) {
    const svgPath = join(__dirname, 'banners', `${festival}.svg`);
    const pngPath = join(TMP_DIR, `${festival}.png`);
    const outDir = join(ROOT, 'public', 'images', festival);
    const webpPath = join(outDir, 'banner.webp');
    mkdirSync(outDir, { recursive: true });

    renderPng(svgPath, pngPath);

    const meta = await sharp(pngPath).metadata();
    const expectedW = WIDTH * SCALE;
    const expectedH = HEIGHT * SCALE;
    if (meta.width !== expectedW || meta.height !== expectedH) {
      results.push({ festival, status: 'FAIL', reason: `got ${meta.width}x${meta.height}, expected ${expectedW}x${expectedH}` });
      continue;
    }

    await sharp(pngPath).webp({ quality: 92 }).toFile(webpPath);
    results.push({ festival, status: 'OK', file: webpPath, dimensions: `${expectedW}x${expectedH}` });
  }

  console.log(JSON.stringify(results, null, 2));
  const allOk = results.every((r) => r.status === 'OK');
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(2);
});
