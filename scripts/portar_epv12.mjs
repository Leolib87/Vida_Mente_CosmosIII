// Porta el Cap. 12 (public/EPV12.HTML, que es un componente REACT, no HTML)
// a una página Astro estática con el formato/estilo de epv-01:
//   - Extrae los datos reales del componente (FOOTNOTES, SECTIONS, CONCEPTS,
//     PEOPLE) evaluándolos como JS puro (sin React/JSX).
//   - Replica el algoritmo de coloreado de su <TextProcessor>: personas (set
//     PEOPLE) en cian, conceptos (set CONCEPTS) en ámbar, notas [N] como
//     referencia al pie tipo tooltip — usando las MISMAS clases que epv-01.
//   - Emite hero + secciones + prose full-width + BookNav, igual que epv-01.
//
// Uso: node scripts/portar_epv12.mjs
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "public/EPV12.HTML";
const DEST = "src/pages/epv-12.astro";

const html = readFileSync(SRC, "utf8");

// --- 1. Extraer la sección de DATOS (JS puro, sin JSX) y evaluarla ---
const start = html.indexOf("const BOOK_TITLE");
const end = html.indexOf("const TextProcessor");
if (start < 0 || end < 0) throw new Error("No se encontró la sección de datos");
const dataCode = html.slice(start, end);
const { BOOK_TITLE, FOOTNOTES, SECTIONS, CONCEPTS, PEOPLE } = new Function(
  dataCode + "\n return { BOOK_TITLE, FOOTNOTES, SECTIONS, CONCEPTS, PEOPLE };"
)();

// --- 2. Utilidades ---
// Escapa caracteres que romperían el HTML o el parser de Astro ({ } < > &).
const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");

// Colorea un fragmento de texto replicando el TextProcessor del componente:
// personas -> cian, conceptos -> ámbar. Si withFootnotes, las marcas [N] se
// convierten en referencia al pie (tooltip con el texto de la nota).
const TOKEN_RE = /(\s+|\[\d+\]|[.,;«»():¿?¡!—])/;
function colorize(text, withFootnotes) {
  const tokens = text.split(TOKEN_RE).filter(Boolean);
  let out = "";
  for (const tok of tokens) {
    if (withFootnotes && /^\[\d+\]$/.test(tok)) {
      const n = tok.slice(1, -1);
      const note = FOOTNOTES[n] != null ? colorize(String(FOOTNOTES[n]), false) : "";
      out +=
        `<span class="relative inline-block footnote-ref group">` +
        `<a href="#fn-${n}" class="text-cyan-400 font-bold cursor-pointer no-underline text-sm align-super">${n}</a>` +
        `<span class="footnote-tooltip">${note}</span>` +
        `</span>`;
      continue;
    }
    const clean = tok.replace(/[.,;«»():¿?¡!—]/g, "").trim();
    if (clean && PEOPLE.has(clean)) {
      out += `<span class="text-cyan-400 font-bold">${esc(tok)}</span>`;
    } else if (clean && CONCEPTS.has(clean.toLowerCase())) {
      out += `<span class="text-amber-500 font-bold">${esc(tok)}</span>`;
    } else {
      out += esc(tok);
    }
  }
  return out;
}

// Convierte el `content` de una sección (párrafos separados por \n\n) en <p>.
const paragraphs = (content) =>
  content
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `                        <p>${colorize(p, true)}</p>`)
    .join("\n");

// --- 3. Construir las secciones ---
const sectionsHtml = SECTIONS.map((sec, i) => {
  const header =
    sec.id === "intro"
      ? ""
      : `                    <div class="mb-10 pt-10 border-t border-slate-800">
                        <span class="text-cyan-500 font-bold text-xs tracking-widest uppercase block mb-2">Sección ${i}</span>
                        <h2 class="text-3xl md:text-4xl font-black text-slate-100">${esc(sec.title)}</h2>
                    </div>\n`;
  return `                <!-- ${esc(sec.title)} -->
                <section id="${sec.id}" class="mb-24 scroll-mt-32">
${header}                    <div class="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light text-justify px-4 md:px-0">
${paragraphs(sec.content)}
                    </div>
                </section>`;
}).join("\n\n");

