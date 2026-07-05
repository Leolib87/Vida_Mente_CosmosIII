// Traducción a HTML/CSS/JS estático del sistema de navegación interno del
// libro "El Principio Vida" (src/components/ChapterNav.astro +
// src/components/BookNav.astro), para los libros que viven como HTML suelto
// en public/ (sin build de componentes Astro). Mismo marcado, mismas clases
// (cn-*/bn-*), mismo comportamiento — solo sin JSX/props de Astro.
//
// Uso: cada libro define su propio módulo de datos (ver
// scripts/lib/que_es_la_vida_book.mjs) y un script scripts/add_book_nav_<libro>.mjs
// llama a renderChapterNav()/renderBookNav() por página.

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- ChapterNav: barra "Índice del capítulo" + progreso de lectura ---
export function renderChapterNav({ accent, chapter, sections = [] }) {
  const sectionLinks = sections
    .map((s) => `          <a href="${s.href}" role="menuitem" class="cn-dropdown-link">${escapeHtml(s.label)}</a>`)
    .join("\n");

  return `<!-- Barra de progreso de lectura -->
    <div class="cn-progress-container"><div class="cn-progress-bar"></div></div>

    <!-- Barra "ÍNDICE DEL CAPÍTULO" (fija en top-20, bajo el SiteNav) -->
    <nav class="cn-bar">
      <div class="cn-inner">
        <a href="#" class="cn-logo">
          <span class="cn-dot"></span>
          <span class="cn-logo-text"><span class="cn-accent">${escapeHtml(accent)}</span> <span class="cn-sep">|</span> ${escapeHtml(chapter)}</span>
        </a>

        <div class="cn-menu">
          <button type="button" class="cn-trigger" aria-haspopup="true" aria-expanded="false">
            Índice del capítulo
            <svg class="cn-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div class="cn-dropdown" role="menu">
            <span class="cn-dropdown-header">Secciones</span>
${sectionLinks}
          </div>
        </div>
      </div>
    </nav>

    <style>
      .cn-progress-container { position: fixed; top: 0; left: 0; width: 100%; height: 4px; z-index: 200; background: transparent; }
      .cn-progress-bar { height: 100%; background-color: #22d3ee; width: 0%; box-shadow: 0 0 10px #22d3ee; transition: width 0.1s ease-out; }

      .cn-bar {
        position: fixed; top: 5rem; left: 0; width: 100%; z-index: 50;
        background-color: rgba(2, 6, 23, 0.9); backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .cn-inner { width: 100%; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; height: 4rem; }
      @media (min-width: 768px) { .cn-inner { padding: 0 3rem; } }

      .cn-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; }
      .cn-dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background-color: #f59e0b; transition: transform 0.3s; }
      .cn-logo:hover .cn-dot { transform: scale(1.5); }
      .cn-logo-text { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #e2e8f0; }
      @media (min-width: 768px) { .cn-logo-text { font-size: 12px; } }
      .cn-accent { color: #22d3ee; }
      .cn-sep { color: #475569; margin: 0 0.25rem; }

      .cn-menu { position: relative; }
      .cn-trigger {
        display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer;
        padding: 0.4rem 0; color: #f59e0b; font-size: 11px; font-weight: 500; text-transform: uppercase;
        letter-spacing: 0.15em; transition: color 0.2s;
      }
      .cn-trigger:hover { color: #fbbf24; }
      .cn-caret { width: 0.8rem; height: 0.8rem; transition: transform 0.2s; }

      .cn-dropdown {
        position: absolute; top: 100%; right: 0; margin-top: 0.75rem;
        min-width: 320px; max-height: 70vh; overflow-y: auto;
        background-color: rgba(2, 6, 23, 0.97); border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px); padding: 1rem; border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        opacity: 0; visibility: hidden; transform: translateY(8px);
        transition: all 0.2s ease-in-out; z-index: 90; text-align: left;
      }
      .cn-dropdown::-webkit-scrollbar { width: 6px; }
      .cn-dropdown::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 3px; }
      @media (min-width: 768px) {
        .cn-menu:hover .cn-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
        .cn-menu:hover .cn-caret { transform: rotate(180deg); }
      }
      .cn-menu.is-open .cn-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
      .cn-menu.is-open .cn-caret { transform: rotate(180deg); }

      .cn-dropdown-header { display: block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #f59e0b; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
      .cn-dropdown-link { display: block; padding: 0.5rem 0.75rem; color: #94a3b8; font-size: 0.75rem; line-height: 1.4; border-radius: 0.25rem; text-align: left; text-decoration: none; transition: all 0.2s; }
      .cn-dropdown-link:hover { color: #f59e0b; background-color: rgba(255, 255, 255, 0.05); }
    </style>

    <script>
      if (!window.__chapterNavInit) {
        window.__chapterNavInit = true;
        var cnCloseMenu = function (menu) {
          menu.classList.remove("is-open");
          var btn = menu.querySelector(".cn-trigger");
          if (btn) btn.setAttribute("aria-expanded", "false");
        };
        document.addEventListener("click", function (e) {
          var trigger = e.target.closest(".cn-trigger");
          var open = document.querySelectorAll(".cn-menu.is-open");
          if (trigger) {
            e.preventDefault();
            var menu = trigger.closest(".cn-menu");
            var was = menu.classList.contains("is-open");
            open.forEach(cnCloseMenu);
            if (!was) {
              menu.classList.add("is-open");
              trigger.setAttribute("aria-expanded", "true");
            }
          } else {
            if (e.target.closest(".cn-dropdown-link") || !e.target.closest(".cn-dropdown")) {
              open.forEach(cnCloseMenu);
            }
          }
        });
        window.addEventListener("scroll", function () {
          var bar = document.querySelector(".cn-progress-bar");
          if (!bar) return;
          var st = document.documentElement.scrollTop || document.body.scrollTop;
          var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          bar.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
        });
      }
    </script>`;
}

