// Quita las etiquetas <script src="..."> de D3 y Mermaid en las páginas de
// public/ que las cargan pero nunca las usan (sin THREE./d3./mermaid. fuera
// de las propias etiquetas <script src>). Three.js no tiene casos así (ver
// scripts/audit_perf.mjs) y no se toca. Ahorra ~280KB (D3) o ~3.3MB
// (Mermaid) de descarga por visita en esas páginas.
//
// Uso: node scripts/strip_unused_libs.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptDir, "..");
const publicDir = path.join(repoRoot, "public");
const dryRun = process.argv.includes("--dry-run");

const libs = [
  { name: "D3", loadRe: /d3js\.org\/d3/i, useRe: /\bd3\./ },
  { name: "Mermaid", loadRe: /cdn\.jsdelivr\.net\/npm\/mermaid/i, useRe: /\bmermaid\./i },
];

const files = fs.readdirSync(publicDir).filter((f) => /\.html$/i.test(f));

let totalRemoved = 0;
const removedByLib = Object.fromEntries(libs.map((l) => [l.name, []]));

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let html = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const lib of libs) {
    const tagRe = /<script[^>]*\ssrc="([^"]*)"[^>]*><\/script>\r?\n?/gi;
    const matches = [...html.matchAll(tagRe)].filter((m) => lib.loadRe.test(m[1]));
    if (!matches.length) continue;

    const withoutSrcTags = html.replace(/<script[^>]*\ssrc="[^"]*"[^>]*><\/script>/gi, "");
    if (lib.useRe.test(withoutSrcTags)) continue; // sí se usa, no tocar

    for (const m of matches) {
      html = html.replace(m[0], "");
    }
    removedByLib[lib.name].push(file);
    totalRemoved++;
    changed = true;
  }

  if (changed && !dryRun) {
    fs.writeFileSync(filePath, html, "utf8");
  }
}

for (const lib of libs) {
  console.log(`${lib.name}: quitado de ${removedByLib[lib.name].length} páginas${dryRun ? " (dry-run)" : ""}`);
  removedByLib[lib.name].forEach((f) => console.log("  -", f));
}
console.log(`\nTotal etiquetas <script> quitadas: ${totalRemoved}`);
