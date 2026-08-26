// Generate 3 well-aligned Hinglish Rakhi SVG cards -> WebP.
// Text is Roman-script Hinglish only. Build as SVG, render via headless Chrome, verify alignment via sharp.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'images', 'rakhi', 'cards');
const TMP_DIR = join(__dirname, '.tmp-cards');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SIZE = 1024;

// ---- Card data: exact text (single source of truth) + balanced manual line breaks ----
const CARDS = [
  {
    id: 'rakhi-hinglish-3',
    text: 'Rakhi mubarak bhai! Tu hamesha mera hero rahega, kitne bhi jhagde ho.',
    lines: ['Rakhi mubarak bhai!', 'Tu hamesha mera hero rahega,', 'kitne bhi jhagde ho.'],
  },
  {
    id: 'rakhi-hinglish-4',
    text: 'Behen teri Rakhi, aur teri khushi dono ke liye ready hoon. Rakhi mubarak!',
    lines: ['Behen teri Rakhi,', 'aur teri khushi dono ke liye', 'ready hoon. Rakhi mubarak!'],
  },
  {
    id: 'rakhi-hinglish-5',
    text: 'Is Rakhi pe bas ek wish — tu khush rahe, aur hamesha meri side pe rahe.',
    lines: ['Is Rakhi pe bas ek wish —', 'tu khush rahe, aur hamesha', 'meri side pe rahe.'],
  },
];

// ---- Layout constants ----
const FONT_FAMILY = "Georgia, 'Times New Roman', 'Baskerville', serif";
const FONT_SIZE = 42;
const LINE_HEIGHT = 62;
const TEXT_COLOR = '#4A0E0E';
const PANEL_W = 840;
const PANEL_H = 298;
const PANEL_X = (SIZE - PANEL_W) / 2; // 92
const PANEL_Y = (SIZE - PANEL_H) / 2; // 363

