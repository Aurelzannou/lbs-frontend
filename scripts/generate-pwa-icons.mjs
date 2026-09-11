/**
 * Génère les icônes PWA à partir des SVG maîtres.
 *   node scripts/generate-pwa-icons.mjs   (ou: npm run generate:icons)
 *
 * Sortie -> public/icons/*.png  (à committer).
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const NAVY = { r: 15, g: 23, b: 42, alpha: 1 }; // #0f172a

const standardSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

async function render(svgPath, size, outName, background) {
  const svg = await readFile(join(iconsDir, svgPath));
  const pipeline = sharp(svg, { density: 512 }).resize(size, size, {
    fit: 'contain',
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 }
  });
  if (background) pipeline.flatten({ background });
  await pipeline.png().toFile(join(iconsDir, outName));
  console.log('  ✓', outName);
}

console.log('Génération des icônes PWA…');

for (const size of standardSizes) {
  await render('icon-master.svg', size, `icon-${size}.png`);
}
for (const size of maskableSizes) {
  await render('icon-maskable.svg', size, `icon-maskable-${size}.png`);
}
// Apple touch icon : fond opaque obligatoire (iOS n'aime pas la transparence).
await render('icon-master.svg', 180, 'apple-touch-icon.png', NAVY);

console.log('Terminé.');
