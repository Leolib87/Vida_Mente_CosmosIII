// 27 páginas apuntaban sus <img src> a
// https://github.com/Leolib87/Vida_Mente_CosmosII/blob/main/<archivo>?raw=true
// — el repo "CosmosII" (sin "III"), no este. Los 51 archivos referenciados
// ya existen localmente en public/, así que se reemplaza por la ruta
// relativa (más rápido, sin depender de un repo externo que puede
// renombrarse, borrarse o ponerse privado).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const PATTERN = /https:\/\/github\.com\/Leolib87\/Vida_Mente_CosmosII\/blob\/main\/([^"'?]+)\?raw=true/g;

const files = readdirSync(PUBLIC_DIR).filter((f) => /\.html?$/i.test(f));

let filesChanged = 0;
let linksChanged = 0;
let missing = [];

for (const file of files) {
  const path = join(PUBLIC_DIR, file);
  const html = readFileSync(path, 'utf8');
  if (!PATTERN.test(html)) continue;
  PATTERN.lastIndex = 0;

  const updated = html.replace(PATTERN, (match, filename) => {
    linksChanged++;
    return filename;
  });

  writeFileSync(path, updated, 'utf8');
  filesChanged++;
}

console.log(`Páginas corregidas: ${filesChanged}`);
console.log(`Enlaces reescritos a ruta relativa: ${linksChanged}`);
