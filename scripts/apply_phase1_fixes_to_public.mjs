// Las 328 páginas sueltas de public/ tienen su propia copia congelada del
// mega-menú (inyectada antes de las correcciones de enlaces rotos que se
// hicieron en SiteNav.astro), así que arrastran los mismos 8 problemas ya
// resueltos ahí. Aplica exactamente los mismos cambios ya aprobados, uno
// por uno, con reemplazo literal (no regex) para evitar falsos positivos.
//
// Uso: node scripts/apply_phase1_fixes_to_public.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(scriptDir, "..");
const publicDir = path.join(repoRoot, "public");
const dryRun = process.argv.includes("--dry-run");

const fixes = [
  {
    label: "typo enactivism_utopico -> enactivismo_utopico",
    from: 'href="enactivism_utopico.html"',
    to: 'href="enactivismo_utopico.html"',
  },
  {
    label: "espacio inicial en onomastico.html",
    from: 'href=" onomastico.html"',
    to: 'href="onomastico.html"',
  },
  {
    label: "espacio final en despues_de_muerto.html",
    from: 'href="despues_de_muerto.html "',
    to: 'href="despues_de_muerto.html"',
  },
  {
    label: "quitar entrada Schopenhauer_II.html (nunca existió)",
    from: '                                      <li><a href="Schopenhauer_II.html" class="menu-link">Schopenhauer Biografia II</a></li>\r\n',
    to: "",
  },
  {
    label: "ancla muerta #biologia-celular -> (Próximamente)",
    from: '<a href="#biologia-celular" class="menu-link">Introducción a la Célula - Conceptos Fundamentales</a>',
    to: '<a href="#" class="menu-link">(Próximamente: Introducción a la Célula)</a>',
  },
  {
    label: "ancla muerta #ciencias-cognitivas -> (Próximamente)",
    from: '<a href="#ciencias-cognitivas" class="menu-link">Mente Encarnada - Varela, Thompson, Rosch</a>',
    to: '<a href="#" class="menu-link">(Próximamente: Mente Encarnada - Varela, Thompson, Rosch)</a>',
  },
  {
    label: "ancla muerta #epistemologia -> (Próximamente)",
    from: '<a href="#epistemologia" class="menu-link">Epistemología del Conocer - Constructivismo</a>',
    to: '<a href="#" class="menu-link">(Próximamente: Epistemología del Conocer - Constructivismo)</a>',
  },
  {
    label: "ancla muerta #inteligencia-artificial -> (Próximamente)",
    from: '<a href="#inteligencia-artificial" class="menu-link">IA y Sistemas Complejos - General</a>',
    to: '<a href="#" class="menu-link">(Próximamente: IA y Sistemas Complejos - General)</a>',
  },
  {
    label: "ancla muerta #analisis-redes -> (Próximamente)",
    from: '<a href="#analisis-redes" class="menu-link">Introducción a las Redes - Teoría de Grafos</a>',
    to: '<a href="#" class="menu-link">(Próximamente: Introducción a las Redes - Teoría de Grafos)</a>',
  },
  {
    label: "ancla muerta #elementos-comunes -> (Próximamente)",
    from: '<a href="#elementos-comunes" class="menu-link">Mapa Conceptual General - O.C.V.M.</a>',
    to: '<a href="#" class="menu-link">(Próximamente: Mapa Conceptual General - O.C.V.M.)</a>',
  },
  {
    label: "#contacto -> index.html#contacto",
    from: 'href="#contacto" class="flex items-center gap-2 text-slate-300',
    to: 'href="index.html#contacto" class="flex items-center gap-2 text-slate-300',
  },
];

const files = fs.readdirSync(publicDir).filter((f) => /\.html$/i.test(f));

const totals = Object.fromEntries(fixes.map((f) => [f.label, 0]));
let filesChanged = 0;

for (const file of files) {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const fix of fixes) {
    if (content.includes(fix.from)) {
      content = content.split(fix.from).join(fix.to);
      totals[fix.label]++;
      changed = true;
    }
  }

  if (changed) {
    filesChanged++;
    if (!dryRun) fs.writeFileSync(filePath, content, "utf8");
  }
}

console.log(`Archivos con al menos un cambio: ${filesChanged} / ${files.length}${dryRun ? " (dry-run)" : ""}\n`);
for (const [label, count] of Object.entries(totals)) {
  console.log(`  ${count.toString().padStart(3)}  ${label}`);
}
