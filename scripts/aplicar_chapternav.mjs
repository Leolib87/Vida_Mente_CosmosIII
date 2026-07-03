// Helper de un solo uso: reemplaza el <nav>...</nav> propio de un capítulo por
// el componente <ChapterNav>, y añade su import. El resto (padding/ancho del
// contenedor y estilo de los headers) se ajusta aparte.
//
// Uso: node scripts/aplicar_chapternav.mjs <archivo.astro> "<Etiqueta>" '<sectionsJSON>'
//   sectionsJSON = '[{"href":"#id","label":"I. ..."}, ...]'
import { readFileSync, writeFileSync } from "node:fs";

const [, , file, chapter, sectionsJson] = process.argv;
if (!file || !chapter || !sectionsJson) {
  console.error('Uso: node aplicar_chapternav.mjs <archivo> "<Etiqueta>" \'<sectionsJSON>\'');
  process.exit(1);
}

let src = readFileSync(file, "utf8");

// 1. Import (si falta)
if (!src.includes("ChapterNav.astro")) {
  src = src.replace(
    'import SiteNav from "../components/SiteNav.astro";',
    'import SiteNav from "../components/SiteNav.astro";\nimport ChapterNav from "../components/ChapterNav.astro";'
  );
}

// 2. Construir el componente
const sections = JSON.parse(sectionsJson);
const secLit = sections
  .map((s) => `            { href: ${JSON.stringify(s.href)}, label: ${JSON.stringify(s.label)} },`)
  .join("\n");
const comp = `    <ChapterNav\n        chapter=${JSON.stringify(chapter)}\n        sections={[\n${secLit}\n        ]}\n    />`;

// 3. Reemplazar el PRIMER <nav ...>...</nav> del cuerpo (el navbar propio del
//    capítulo). SiteNav es un componente <SiteNav />, no tiene </nav>, así que
//    el único bloque <nav>...</nav> del source es la barra del capítulo.
const navRe = /<nav[\s\S]*?<\/nav>/;
if (!navRe.test(src)) {
  console.error(`AVISO: ${file} no tiene <nav>...</nav> propio (¿ya migrado o sin barra?).`);
} else {
  src = src.replace(navRe, comp);
}

writeFileSync(file, src, "utf8");
console.log(`OK: ${file} -> ChapterNav (${sections.length} secciones)`);
