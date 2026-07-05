// Reemplaza el nav "de arriba" de las 8 páginas de contenido de "De
// Máquinas y Seres Vivos" (solo "Volver a la Portada" + rótulo del
// capítulo, sin dropdown ni anterior/siguiente real) por ChapterNav +
// BookNav, igual que en "¿Qué es la Vida?". La portada
// (MAQUINA_SERES_VIVOS.html) es un mini-SPA con pestañas propio que ya
// funciona y se deja intacta a propósito.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderChapterNav, renderBookNav } from "./lib/book_nav_templates.mjs";
import { accent, indexSlug, chapters } from "./lib/maquinas_book.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const OLD_NAV_START = '<nav class="fixed w-full z-50 top-20 bg-slate-950/80';

function extractSections(html) {
  const re = /<a href="(#[a-zA-Z0-9_-]+)" class="sidebar-link[^"]*">([^<]*)<\/a>/g;
  const sections = [];
  let m;
  while ((m = re.exec(html))) {
    sections.push({ href: m[1], label: m[2].replace(/\s+/g, " ").trim() });
  }
  return sections;
}

for (const { slug, label } of chapters) {
  const path = join(PUBLIC_DIR, slug);
  let html = readFileSync(path, "utf8");

  const sections = extractSections(html);

  // 1. Quitar el nav viejo (desde su <nav ...> hasta su </nav>; estas 8
  // páginas no tienen script propio pegado al nav, a diferencia de "¿Qué
  // es la Vida?").
  const navStart = html.indexOf(OLD_NAV_START);
  if (navStart === -1) throw new Error(`${slug}: no se encontró el nav viejo`);
  const navEnd = html.indexOf("</nav>", navStart) + "</nav>".length;
  if (navEnd === -1 + "</nav>".length) throw new Error(`${slug}: no se encontró </nav>`);

  const chapterNavHtml = renderChapterNav({ accent, chapter: label, sections });
  html = html.slice(0, navStart) + chapterNavHtml + "\n\n    " + html.slice(navEnd);

  // 2 y 3. El wrapper original ("max-w-none mx-auto px-6 pt-32 pb-24 flex
  // flex-col lg:flex-row gap-16") hace DOS cosas a la vez: el padding que
  // separa el contenido de los navs fijos, Y el layout de dos columnas
  // (sidebar + artículo). Si BookNav se inserta directo adentro, se
  // vuelve una tercera columna angosta en el flex-row en vez de una barra
  // de ancho completo. Se parte en dos divs anidados: el de afuera se
  // queda con el padding (para que BookNav arriba/abajo respete el mismo
  // espaciado que el resto del contenido); el de adentro, nuevo, se queda
  // solo con flex-col lg:flex-row y envuelve nada más que <aside>+<article>.
  const wrapperOpenRe = /<div class="max-w-none mx-auto px-6 pt-32 pb-24 flex flex-col lg:flex-row gap-16">/;
  const wrapperMatch = html.match(wrapperOpenRe);
  if (!wrapperMatch) throw new Error(`${slug}: no se encontró el wrapper de contenido`);
  const bookNavTop = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "top" });
  const newOpen = `<div class="max-w-none mx-auto px-6 pt-32 pb-24">\n\n    ${bookNavTop}\n\n    <div class="flex flex-col lg:flex-row gap-16">`;
  html = html.slice(0, wrapperMatch.index) + newOpen + html.slice(wrapperMatch.index + wrapperMatch[0].length);

  const wrapperCloseRe = /<\/article>\s*\n\s*<\/div>/;
  const wrapperCloseMatch = html.match(wrapperCloseRe);
  if (!wrapperCloseMatch) throw new Error(`${slug}: no se encontró el cierre del wrapper de contenido`);
  const bookNavBottom = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "bottom" });
  const wrapperCloseEnd = wrapperCloseMatch.index + wrapperCloseMatch[0].length;
  const newClose = `\n\n    ${bookNavBottom}\n    </div>`;
  html = html.slice(0, wrapperCloseEnd) + newClose + html.slice(wrapperCloseEnd);

  writeFileSync(path, html, "utf8");
  console.log(`OK: ${slug} (${sections.length} secciones)`);
}
