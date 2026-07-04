// Inyecta el buscador global (CSS + botón + modal + JS) que ya vive en
// SiteNav.astro dentro de las páginas HTML sueltas de public/, siguiendo
// el mismo patrón que las inyecciones anteriores (theme.css, SiteNav
// completo): additivo, idempotente, no toca el resto del archivo.
//
// Los 4 bloques se extraen de SiteNav.astro (única fuente de verdad) en
// vez de duplicarlos a mano, para no desincronizarse si el buscador
// cambia ahí en el futuro. Los archivos de public/ usan CRLF, igual que
// SiteNav.astro, así que las regex usan \r?\n en vez de \n a secas.
//
// Uso: node scripts/inject_search.mjs           (aplica a todo public/*.html)
//      node scripts/inject_search.mjs --dry-run (solo reporta, no escribe)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptDir, "..");
const publicDir = path.join(repoRoot, "public");
const navPath = path.join(repoRoot, "src/components/SiteNav.astro");
const dryRun = process.argv.includes("--dry-run");

const nav = fs.readFileSync(navPath, "utf8");

function extract(re, label) {
  const m = nav.match(re);
  if (!m) throw new Error(`No se pudo extraer el bloque "${label}" de SiteNav.astro (¿cambió el marcador?)`);
  return m[1];
}

// 1. CSS: entre el comentario "Buscador global" y la regla .search-empty
const cssBlock = extract(
  /(\/\* Buscador global \*\/[\s\S]*?\.search-empty \{[^\r\n]*\}\r?\n)/,
  "CSS"
);

// 2. Botón trigger: comentario "Buscador" + <button id="search-trigger">...</button>
const triggerBlock = extract(
  /(<!-- Buscador -->\r?\n\s*<button id="search-trigger"[\s\S]*?<\/button>\r?\n)/,
  "botón trigger"
);

// 3. Modal: comentario "overlay + modal" hasta su </div> de cierre, antes del <script>
const modalBlock = extract(
  /(<!-- Buscador global: overlay \+ modal -->[\s\S]*?<\/div>\r?\n {2}<\/div>\r?\n)\r?\n<script/,
  "modal"
);

// 4. Script: comentario "construye su índice" + el <script is:inline>...</script> completo
const scriptBlockRaw = extract(
  /(<!-- Buscador global: construye su índice[\s\S]*?<\/script>)\s*$/,
  "script"
).replace(/<script is:inline>/, "<script>");

const files = fs.readdirSync(publicDir).filter((f) => /\.html$/i.test(f));

let injected = 0;
let alreadyHad = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes('id="search-trigger"')) {
    alreadyHad++;
    continue;
  }

  const hasCssAnchor = content.includes(".accordion-btn.active svg { transform: rotate(180deg); }");
  const hasTriggerAnchor = content.includes('<button id="mobile-toggle"');
  const hasModalAnchor = content.includes("Content Injected via JS");
  const hasScriptAnchor = content.includes("initMobileMenuFromDesktop();");

  if (!hasCssAnchor || !hasTriggerAnchor || !hasModalAnchor || !hasScriptAnchor) {
    skipped++;
    console.log(`SKIP (sin los 4 anchors esperados): ${file}`);
    continue;
  }

  content = content.replace(
    ".accordion-btn.active svg { transform: rotate(180deg); }",
    ".accordion-btn.active svg { transform: rotate(180deg); }\r\n\r\n" + cssBlock.trimEnd()
  );

  content = content.replace(
    /<!-- Mobile Trigger -->\r?\n(\s*)<button id="mobile-toggle"/,
    (_, indent) => triggerBlock + "\r\n" + indent + "<!-- Mobile Trigger -->\r\n" + indent + '<button id="mobile-toggle"'
  );

  content = content.replace(
    /(<!-- Content Injected via JS -->\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n)/,
    (m) => m + "\r\n" + modalBlock
  );

  content = content.replace(
    /(initMobileMenuFromDesktop\(\);\s*\r?\n\s*\}\);\s*\r?\n<\/script>)/,
    (m) => m + "\r\n\r\n" + scriptBlockRaw
  );

  if (dryRun) {
    console.log(`(dry-run) inyectaría: ${file}`);
  } else {
    fs.writeFileSync(filePath, content, "utf8");
  }
  injected++;
}

console.log(`\nTotal HTML: ${files.length}`);
console.log(`Ya tenían buscador: ${alreadyHad}`);
console.log(`Inyectados: ${injected}${dryRun ? " (dry-run, no se escribió nada)" : ""}`);
console.log(`Omitidos (sin anchors): ${skipped}`);
