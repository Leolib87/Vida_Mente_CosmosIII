// Agrega ChapterNav + BookNav a las 16 páginas de contenido de "La Mente
// en la Vida". A diferencia de los demás libros, el contenido es una app
// de React (JSX vía Babel) montada en <div id="root">; no se toca ese
// JSX (su propio header ya existe pero está invisible detrás de SiteNav,
// y no vale la pena el riesgo de editarlo). Se inserta el nuevo sistema
// de navegación como HTML estático, hermano de #root: ChapterNav +
// BookNav arriba (antes de #root), BookNav abajo (después de #root).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderChapterNav, renderBookNav } from "./lib/book_nav_templates.mjs";
import { accent, indexSlug, chapters } from "./lib/mil_book.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const ROOT_DIV = '<div id="root"></div>';

function extractSections(html) {
  // Patrón principal: componente <SectionHeader id="..." number="NN" title="...">
  // ya trae el título en español curado por quien escribió el capítulo.
  const re = /<SectionHeader id="([a-zA-Z0-9_-]+)" number="[^"]*" title="([^"]*)"/g;
  const sections = [];
  let m;
  while ((m = re.exec(html))) {
    sections.push({ href: `#${m[1]}`, label: m[2] });
  }
  if (sections.length > 0) return sections;

  // Capítulos "simples" (1-5): un solo <section id="chapter-N"> sin
  // subdivisiones propias; se ofrece esa única ancla.
  const single = html.match(/<section id="(chapter-\d+)">/);
  if (single) {
    const num = single[1].replace("chapter-", "");
    return [{ href: `#${single[1]}`, label: `Capítulo ${num}` }];
  }
  return [];
}

for (const { slug, label } of chapters) {
  const path = join(PUBLIC_DIR, slug);
  let html = readFileSync(path, "utf8");

  const sections = extractSections(html);
  const rootIdx = html.indexOf(ROOT_DIV);
  if (rootIdx === -1) throw new Error(`${slug}: no se encontró ${ROOT_DIV}`);

  const chapterNavHtml = renderChapterNav({ accent, chapter: label, sections });
  const bookNavTop = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "top" });
  const bookNavBottom = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "bottom" });

  // .cn-bar es fixed (no reserva espacio de flujo); el <main pt-20> que ya
  // trae el JSX de React solo compensa los 80px de SiteNav, no encima los
  // ~64px del ChapterNav que se agrega ahora. Se agrega un espaciador
  // propio (no-fixed) para que BookNav-top no quede tapado detrás de la
  // barra fija de ChapterNav.
  const spacer = '<div style="height: 4rem"></div>';
  const before = chapterNavHtml + "\n\n    " + spacer + "\n\n    " + bookNavTop + "\n\n    ";
  const after = "\n\n    " + bookNavBottom + "\n";

  html =
    html.slice(0, rootIdx) +
    before +
    ROOT_DIV +
    after +
    html.slice(rootIdx + ROOT_DIV.length);

  writeFileSync(path, html, "utf8");
  console.log(`OK: ${slug} (${sections.length} secciones)`);
}
