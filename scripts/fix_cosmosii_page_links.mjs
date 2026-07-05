// 10 páginas de la serie "De Máquinas y Seres Vivos" tienen enlaces de
// navegación (menú, "volver a portada", capítulos) que apuntan al sitio
// viejo https://leolib87.github.io/Vida_Mente_CosmosII/ en vez de usar
// rutas relativas dentro de este sitio. Las páginas destino ya existen en
// public/, así que se reescribe a ruta relativa (la raíz del sitio viejo
// pasa a index.html, siguiendo la convención del resto del sitio).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PATTERN = /https:\/\/leolib87\.github\.io\/Vida_Mente_CosmosII\/([^"]*)/g;

const files = readdirSync(PUBLIC_DIR).filter((f) => /\.html?$/i.test(f));

let filesChanged = 0;
let linksChanged = 0;

for (const file of files) {
  const path = join(PUBLIC_DIR, file);
  const html = readFileSync(path, 'utf8');
  if (!PATTERN.test(html)) continue;
  PATTERN.lastIndex = 0;

  const updated = html.replace(PATTERN, (match, target) => {
    linksChanged++;
    return target === '' ? 'index.html' : target;
  });

  writeFileSync(path, updated, 'utf8');
  filesChanged++;
}

console.log(`Páginas corregidas: ${filesChanged}`);
console.log(`Enlaces reescritos a ruta relativa: ${linksChanged}`);
