// Optimiza los PNG pesados de public/ recomprimiéndolos EN SU MISMO NOMBRE
// (no se tocan los <img src> del HTML). Perfil "equilibrado":
//   - redimensiona a máx 1920px de ancho (sin agrandar los más chicos)
//   - cuantiza la paleta (palette:true) con calidad 82 -> ahorro fuerte tipo pngquant
// Reversible: los originales quedan en el historial de git.
//
// Uso: node scripts/optimizar_imagenes.mjs [--dry] [umbralMB]

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "public";
const MAX_WIDTH = 1920;
const QUALITY = 82;
const dry = process.argv.includes("--dry");
const thresholdMB = parseFloat(process.argv.find((a) => /^\d/.test(a))) || 1;
const THRESHOLD = thresholdMB * 1024 * 1024;

const mb = (n) => (n / 1024 / 1024).toFixed(2);

const pngs = readdirSync(DIR)
  .filter((f) => /\.png$/i.test(f))
  .map((f) => ({ f, path: join(DIR, f), size: statSync(join(DIR, f)).size }))
  .filter((x) => x.size >= THRESHOLD)
  .sort((a, b) => b.size - a.size);

let before = 0, after = 0, count = 0;
console.log(`Procesando ${pngs.length} PNG >= ${thresholdMB}MB (${dry ? "DRY-RUN" : "sobrescribiendo"})\n`);

for (const { f, path, size } of pngs) {
  const input = readFileSync(path);
  const meta = await sharp(input).metadata();
  let pipe = sharp(input);
  if (meta.width > MAX_WIDTH) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  const out = await pipe
    .png({ quality: QUALITY, compressionLevel: 9, effort: 10, palette: true })
    .toBuffer();

  before += size;
  after += out.length;
  count++;
  const pct = ((1 - out.length / size) * 100).toFixed(0);
  console.log(`  ${f}: ${mb(size)}MB -> ${mb(out.length)}MB (-${pct}%)  ${meta.width}x${meta.height}px`);
  if (!dry) writeFileSync(path, out);
}

console.log(`\nTotal: ${mb(before)}MB -> ${mb(after)}MB  (ahorro ${mb(before - after)}MB, ${count} archivos)`);
