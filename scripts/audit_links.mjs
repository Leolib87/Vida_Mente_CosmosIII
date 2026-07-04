// Audita los href="" de SiteNav.astro contra los archivos reales de public/
// y las páginas de src/pages/, para encontrar enlaces rotos (case-sensitivity,
// espacios sobrantes, anclajes que no existen en ningún lado).
// Uso: node scripts/audit_links.mjs   (desde la raíz del repo)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.argv[2] || path.join(scriptDir, "..");
const navPath = path.join(repoRoot, "src/components/SiteNav.astro");
const publicDir = path.join(repoRoot, "public");
const pagesDir = path.join(repoRoot, "src/pages");

const navSrc = fs.readFileSync(navPath, "utf8");

// Todos los archivos reales en public/ (nombre exacto, case-sensitive)
const publicFiles = new Set(fs.readdirSync(publicDir));
// Set en minúsculas para detectar problemas de sólo-mayúsculas/minúsculas
const publicFilesLower = new Map();
for (const f of publicFiles) {
  const key = f.toLowerCase();
  if (!publicFilesLower.has(key)) publicFilesLower.set(key, []);
  publicFilesLower.get(key).push(f);
}

// Rutas Astro disponibles (sin extensión .astro), p.ej. "game-of-life", "index"
const astroRoutes = new Set(
  fs.readdirSync(pagesDir)
    .filter((f) => f.endsWith(".astro"))
    .map((f) => f.replace(/\.astro$/, ""))
);

// ids declarados en cualquier .astro de src/pages (para validar anclas #foo)
let allIds = new Set();
for (const f of fs.readdirSync(pagesDir)) {
  if (!f.endsWith(".astro")) continue;
  const content = fs.readFileSync(path.join(pagesDir, f), "utf8");
  for (const m of content.matchAll(/\bid=["']([^"']+)["']/g)) {
    allIds.add(m[1]);
  }
}

// Extrae todos los href="..." (conserva espacios exactos, no hace trim)
const hrefRegex = /href=(["'])(.*?)\1/g;
const results = [];
let m;
while ((m = hrefRegex.exec(navSrc))) {
  const raw = m[2];
  results.push(raw);
}

const problems = [];
const ok = [];

for (const raw of results) {
  const trimmed = raw.trim();

  if (trimmed === "" || trimmed === "#") continue;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    ok.push({ raw, kind: "external" });
    continue;
  }
  if (trimmed.startsWith("mailto:")) {
    ok.push({ raw, kind: "mailto" });
    continue;
  }

  if (raw !== trimmed) {
    problems.push({ raw, kind: "espacio-sobrante", detail: `href tiene espacio(s) al inicio/final: "${raw}"` });
    continue;
  }

  if (trimmed.startsWith("#")) {
    const id = trimmed.slice(1);
    if (!allIds.has(id)) {
      problems.push({ raw, kind: "ancla-inexistente", detail: `no existe id="${id}" en ningún .astro de src/pages` });
    } else {
      problems.push({ raw, kind: "ancla-solo-home", detail: `id="${id}" existe pero el link es relativo (#${id}); no funciona desde páginas que no sean la que declara ese id` });
    }
    continue;
  }

  // Enlace a archivo suelto o ruta astro
  const withoutHash = trimmed.split("#")[0];
  const withoutExt = withoutHash.replace(/\.html$/i, "");
  const isAstroRoute = astroRoutes.has(withoutHash) || astroRoutes.has(withoutExt);
  const existsExact = publicFiles.has(withoutHash);
  const lowerMatches = publicFilesLower.get(withoutHash.toLowerCase());

  if (isAstroRoute || existsExact) {
    ok.push({ raw, kind: isAstroRoute ? "ruta-astro" : "archivo-public" });
    continue;
  }

  if (lowerMatches && lowerMatches.length) {
    problems.push({
      raw,
      kind: "mayusculas-inconsistentes",
      detail: `no existe "${withoutHash}" exacto; sí existe con otra combinación de mayúsculas: ${lowerMatches.join(", ")}`,
    });
    continue;
  }

  problems.push({ raw, kind: "archivo-no-encontrado", detail: `"${withoutHash}" no existe en public/ ni es ruta Astro` });
}

console.log(`Total hrefs analizados: ${results.length}`);
console.log(`OK: ${ok.length}`);
console.log(`Problemas: ${problems.length}\n`);

const byKind = {};
for (const p of problems) {
  byKind[p.kind] = byKind[p.kind] || [];
  byKind[p.kind].push(p);
}

for (const [kind, items] of Object.entries(byKind)) {
  console.log(`\n=== ${kind} (${items.length}) ===`);
  for (const it of items) {
    console.log(`  - ${JSON.stringify(it.raw)} -> ${it.detail}`);
  }
}

if (problems.length > 0) {
  console.log(`\n✗ ${problems.length} enlace(s) roto(s) en SiteNav.astro`);
  process.exit(1);
}
console.log("\n✓ Todos los enlaces de SiteNav.astro están OK");