function buildSvg(lines) {
  const n = lines.length;
  // Vertical centering: line i center = SIZE/2 - (n-1)*LH/2 + i*LH
  const firstCenter = SIZE / 2 - ((n - 1) * LINE_HEIGHT) / 2;
  const textEls = lines
    .map((line, i) => {
      const y = firstCenter + i * LINE_HEIGHT;
      return `<text x="${SIZE / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" fill="${TEXT_COLOR}">${escapeXml(line)}</text>`;
    })
    .join('\n    ');

  // 8 petals for corner flowers
  const petals = Array.from({ length: 8 }, (_, k) => {
    const a = k * 45;
    return `<ellipse cx="0" cy="-40" rx="12" ry="19" fill="#C0392B" transform="rotate(${a})"/>`;
  }).join('\n        ');

  // 12 dots ring for rakhi motif
  const rakhiDots = Array.from({ length: 12 }, (_, k) => {
    const a = (k * 30 * Math.PI) / 180;
    const cx = (40 * Math.cos(a)).toFixed(1);
    const cy = (40 * Math.sin(a)).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#E8B54A"/>`;
  }).join('\n        ');

  // scattered sparkles
  const sparkles = [
    [180, 200], [844, 200], [150, 640], [874, 640], [256, 470], [768, 470],
    [200, 820], [824, 820], [512, 96], [340, 150], [684, 150],
  ]
    .map(([x, y]) => `<use href="#sparkle" x="${x}" y="${y}"/>`)
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="36%" r="82%">
      <stop offset="0%" stop-color="#FFE9A8"/>
      <stop offset="38%" stop-color="#F5BE4C"/>
      <stop offset="70%" stop-color="#D97A2B"/>
      <stop offset="100%" stop-color="#9C3B16"/>
    </radialGradient>
    <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDF6"/>
      <stop offset="100%" stop-color="#FBF0D4"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="72%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#2A0703" stop-opacity="0.4"/>
    </radialGradient>
    <g id="sparkle">
      <path d="M0,-13 L2.6,-2.6 L13,0 L2.6,2.6 L0,13 L-2.6,2.6 L-13,0 L-2.6,-2.6 Z" fill="#FFF3C9" opacity="0.92"/>
    </g>
    <g id="cornerflower">
      <circle r="34" fill="#E8B54A"/>
      ${petals}
      <circle r="12" fill="#8A1C1C"/>
      <circle r="5" fill="#F5BE4C"/>
    </g>
    <g id="rakhi">
      <path d="M-140,0 C-70,-30 70,-30 140,0" fill="none" stroke="#8A1C1C" stroke-width="3" opacity="0.55"/>
      <circle r="48" fill="#C0392B"/>
      <circle r="48" fill="none" stroke="#E8B54A" stroke-width="5"/>
      <circle r="35" fill="#7A1F1F"/>
      <circle r="35" fill="none" stroke="#F5BE4C" stroke-width="3"/>
      ${rakhiDots}
      <circle r="18" fill="#E8B54A"/>
      <circle r="7" fill="#C0392B"/>
      <rect x="-1.6" y="48" width="3.2" height="52" fill="#8A1C1C"/>
      <circle cy="104" r="5.5" fill="#E8B54A"/>
      <rect x="-1.6" y="110" width="3.2" height="22" fill="#8A1C1C"/>
    </g>
    <g id="diya">
      <path d="M-30,0 Q0,-16 30,0 Q24,7 0,7 Q-24,7 -30,0 Z" fill="#8A1C1C"/>
      <rect x="-32" y="6" width="64" height="5" rx="2.5" fill="#7A1F1F"/>
      <path d="M0,-30 C7,-17 10,-8 0,0 C-10,-8 -7,-17 0,-30 Z" fill="#F5A623"/>
      <path d="M0,-22 C3.5,-15 4.5,-8 0,-3 C-4.5,-8 -3.5,-15 0,-22 Z" fill="#FFF3C9"/>
    </g>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <!-- soft dotted field -->
  <g fill="#FFF3C9" opacity="0.28">
    ${Array.from({ length: 60 }, (_, k) => {
      const x = ((k * 173) % 940) + 42;
      const y = ((k * 97) % 940) + 42;
      return `<circle cx="${x}" cy="${y}" r="2.4"/>`;
    }).join('')}
  </g>

  <!-- corner flowers -->
  <use href="#cornerflower" x="86" y="86"/>
  <use href="#cornerflower" x="${SIZE - 86}" y="86"/>
  <use href="#cornerflower" x="86" y="${SIZE - 86}"/>
  <use href="#cornerflower" x="${SIZE - 86}" y="${SIZE - 86}"/>

  <!-- top rakhi -->
  <use href="#rakhi" x="${SIZE / 2}" y="150"/>

  <!-- text panel (scrim) -->
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="26" fill="url(#panelGrad)" stroke="#8A1C1C" stroke-width="3"/>
  <rect x="${PANEL_X + 9}" y="${PANEL_Y + 9}" width="${PANEL_W - 18}" height="${PANEL_H - 18}" rx="20" fill="none" stroke="#E8B54A" stroke-width="2"/>

  <!-- text -->
  <g>
    ${textEls}
  </g>

  <!-- bottom diyas -->
  <use href="#diya" x="${SIZE / 2 - 150}" y="880"/>
  <use href="#diya" x="${SIZE / 2 + 150}" y="880"/>
  <g fill="#C0392B">
    <rect x="${SIZE / 2 - 34}" y="896" width="12" height="12" rx="2" transform="rotate(45 ${SIZE / 2 - 28} 902)"/>
    <rect x="${SIZE / 2 - 6}" y="896" width="12" height="12" rx="2" transform="rotate(45 ${SIZE / 2} 902)"/>
    <rect x="${SIZE / 2 + 22}" y="896" width="12" height="12" rx="2" transform="rotate(45 ${SIZE / 2 + 28} 902)"/>
  </g>

  <!-- sparkles -->
  ${sparkles}

  <!-- double border -->
  <rect x="28" y="28" width="${SIZE - 56}" height="${SIZE - 56}" rx="44" fill="none" stroke="#8A1C1C" stroke-width="4"/>
  <rect x="39" y="39" width="${SIZE - 78}" height="${SIZE - 78}" rx="38" fill="none" stroke="#E8B54A" stroke-width="2.5"/>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)"/>
