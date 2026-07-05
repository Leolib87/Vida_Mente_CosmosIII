// Inyecta el favicon (logo_sin_fondo.png) en las 325 páginas sueltas de public/,
// que hoy no declaran ningún <link rel="icon">. Sigue el mismo patrón de
// reemplazo seguro que add_missing_lucide.mjs: split/join por string exacto,
// verificando el conteo de ocurrencias antes de escribir.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const ANCHOR = '<link rel="stylesheet" href="theme.css">';
const FAVICON = '<link rel="icon" type="image/png" href="logo_sin_fondo.png">';

const files = readdirSync(PUBLIC_DIR).filter((f) => /\.html?$/i.test(f));

let changed = 0;
let skipped = 0;

for (const file of files) {
  const path = join(PUBLIC_DIR, file);
  const html = readFileSync(path, 'utf8');

  if (html.includes('rel="icon"')) {
    skipped++;
    continue;
  }

  const occurrences = html.split(ANCHOR).length - 1;
  if (occurrences !== 1) {
    console.warn(`SKIP (${occurrences} ocurrencias de ancla): ${file}`);
    skipped++;
    continue;
  }

  const updated = html.split(ANCHOR).join(`${ANCHOR}\n    ${FAVICON}`);
  writeFileSync(path, updated, 'utf8');
  changed++;
}

console.log(`Favicon inyectado en ${changed} páginas. Omitidas: ${skipped}.`);
