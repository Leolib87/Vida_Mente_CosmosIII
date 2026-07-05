// El nav compartido (SiteNav.astro) coloreaba los íconos de sus 3
// categorías principales con clases Tailwind inventadas
// (text-neon-blue/green/purple/cyan) que Tailwind solo genera si la
// PROPIA página define un tailwind.config con esos colores. Solo 57 de
// las 325 páginas sueltas lo definían (con los mismos valores hex); en
// el resto — y en las 20 páginas Astro vía BaseLayout — la clase no
// existía y el ícono caía al color heredado (gris), en vez del color
// de acento previsto. Se reemplaza por el valor arbitrario de Tailwind
// (`text-[#hex]`), que funciona igual en cualquier página sin depender
// de un tailwind.config propio.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const REPLACEMENTS = [
  ['text-neon-blue', 'text-[#4f46e5]'],
  ['text-neon-green', 'text-[#10b981]'],
  ['text-neon-purple', 'text-[#a855f7]'],
  ['text-neon-cyan', 'text-[#06b6d4]'],
  ['border-neon-green', 'border-[#10b981]'],
  ['border-neon-purple', 'border-[#a855f7]'],
  ['border-neon-cyan', 'border-[#06b6d4]'],
];

const files = readdirSync(PUBLIC_DIR).filter((f) => /\.html?$/i.test(f));

let filesChanged = 0;
let totalReplacements = 0;

for (const file of files) {
  const path = join(PUBLIC_DIR, file);
  let html = readFileSync(path, 'utf8');
  let fileTouched = false;

  for (const [from, to] of REPLACEMENTS) {
    const occurrences = html.split(from).length - 1;
    if (occurrences === 0) continue;
    html = html.split(from).join(to);
    totalReplacements += occurrences;
    fileTouched = true;
  }

  if (fileTouched) {
    writeFileSync(path, html, 'utf8');
    filesChanged++;
  }
}

console.log(`Páginas modificadas: ${filesChanged}`);
console.log(`Clases de color reemplazadas: ${totalReplacements}`);
