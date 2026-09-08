import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const root = join(process.cwd(), 'public', 'images');
const outRoot = process.env.PREVIEW_OUT || null;
const festivals = ['rakhi', 'diwali', 'dussehra'];

let totalBefore = 0;
let totalAfter = 0;

for (const festival of festivals) {
  const bannerPath = join(root, festival, 'banner.webp');
  const bannerOut = outRoot ? join(outRoot, festival, 'banner.webp') : bannerPath;
  const before = statSync(bannerPath).size;
  const buf = await sharp(bannerPath).resize(900, 563, { fit: 'cover' }).webp({ quality: 76 }).toBuffer();
  await sharp(buf).toFile(bannerOut);
  totalBefore += before;
  totalAfter += buf.length;
  console.log(`${festival}/banner.webp: ${before}B -> ${buf.length}B (${Math.round((1 - buf.length / before) * 100)}% smaller)`);

  const cardsDir = join(root, festival, 'cards');
  const files = readdirSync(cardsDir).filter((f) => f.endsWith('.webp'));
  for (const f of files) {
    const srcPath = join(cardsDir, f);
    const destPath = outRoot
      ? join(outRoot, festival, 'cards', f.replace(/\.webp$/, '-web.webp'))
      : join(cardsDir, f.replace(/\.webp$/, '-web.webp'));
    const before = statSync(srcPath).size;
    const buf = await sharp(srcPath).resize(640, 640, { fit: 'cover' }).webp({ quality: 82 }).toBuffer();
    await sharp(buf).toFile(destPath);
    totalBefore += before;
    totalAfter += buf.length;
    console.log(`${festival}/cards/${f} -> ${basename(destPath)}: ${before}B -> ${buf.length}B (${Math.round((1 - buf.length / before) * 100)}% smaller)`);
  }
}

console.log(`\nTotal: ${totalBefore}B -> ${totalAfter}B (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`);