// --- 4. Página Astro (frontmatter + head + body al estilo epv-01) ---
const out = `---
import BaseLayout from "../layouts/BaseLayout.astro";
import SiteNav from "../components/SiteNav.astro";
import BookNav from "../components/BookNav.astro";
---
<BaseLayout
  title="Capítulo 12: ${esc(BOOK_TITLE)} | El Principio Vida - Hans Jonas"
  lang="es"
  bodyClass="bg-slate-950 text-slate-300 antialiased"
>
  <Fragment slot="head">
    <!-- Lucide: requerido por el nav compartido (SiteNav) -->
    <script is:inline src="https://unpkg.com/lucide@latest"></script>
    <style is:global>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&display=swap');
        html { scroll-behavior: smooth; }

        /* Notas al pie: tooltip fijo al hacer hover (idéntico a epv-01) */
        .footnote-ref { cursor: pointer; position: relative; display: inline-block; }
        .footnote-ref .footnote-tooltip {
            visibility: hidden; opacity: 0;
            transition: opacity 0.3s ease-in-out, visibility 0.3s;
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            width: 90vw; max-width: 1000px;
            background-color: rgba(15, 23, 42, 0.98);
            border: 1px solid rgba(34, 211, 238, 0.3);
            color: #e2e8f0; padding: 1.5rem 2rem; border-radius: 0.5rem;
            font-size: 0.95rem; font-family: 'Inter', sans-serif; font-weight: normal;
            line-height: 1.6; z-index: 1000;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            text-align: justify; pointer-events: none;
        }
        .footnote-ref:hover .footnote-tooltip { visibility: visible; opacity: 1; }
    </style>
  </Fragment>

  <SiteNav />

    <div class="flex-grow pt-32 md:pt-48 pb-16 md:pb-24 px-6 md:px-12 w-full">
        <main class="w-full mx-auto text-center">

            <BookNav current="epv-12" place="top" />

            <!-- Bloque Hero: Título del Capítulo -->
            <header class="mb-24 relative animate-fade-in-up">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-amber-500/5 rounded-full blur-3xl -z-10"></div>

                <h1 class="text-4xl sm:text-5xl md:text-7xl font-black text-slate-100 mb-6 leading-none tracking-tighter drop-shadow-2xl break-words">
                    LA INMORTALIDAD<br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 text-2xl md:text-4xl block mt-6 font-serif italic tracking-[0.2em]">y el concepto actual de existencia</span>
                </h1>

                <p class="mt-8 text-sm md:text-base text-amber-500 font-bold tracking-widest uppercase mx-auto">
                    CAPÍTULO 12
                </p>

                <div class="mt-16 flex justify-center">
                    <div class="h-24 w-px bg-gradient-to-b from-amber-500/0 via-amber-500/50 to-amber-500/0"></div>
                </div>
            </header>

            <!-- Contenido del Capítulo -->
            <div class="w-full mx-auto text-left">

${sectionsHtml}

            </div>

        </main>
    </div>

    <BookNav current="epv-12" />

    <!-- Footer Simple -->
    <footer class="bg-slate-950 border-t border-slate-900 py-6 md:py-8 mt-24">
        <div class="w-full px-4 md:px-12 flex flex-col items-center justify-center gap-2">
            <p class="text-[10px] md:text-[11px] font-medium text-slate-400 text-center">
                Transcripción basada en la edición impresa (págs. 303-323).
            </p>
            <p class="text-[9px] md:text-[10px] text-slate-600 font-mono text-center">
                El Principio Vida · Hans Jonas
            </p>
        </div>
    </footer>
</BaseLayout>
`;

writeFileSync(DEST, out, "utf8");
console.log(`OK: ${SRC} -> ${DEST}`);
console.log(`  Secciones: ${SECTIONS.length} | Notas: ${Object.keys(FOOTNOTES).length} | Personas: ${PEOPLE.size} | Conceptos: ${CONCEPTS.size}`);
