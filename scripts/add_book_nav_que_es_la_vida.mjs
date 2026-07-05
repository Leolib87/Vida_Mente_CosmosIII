// Reemplaza el nav "propio" (roto: enlazaba #prefacio/#epilogo como si
// estuvieran en la misma página, e índices de sección incompletos) de las 11
// páginas de "¿Qué es la Vida?" (Erwin Schrödinger) por el mismo sistema de
// navegación que ya usa "El Principio Vida": ChapterNav (índice del
// capítulo + progreso de lectura) + BookNav (índice del libro completo +
// anterior/siguiente), arriba y abajo del contenido.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderChapterNav, renderBookNav } from "./lib/book_nav_templates.mjs";
import { accent, indexSlug, chapters, sections } from "./lib/que_es_la_vida_book.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const OLD_NAV_START = '<nav class="fixed w-full z-50 top-20';

const pages = [indexSlug, ...chapters.map((c) => c.slug)];

for (const slug of pages) {
  const path = join(PUBLIC_DIR, slug);
  let html = readFileSync(path, "utf8");

  // 1. Quitar el nav propio roto: desde su <nav ...> hasta su </nav>, y si
  // justo después (salvo espacios/comentarios) viene un <script> propio
  // (el toggleDropdown/closeMobileMenu de la mayoría de los capítulos),
  // también hasta el cierre de ESE script — si no, ese script queda
  // huérfano referenciando elementos borrados y rompe el resto del JS de
  // la página (algunos capítulos, como Biografía, no tienen ese script).
  const navStart = html.indexOf(OLD_NAV_START);
  if (navStart === -1) {
    throw new Error(`${slug}: no se encontró el nav viejo a reemplazar`);
  }
  const navEnd = html.indexOf("</nav>", navStart) + "</nav>".length;
  if (navEnd === -1 + "</nav>".length) {
    throw new Error(`${slug}: no se encontró el cierre </nav> del nav viejo`);
  }
  const lookahead = html.slice(navEnd, navEnd + 400);
  const scriptRelIdx = lookahead.search(/<script[^>]*>/);
  let removalEnd = navEnd;
  if (scriptRelIdx !== -1) {
    const between = lookahead.slice(0, scriptRelIdx).replace(/<!--[\s\S]*?-->/g, "").trim();
    if (between === "") {
      const scriptStart = navEnd + scriptRelIdx;
      removalEnd = html.indexOf("</script>", scriptStart) + "</script>".length;
    }
  }
  html = html.slice(0, navStart) + html.slice(removalEnd);

  // 2. Insertar ChapterNav justo donde empezaba el nav viejo.
  const chapterMeta = chapters.find((c) => c.slug === slug);
  const chapterLabel = chapterMeta ? chapterMeta.label : "Portada";
  const chapterNavHtml = renderChapterNav({
    accent,
    chapter: chapterLabel,
    sections: sections[slug] || [],
  });
  html = html.slice(0, navStart) + chapterNavHtml + "\n\n    " + html.slice(navStart);

  // 3. Insertar BookNav arriba: justo después de la apertura de <main ...>.
  const mainOpenMatch = html.match(/<main[^>]*>/);
  if (!mainOpenMatch) throw new Error(`${slug}: no se encontró <main>`);
  const mainOpenEnd = mainOpenMatch.index + mainOpenMatch[0].length;
  const bookNavTop = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "top" });
  html = html.slice(0, mainOpenEnd) + "\n\n    " + bookNavTop + "\n" + html.slice(mainOpenEnd);

  // 4. Insertar BookNav abajo: justo después de "</main>\n    </div>" (cierre
  // de <main> + su wrapper "Contenido Principal"), antes del footer.
  const mainCloseMatch = html.match(/<\/main>\s*\n\s*<\/div>/);
  if (!mainCloseMatch) throw new Error(`${slug}: no se encontró el cierre de </main></div>`);
  const mainCloseEnd = mainCloseMatch.index + mainCloseMatch[0].length;
  const bookNavBottom = renderBookNav({ current: slug, chapters, indexHref: indexSlug, place: "bottom" });
  html = html.slice(0, mainCloseEnd) + "\n\n    " + bookNavBottom + "\n" + html.slice(mainCloseEnd);

  writeFileSync(path, html, "utf8");
  console.log(`OK: ${slug}`);
}
