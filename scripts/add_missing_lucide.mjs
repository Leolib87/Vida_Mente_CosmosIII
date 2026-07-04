// El SiteNav inyectado en public/*.html usa lucide.createIcons() para
// dibujar todos sus íconos (data-lucide="..."), pero asume que la
// librería ya está cargada (en las páginas Astro la carga BaseLayout).
// 302 de las 325 páginas sueltas nunca tuvieron su propio <script> de
// Lucide, así que TODOS sus íconos (logo, menú, contacto, buscador...)
// quedan invisibles aunque el resto funcione. Se inyecta el mismo
// <script> que usa BaseLayout.astro, justo antes de </head>.
//
// Uso: node scripts/add_missing_lucide.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "../public");
const dryRun = process.argv.includes("--dry-run");

const lucideTag =
  '    <!-- Lucide: requerido por el nav compartido (SiteNav) -->\r\n' +
  '    <script src="https://unpkg.com/lucide@1.23.0/dist/umd/lucide.min.js" integrity="sha384-ouAVEJVCMsf8Svzn+BwqbaBhxBEA0xgeVBhHnxmWd+Wqyv18yhWCQwGegFD/OHLq" crossorigin="anonymous"></script>\r\n';

const files = fs.readdirSync(publicDir).filter((f) => /\.html$/i.test(f));

let injected = 0;
let alreadyHad = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let html = fs.readFileSync(filePath, "utf8");

  if (/<script[^>]*src=["'][^"']*lucide[^"']*["']/i.test(html)) {
    alreadyHad++;
    continue;
  }

  const headCloseCount = (html.match(/<\/head>/gi) || []).length;
  if (headCloseCount !== 1) {
    skipped++;
    console.log(`SKIP (sin </head> único): ${file}`);
    continue;
  }

  html = html.replace(/<\/head>/i, lucideTag + "</head>");

  if (!dryRun) fs.writeFileSync(filePath, html, "utf8");
  injected++;
}

console.log(`\nTotal HTML: ${files.length}`);
console.log(`Ya tenían lucide: ${alreadyHad}`);
console.log(`Inyectados: ${injected}${dryRun ? " (dry-run)" : ""}`);
console.log(`Omitidos: ${skipped}`);