</svg>
`;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderPng(svgPath, pngPath) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1024,1024',
    `--screenshot=${pngPath}`,
    `file://${svgPath}`,
  ];
  execFileSync(CHROME, args, { stdio: 'ignore', timeout: 60000 });
}

// Analyze rendered PNG: locate dark text pixels inside the panel region and verify centering + no clipping.
async function verifyAlignment(pngPath) {
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Panel inner analysis window (safely inside panel, excludes gold/maroon border lines)
  const AX0 = PANEL_X + 40;
  const AX1 = PANEL_X + PANEL_W - 40;
  const AY0 = PANEL_Y + 40;
  const AY1 = PANEL_Y + PANEL_H - 40;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, count = 0;
  for (let y = AY0; y < AY1; y++) {
    for (let x = AX0; x < AX1; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // text is very dark maroon (#4A0E0E)
      if (r < 110 && g < 110 && b < 110) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        count++;
      }
    }
  }

  if (count === 0) {
    return { ok: false, reason: 'no text pixels found', width, height };
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;

  const marginL = minX - PANEL_X;
  const marginR = PANEL_X + PANEL_W - maxX;
  const marginT = minY - PANEL_Y;
  const marginB = PANEL_Y + PANEL_H - maxY;

  const checks = {
    dimensions: width === SIZE && height === SIZE,
    centerX: Math.abs(cx - SIZE / 2) <= 5,
    centerY: Math.abs(cy - SIZE / 2) <= 5,
    noHorizontalClipping: marginL >= 50 && marginR >= 50,
    noVerticalClipping: marginT >= 50 && marginB >= 50,
  };
  const ok = Object.values(checks).every(Boolean);

  return {
    ok,
    width,
    height,
    textPixelCount: count,
    bbox: { minX, minY, maxX, maxY, cx: +cx.toFixed(1), cy: +cy.toFixed(1), w: bw, h: bh },
    margins: { left: marginL, right: marginR, top: marginT, bottom: marginB },
    checks,
  };
}

async function main() {
  mkdirSync(TMP_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });
  const results = [];

  for (const card of CARDS) {
    const svgPath = join(TMP_DIR, `${card.id}.svg`);
    const pngPath = join(TMP_DIR, `${card.id}.png`);
    const webpPath = join(OUT_DIR, `${card.id}.webp`);

    const svg = buildSvg(card.lines);
    writeFileSync(svgPath, svg);
    renderPng(svgPath, pngPath);

    // ensure exact 1024x1024
    const meta = await sharp(pngPath).metadata();
    if (meta.width !== SIZE || meta.height !== SIZE) {
      await sharp(pngPath).resize(SIZE, SIZE, { fit: 'fill' }).png().toFile(pngPath + '.resized');
      await sharp(pngPath + '.resized').toFile(pngPath);
    }

    const verify = await verifyAlignment(pngPath);
    if (!verify.ok) {
      results.push({ id: card.id, status: 'FAIL', verify });
      continue;
    }

    // Convert to WebP (high quality)
    await sharp(pngPath).webp({ quality: 92 }).toFile(webpPath);

    results.push({
      id: card.id,
      status: 'OK',
      file: webpPath,
      verify: {
        bbox: verify.bbox,
        margins: verify.margins,
        textPixelCount: verify.textPixelCount,
        dimensions: verify.width + 'x' + verify.height,
      },
    });
  }

  console.log(JSON.stringify(results, null, 2));
  const allOk = results.every((r) => r.status === 'OK');
  process.exit(allOk ? 0 : 1);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(2);
});
