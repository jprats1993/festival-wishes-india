// Generate festival greeting-card SVGs -> WebP, festival-parameterized.
// Generalized from the original Rakhi-only generate-hinglish-cards.mjs (kept as-is for its
// existing 3 Hinglish Rakhi cards; this script is for Diwali/Dussehra and any future festival).
// Build as SVG, render via headless Chrome, verify text alignment via sharp, then convert to WebP.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TMP_DIR = join(__dirname, '.tmp-cards');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const SIZE = 1024;
const FONT_FAMILY = "Georgia, 'Times New Roman', 'Baskerville', serif";
const FONT_SIZE = 42;
const LINE_HEIGHT = 62;
const PANEL_W = 840;
const PANEL_H = 298;
const PANEL_X = (SIZE - PANEL_W) / 2;
const PANEL_Y = (SIZE - PANEL_H) / 2;

// ---- Per-festival visual themes ----
// Each theme supplies: background gradient stops, panel/border/text colors, and the motif <defs>
// + placement markup (top ornament, corner ornament, bottom accent). Panel layout/typography stay
// identical across festivals so every card reads as the same product.
export const THEMES = {
  rakhi: {
    bgStops: [
      ['0%', '#FFE9A8'],
      ['38%', '#F5BE4C'],
      ['70%', '#D97A2B'],
      ['100%', '#9C3B16'],
    ],
    panelGrad: [['0%', '#FFFDF6'], ['100%', '#FBF0D4']],
    borderColor: '#8A1C1C',
    goldColor: '#E8B54A',
    textColor: '#4A0E0E',
    motifDefs: `
      <g id="cornerflower">
        <circle r="34" fill="#E8B54A"/>
        ${Array.from({ length: 8 }, (_, k) => `<ellipse cx="0" cy="-40" rx="12" ry="19" fill="#C0392B" transform="rotate(${k * 45})"/>`).join('\n        ')}
        <circle r="12" fill="#8A1C1C"/>
        <circle r="5" fill="#F5BE4C"/>
      </g>
      <g id="topmotif">
        <path d="M-140,0 C-70,-30 70,-30 140,0" fill="none" stroke="#8A1C1C" stroke-width="3" opacity="0.55"/>
        <circle r="48" fill="#C0392B"/>
        <circle r="48" fill="none" stroke="#E8B54A" stroke-width="5"/>
        <circle r="35" fill="#7A1F1F"/>
        <circle r="35" fill="none" stroke="#F5BE4C" stroke-width="3"/>
        ${Array.from({ length: 12 }, (_, k) => {
          const a = (k * 30 * Math.PI) / 180;
          return `<circle cx="${(40 * Math.cos(a)).toFixed(1)}" cy="${(40 * Math.sin(a)).toFixed(1)}" r="3.2" fill="#E8B54A"/>`;
        }).join('\n        ')}
        <circle r="18" fill="#E8B54A"/>
        <circle r="7" fill="#C0392B"/>
        <rect x="-1.6" y="48" width="3.2" height="52" fill="#8A1C1C"/>
        <circle cy="104" r="5.5" fill="#E8B54A"/>
        <rect x="-1.6" y="110" width="3.2" height="22" fill="#8A1C1C"/>
      </g>
      <g id="bottommotif">
        <path d="M-30,0 Q0,-16 30,0 Q24,7 0,7 Q-24,7 -30,0 Z" fill="#8A1C1C"/>
        <rect x="-32" y="6" width="64" height="5" rx="2.5" fill="#7A1F1F"/>
        <path d="M0,-30 C7,-17 10,-8 0,0 C-10,-8 -7,-17 0,-30 Z" fill="#F5A623"/>
        <path d="M0,-22 C3.5,-15 4.5,-8 0,-3 C-4.5,-8 -3.5,-15 0,-22 Z" fill="#FFF3C9"/>
      </g>`,
    topUse: `<use href="#topmotif" x="${SIZE / 2}" y="150"/>`,
    bottomUse: `<use href="#bottommotif" x="${SIZE / 2 - 150}" y="880"/>\n  <use href="#bottommotif" x="${SIZE / 2 + 150}" y="880"/>`,
  },
  diwali: {
    bgStops: [
      ['0%', '#FFE9A8'],
      ['38%', '#F5A623'],
      ['70%', '#C2410C'],
      ['100%', '#5B1A0E'],
    ],
    panelGrad: [['0%', '#FFFDF6'], ['100%', '#FBE9C8']],
    borderColor: '#7A1F1F',
    goldColor: '#E8B54A',
    textColor: '#5B1A0E',
    motifDefs: `
      <g id="cornerflower">
        <circle r="34" fill="#E8B54A"/>
        ${Array.from({ length: 8 }, (_, k) => `<ellipse cx="0" cy="-40" rx="12" ry="19" fill="#C2410C" transform="rotate(${k * 45})"/>`).join('\n        ')}
        <circle r="12" fill="#7A1F1F"/>
        <circle r="5" fill="#F5A623"/>
      </g>
      <g id="topmotif">
        <path d="M-110,10 Q0,-40 110,10" fill="none" stroke="#7A1F1F" stroke-width="3" opacity="0.5"/>
        <circle r="20" fill="#F5A623"/>
        <circle r="20" fill="none" stroke="#E8B54A" stroke-width="4"/>
        ${Array.from({ length: 8 }, (_, k) => {
          const a = (k * 45 * Math.PI) / 180;
          return `<circle cx="${(34 * Math.cos(a)).toFixed(1)}" cy="${(34 * Math.sin(a)).toFixed(1)}" r="4" fill="#E8B54A"/>`;
        }).join('\n        ')}
      </g>
      <g id="bottommotif">
        <path d="M-30,0 Q0,-16 30,0 Q24,7 0,7 Q-24,7 -30,0 Z" fill="#7A1F1F"/>
        <rect x="-32" y="6" width="64" height="5" rx="2.5" fill="#5B1A0E"/>
        <path d="M0,-30 C7,-17 10,-8 0,0 C-10,-8 -7,-17 0,-30 Z" fill="#F5A623"/>
        <path d="M0,-22 C3.5,-15 4.5,-8 0,-3 C-4.5,-8 -3.5,-15 0,-22 Z" fill="#FFF3C9"/>
      </g>`,
    topUse: `<use href="#topmotif" x="${SIZE / 2}" y="150"/>`,
    bottomUse: `<use href="#bottommotif" x="${SIZE / 2 - 150}" y="880"/>\n  <use href="#bottommotif" x="${SIZE / 2 + 150}" y="880"/>`,
  },
  dussehra: {
    bgStops: [
      ['0%', '#FFE0B2'],
      ['38%', '#F57C00'],
      ['70%', '#B7410E'],
      ['100%', '#4A1509'],
    ],
    panelGrad: [['0%', '#FFFBF3'], ['100%', '#FCE8CE']],
    borderColor: '#5C2E0A',
    goldColor: '#D4A017',
    textColor: '#4A1509',
    motifDefs: `
      <g id="cornerflower">
        <circle r="32" fill="#D4A017"/>
        ${Array.from({ length: 10 }, (_, k) => `<ellipse cx="0" cy="-38" rx="10" ry="17" fill="#F57C00" transform="rotate(${k * 36})"/>`).join('\n        ')}
        <circle r="11" fill="#5C2E0A"/>
        <circle r="4.5" fill="#FFD46A"/>
      </g>
      <g id="topmotif">
        <!-- stylized bow + arrow, marking Lord Rama's victory -->
        <path d="M0,-40 A44,44 0 0 1 0,40" fill="none" stroke="#5C2E0A" stroke-width="4"/>
        <line x1="0" y1="-40" x2="0" y2="40" stroke="#D4A017" stroke-width="2" opacity="0.7"/>
        <line x1="-58" y1="0" x2="8" y2="0" stroke="#5C2E0A" stroke-width="3"/>
        <path d="M8,0 L-6,-7 L-6,7 Z" fill="#5C2E0A"/>
      </g>
      <g id="bottommotif">
        <!-- marigold (genda phool) cluster, traditional Dussehra/Navratri flower -->
        ${Array.from({ length: 6 }, (_, k) => `<ellipse cx="0" cy="-14" rx="9" ry="14" fill="#F57C00" transform="rotate(${k * 60})"/>`).join('\n        ')}
        <circle r="8" fill="#D4A017"/>
      </g>`,
    topUse: `<use href="#topmotif" x="${SIZE / 2}" y="150"/>`,
    bottomUse: `<use href="#bottommotif" x="${SIZE / 2 - 150}" y="880"/>\n  <use href="#bottommotif" x="${SIZE / 2 + 150}" y="880"/>`,
  },
};