// --- BookNav: índice del libro + anterior/siguiente (o CTA en la portada) ---
export function renderBookNav({ current, chapters, indexHref, place = "bottom" }) {
  const i = chapters.findIndex((c) => c.slug === current);
  const isIndex = i === -1;
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null;
  const first = chapters[0];
  const margin = place === "top" ? "mt-0 mb-16" : "my-20";

  const body = isIndex
    ? `      <a href="${first.slug}" class="flex items-center gap-2 px-6 py-3 rounded-full border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors no-underline text-[11px] font-medium uppercase tracking-widest">
        Comenzar la lectura
        <span class="text-slate-400">${escapeHtml(first.label)} →</span>
      </a>`
    : `      <div class="bn-menu">
        <button type="button" class="bn-menu-trigger" aria-haspopup="true" aria-expanded="false">
          Índice del libro
          <svg class="bn-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div class="bn-dropdown" role="menu">
          <span class="bn-dropdown-header">Capítulos</span>
${chapters
  .map(
    (c) =>
      `          <a href="${c.slug}" role="menuitem" class="bn-dropdown-link${c.slug === current ? " is-current" : ""}"${c.slug === current ? ' aria-current="page"' : ""}>${escapeHtml(c.title)}</a>`
  )
  .join("\n")}
          <a href="${indexHref}" class="bn-dropdown-more">Ver índice completo →</a>
        </div>
      </div>

      <div class="flex items-center gap-6 text-[11px] font-medium uppercase tracking-widest shrink-0">
${prev ? `        <a href="${prev.slug}" class="text-right text-slate-400 hover:text-amber-400 transition-colors no-underline">
          <span class="block text-[9px] text-slate-600">← Anterior</span>
          ${escapeHtml(prev.label)}
        </a>` : ""}
${next ? `        <a href="${next.slug}" class="text-right text-slate-400 hover:text-amber-400 transition-colors no-underline">
          <span class="block text-[9px] text-slate-600">Siguiente →</span>
          ${escapeHtml(next.label)}
        </a>` : ""}
      </div>`;

  return `<div
      role="navigation"
      aria-label="${isIndex ? "Comenzar la lectura del libro" : "Navegación del libro"}"
      class="w-full max-w-3xl mx-auto ${margin} px-6 flex items-center ${isIndex ? "justify-center" : "justify-between gap-4"}"
    >
${body}
    </div>

    <style>
      .bn-menu { position: relative; flex-shrink: 0; }
      .bn-menu-trigger {
        display: inline-flex; align-items: center; gap: 0.4rem; background: none; border: none; cursor: pointer;
        padding: 0.4rem 0; color: #f59e0b; font-size: 11px; font-weight: 500; text-transform: uppercase;
        letter-spacing: 0.15em; transition: color 0.2s;
      }
      .bn-menu-trigger:hover { color: #fbbf24; }
      .bn-caret { width: 0.8rem; height: 0.8rem; transition: transform 0.2s; }

      .bn-dropdown {
        position: absolute; top: 100%; left: 0; margin-top: 0.75rem;
        min-width: 320px; max-height: 70vh; overflow-y: auto;
        background-color: rgba(2, 6, 23, 0.97); border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px); padding: 1rem; border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        opacity: 0; visibility: hidden; transform: translateY(8px);
        transition: all 0.2s ease-in-out; z-index: 120; text-align: left;
      }
      .bn-dropdown::-webkit-scrollbar { width: 6px; }
      .bn-dropdown::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 3px; }

      @media (min-width: 768px) {
        .bn-menu:hover .bn-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
        .bn-menu:hover .bn-caret { transform: rotate(180deg); }
      }
      .bn-menu.is-open .bn-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
      .bn-menu.is-open .bn-caret { transform: rotate(180deg); }

      .bn-dropdown-header { display: block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: #f59e0b; margin-bottom: 0.5rem; padding-bottom: 0.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
      .bn-dropdown-link { display: block; padding: 0.5rem 0.75rem; color: #94a3b8; font-size: 0.75rem; line-height: 1.4; border-radius: 0.25rem; text-align: left; text-decoration: none; text-transform: none; letter-spacing: normal; transition: all 0.2s; }
      .bn-dropdown-link:hover { color: #f59e0b; background-color: rgba(255, 255, 255, 0.05); }
      .bn-dropdown-link.is-current { color: #f59e0b; background-color: rgba(245, 158, 11, 0.1); font-weight: 600; }
      .bn-dropdown-more { display: block; margin-top: 0.5rem; padding: 0.5rem 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #64748b; font-size: 0.7rem; text-decoration: none; transition: color 0.2s; }
      .bn-dropdown-more:hover { color: #f59e0b; }
    </style>

    <script>
      if (!window.__bookNavMenuInit) {
        window.__bookNavMenuInit = true;
        document.addEventListener("click", function (e) {
          var trigger = e.target.closest(".bn-menu-trigger");
          var openMenus = document.querySelectorAll(".bn-menu.is-open");
          if (trigger) {
            e.preventDefault();
            var menu = trigger.closest(".bn-menu");
            var wasOpen = menu.classList.contains("is-open");
            openMenus.forEach(function (m) { m.classList.remove("is-open"); });
            if (!wasOpen) {
              menu.classList.add("is-open");
              trigger.setAttribute("aria-expanded", "true");
            } else {
              trigger.setAttribute("aria-expanded", "false");
            }
          } else if (!e.target.closest(".bn-dropdown")) {
            openMenus.forEach(function (m) {
              m.classList.remove("is-open");
              var t = m.querySelector(".bn-menu-trigger");
              if (t) t.setAttribute("aria-expanded", "false");
            });
          }
        });
      }
    </script>`;
}
