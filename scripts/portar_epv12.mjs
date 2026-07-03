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

// --- 3. Construir las secciones (encabezado h2 al estilo epv-01) ---
const sectionsHtml = SECTIONS.map((sec) => {
  return `                <!-- ${esc(sec.title)} -->
                <section id="${sec.id}" class="mb-24 scroll-mt-32">
                    <h2 class="text-2xl md:text-3xl font-serif font-bold text-white mb-8 border-l-4 border-amber-500 pl-6">
                        ${esc(sec.title.toUpperCase())}
                    </h2>
                    <div class="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-light text-justify px-4 md:px-0">
${paragraphs(sec.content)}
                    </div>
                </section>`;
}).join("\n\n");

// Enlaces del desplegable "ÍNDICE DEL CAPÍTULO" (una entrada por sección)
const sectionLinks = SECTIONS.map(
  (s) => `                                <a href="#${s.id}" class="dropdown-link" onclick="closeMobileMenu()">${esc(s.title)}</a>`
).join("\n");

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

        /* --- Barra de Progreso de Lectura (idéntica a epv-01) --- */
        #progress-container { position: fixed; top: 0; left: 0; width: 100%; height: 4px; z-index: 200; background: transparent; }
        #progress-bar { height: 100%; background-color: #22d3ee; width: 0%; box-shadow: 0 0 10px #22d3ee; transition: width 0.1s ease-out; }

        /* --- Barra "ÍNDICE DEL CAPÍTULO" (idéntica a epv-01) --- */
        .nav-link { position: relative; transition: color 0.3s ease; cursor: pointer; display: block; }
        .nav-link::after { content: ''; position: absolute; width: 0; height: 1px; bottom: -2px; left: 0; background-color: #f59e0b; transition: width 0.3s ease; }
        @media (min-width: 768px) {
            .nav-item:hover .nav-link::after { width: 100%; }
            .nav-item:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
            .dropdown-menu { position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px); min-width: 320px; max-height: 80vh; overflow-y: auto; opacity: 0; visibility: hidden; }
            .dropdown-menu::-webkit-scrollbar { width: 6px; }
            .dropdown-menu::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 3px; }
            .dropdown-menu::before { content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%); border-width: 0 6px 6px 6px; border-style: solid; border-color: transparent transparent rgba(255,255,255,0.1) transparent; }
            .dropdown-menu::after { content: ''; position: absolute; top: -20px; left: 0; width: 100%; height: 20px; background: transparent; }
        }
        .dropdown-menu { background-color: rgba(2,6,23,0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); padding: 1rem; border-radius: 0.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); transition: all 0.2s ease-in-out; z-index: 90; }
        .dropdown-link { display: block; padding: 0.5rem 0.75rem; color: #94a3b8; font-size: 0.75rem; transition: all 0.2s; border-radius: 0.25rem; line-height: 1.4; text-align: left; text-decoration: none; }
        .dropdown-link:hover { color: #f59e0b; background-color: rgba(255,255,255,0.05); }
        .dropdown-header { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #f59e0b; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: block; }
        @media (max-width: 767px) {
            #mobile-menu-container { border-bottom: 1px solid rgba(255,255,255,0.1); }
            .nav-item { width: 100%; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0; }
            .nav-item-content { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; }
            .dropdown-menu { position: static; transform: none; opacity: 1; visibility: visible; width: 100%; box-shadow: none; background-color: rgba(0,0,0,0.3); border: none; border-top: 1px solid rgba(255,255,255,0.05); display: none; margin-top: 0; max-height: none; overflow-y: visible; }
            .arrow-icon { transition: transform 0.3s; }
            .nav-item.active .arrow-icon { transform: rotate(180deg); }
        }

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

    <!-- Barra de Progreso Superior -->
    <div id="progress-container">
        <div id="progress-bar"></div>
    </div>

    <!-- Barra "ÍNDICE DEL CAPÍTULO" (misma estructura que epv-01) -->
    <nav class="fixed w-full z-50 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300 top-20">
        <div class="w-full px-4 md:px-12">
            <div class="flex justify-between items-center h-16">
                <a href="#" class="flex items-center space-x-2 group">
                    <div class="w-2 h-2 bg-amber-500 rounded-full group-hover:scale-150 transition-transform"></div>
                    <span class="text-[10px] md:text-xs font-bold tracking-widest uppercase text-slate-200 group-hover:text-white transition-colors">
                        <span class="text-cyan-400">Hans Jonas</span> <span class="text-slate-600 mx-1">|</span> Cap. 12
                    </span>
                </a>
                <button id="menu-btn" class="md:hidden text-slate-300 hover:text-white focus:outline-none p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div id="mobile-menu-container" class="hidden md:flex absolute md:static top-16 left-0 w-full md:w-auto bg-slate-950 md:bg-transparent flex-col md:flex-row md:items-center overflow-y-auto md:overflow-visible max-h-[80vh] md:max-h-full transition-all">
                    <ul class="flex flex-col md:flex-row md:items-center text-[11px] font-medium uppercase tracking-widest text-slate-400 w-full md:w-auto">
                        <li class="nav-item group md:mx-3">
                            <div class="nav-item-content">
                                <span class="nav-link hover:text-white cursor-pointer text-amber-500">ÍNDICE DEL CAPÍTULO</span>
                                <button class="md:hidden p-2 arrow-icon" onclick="toggleDropdown(this)">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>
                            <div class="dropdown-menu">
                                <span class="dropdown-header">Secciones</span>
${sectionLinks}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>

    <script is:inline>
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu-container');
        const progressBar = document.getElementById('progress-bar');
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
        });
        function toggleDropdown(button) {
            const navItem = button.closest('.nav-item');
            const dropdown = navItem.querySelector('.dropdown-menu');
            navItem.classList.toggle('active');
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        }
        function closeMobileMenu() {
            if (window.innerWidth < 768) {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
                document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            }
        }
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progressBar.style.width = (scrollTop / scrollHeight) * 100 + '%';
        });
    </script>

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
