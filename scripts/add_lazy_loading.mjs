// Agrega loading="lazy" a las imágenes de contenido (figuras, diagramas) en
// las 325 páginas sueltas de public/. Se excluye el logo del nav
// (logo_sin_fondo.png, visible sobre el fold en cada página) y cualquier
// <img> que ya declare loading=. Los 3 archivos de fuente JSX cruda
// (EPV12.HTML, POBA16.HTML, POBA17APENDIX.HTML) no tienen <img> HTML real
// y quedan fuera por la misma convención que el resto de scripts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const EXCLUDED = new Set(['EPV12.HTML', 'POBA16.HTML', 'POBA17APENDIX.HTML']);

const files = readdirSync(PUBLIC_DIR).filter(
  (f) => /\.html?$/i.test(f) && !EXCLUDED.has(f)
);

let filesChanged = 0;
let imgsChanged = 0;
let imgsSkipped = 0;

for (const file of files) {
  const path = join(PUBLIC_DIR, file);
  const html = readFileSync(path, 'utf8');
  let fileTouched = false;

  const updated = html.replace(/<img\b[^>]*>/gs, (tag) => {
    if (/\bloading\s*=/.test(tag)) {
      imgsSkipped++;
      return tag;
    }
    if (/src\s*=\s*["']logo_sin_fondo\.png["']/.test(tag)) {
      imgsSkipped++;
      return tag;
    }
    fileTouched = true;
    imgsChanged++;
    return tag.replace(/<img\b/, '<img loading="lazy"');
  });

  if (fileTouched) {
    writeFileSync(path, updated, 'utf8');
    filesChanged++;
  }
}

console.log(`Páginas modificadas: ${filesChanged}`);
console.log(`Imágenes con loading="lazy" agregado: ${imgsChanged}`);
console.log(`Imágenes omitidas (logo o ya tenían loading=): ${imgsSkipped}`);