function buildSvg(lines, theme) {
  const n = lines.length;
  const firstCenter = SIZE / 2 - ((n - 1) * LINE_HEIGHT) / 2;
  const textEls = lines
    .map((line, i) => {
      const y = firstCenter + i * LINE_HEIGHT;
      return `<text x="${SIZE / 2}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" fill="${theme.textColor}">${escapeXml(line)}</text>`;
    })
    .join('\n    ');

  const bgStops = theme.bgStops.map(([off, c]) => `<stop offset="${off}" stop-color="${c}"/>`).join('\n      ');
  const panelStops = theme.panelGrad.map(([off, c]) => `<stop offset="${off}" stop-color="${c}"/>`).join('\n      ');

  const sparkles = [
    [180, 200], [844, 200], [150, 640], [874, 640], [256, 470], [768, 470],
    [200, 820], [824, 820], [512, 96], [340, 150], [684, 150],
  ]
    .map(([x, y]) => `<use href="#sparkle" x="${x}" y="${y}"/>`)
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="36%" r="82%">
      ${bgStops}
    </radialGradient>
    <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
      ${panelStops}
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="72%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="${theme.textColor}" stop-opacity="0.4"/>
    </radialGradient>
    <g id="sparkle">
      <path d="M0,-13 L2.6,-2.6 L13,0 L2.6,2.6 L0,13 L-2.6,2.6 L-13,0 L-2.6,-2.6 Z" fill="#FFF3C9" opacity="0.92"/>
    </g>
    ${theme.motifDefs}
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <g fill="#FFF3C9" opacity="0.28">
    ${Array.from({ length: 60 }, (_, k) => {
      const x = ((k * 173) % 940) + 42;
      const y = ((k * 97) % 940) + 42;
      return `<circle cx="${x}" cy="${y}" r="2.4"/>`;
    }).join('')}
  </g>

  <use href="#cornerflower" x="86" y="86"/>
  <use href="#cornerflower" x="${SIZE - 86}" y="86"/>
  <use href="#cornerflower" x="86" y="${SIZE - 86}"/>
  <use href="#cornerflower" x="${SIZE - 86}" y="${SIZE - 86}"/>

  ${theme.topUse}

  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="26" fill="url(#panelGrad)" stroke="${theme.borderColor}" stroke-width="3"/>
  <rect x="${PANEL_X + 9}" y="${PANEL_Y + 9}" width="${PANEL_W - 18}" height="${PANEL_H - 18}" rx="20" fill="none" stroke="${theme.goldColor}" stroke-width="2"/>

  <g>
    ${textEls}
  </g>

  ${theme.bottomUse}

  ${sparkles}

  <rect x="28" y="28" width="${SIZE - 56}" height="${SIZE - 56}" rx="44" fill="none" stroke="${theme.borderColor}" stroke-width="4"/>
  <rect x="39" y="39" width="${SIZE - 78}" height="${SIZE - 78}" rx="38" fill="none" stroke="${theme.goldColor}" stroke-width="2.5"/>

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

// Analyze rendered PNG: locate dark text pixels inside the panel region and verify centering + no
// clipping. Threshold is derived from the theme's text color so it works for any sufficiently dark,
// saturated ink color (all current theme text colors are dark enough that r,g,b < 110 still holds).
async function verifyAlignment(pngPath) {
  const { data, info } = await sharp(pngPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const AX0 = PANEL_X + 40;
  const AX1 = PANEL_X + PANEL_W - 40;
  const AY0 = PANEL_Y + 40;
  const AY1 = PANEL_Y + PANEL_H - 40;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, count = 0;
  for (let y = AY0; y < AY1; y++) {
    for (let x = AX0; x < AX1; x++) {
      const i = (y * width + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
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
    bbox: { minX, minY, maxX, maxY, cx: +cx.toFixed(1), cy: +cy.toFixed(1) },
    margins: { left: marginL, right: marginR, top: marginT, bottom: marginB },
    checks,
  };
}

// cards: [{ id, festival, lines }]. Output: public/images/{festival}/cards/{id}.webp
export async function generateCards(cards) {
  mkdirSync(TMP_DIR, { recursive: true });
  const results = [];

  for (const card of cards) {
    const theme = THEMES[card.festival];
    if (!theme) throw new Error(`No theme for festival "${card.festival}"`);

    const outDir = join(ROOT, 'public', 'images', card.festival, 'cards');
    mkdirSync(outDir, { recursive: true });

    const svgPath = join(TMP_DIR, `${card.id}.svg`);
    const pngPath = join(TMP_DIR, `${card.id}.png`);
    const webpPath = join(outDir, `${card.id}.webp`);

    const svg = buildSvg(card.lines, theme);
    writeFileSync(svgPath, svg);
    renderPng(svgPath, pngPath);

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

  return results;
}
