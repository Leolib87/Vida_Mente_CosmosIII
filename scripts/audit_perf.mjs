// Mide, por archivo de public/*.html, si carga librerías pesadas (Three.js,
// D3, Mermaid) que luego no usa en su propio código. loadRe se aplica SOLO
// al contenido de las etiquetas <script src="...">, nunca al HTML completo,
// para no confundir menciones de texto (p.ej. "Web Three.js" en un link del
// menú) con la carga real de la librería.
//
// Uso: node scripts/audit_perf.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = process.argv[2] || path.join(scriptDir, "../public");

const libs = [
  { name: "Three.js", loadRe: /cdnjs\.cloudflare\.com\/ajax\/libs\/three/i, useRe: /\bTHREE\./ },
  { name: "D3", loadRe: /d3js\.org\/d3/i, useRe: /\bd3\./ },
  { name: "Mermaid", loadRe: /cdn\.jsdelivr\.net\/npm\/mermaid/i, useRe: /\bmermaid\./i },
];

const files = fs.readdirSync(publicDir).filter((f) => /\.html$/i.test(f));

let totalBytes = 0;
const unusedByLib = Object.fromEntries(libs.map((l) => [l.name, []]));
const loadedCount = Object.fromEntries(libs.map((l) => [l.name, 0]));

for (const file of files) {
  const filePath = path.join(publicDir, file);
  const html = fs.readFileSync(filePath, "utf8");
  totalBytes += Buffer.byteLength(html, "utf8");

  const srcTags = [...html.matchAll(/<script[^>]*\ssrc="([^"]*)"[^>]*><\/script>/gi)].map((m) => m[1]);
  const withoutSrcTags = html.replace(/<script[^>]*\ssrc="[^"]*"[^>]*><\/script>/gi, "");

  for (const lib of libs) {
    const loads = srcTags.some((src) => lib.loadRe.test(src));
    if (!loads) continue;
    loadedCount[lib.name]++;
    const uses = lib.useRe.test(withoutSrcTags);
    if (!uses) unusedByLib[lib.name].push(file);
  }
}

console.log(`Total archivos: ${files.length}`);
console.log(`Peso total en disco (public/*.html): ${(totalBytes / 1024 / 1024).toFixed(1)} MB\n`);

for (const lib of libs) {
  console.log(`${lib.name}: cargado en ${loadedCount[lib.name]} páginas, sin usar en ${unusedByLib[lib.name].length}`);
}

const anyUnused = libs.some((l) => unusedByLib[l.name].length);
if (anyUnused) {
  console.log("\n=== Detalle: páginas que cargan pero no usan ===");
  for (const lib of libs) {
    if (!unusedByLib[lib.name].length) continue;
    console.log(`\n-- ${lib.name} (${unusedByLib[lib.name].length}) --`);
    unusedByLib[lib.name].forEach((f) => console.log("  -", f));
  }
}
