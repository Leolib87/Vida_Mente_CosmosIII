// Transforma un capítulo EPV*.HTML del sitio original a una página Astro (*.astro)
// siguiendo el patrón establecido en src/pages/epv-01.astro:
//   - scripts y <style> del <head> pasan al Fragment slot="head" (is:inline / is:global)
//   - se añade el script de Lucide (lo requiere SiteNav)
//   - <SiteNav /> se inserta al abrir el body; el resto del body se copia tal cual
//   - los <script> del body se marcan is:inline para preservar el comportamiento original
//
// Uso: node migrar_epv.mjs <origen.HTML> <destino.astro>

import { readFileSync, writeFileSync } from "node:fs";

const [, , src, dest] = process.argv;
if (!src || !dest) {
  console.error("Uso: node migrar_epv.mjs <origen.HTML> <destino.astro>");
  process.exit(1);
}

const html = readFileSync(src, "utf8");

const pick = (re, s) => {
  const m = s.match(re);
  return m ? m[1] : null;
};

const head = pick(/<head[^>]*>([\s\S]*?)<\/head>/i, html) ?? "";
const bodyClass = pick(/<body[^>]*class=["']([^"']*)["']/i, html) ?? "";
const bodyInner = pick(/<body[^>]*>([\s\S]*?)<\/body>/i, html) ?? "";

// Título: reutiliza el <title> original pero reetiqueta el libro para consistencia
let title = (pick(/<title[^>]*>([\s\S]*?)<\/title>/i, html) ?? "Hans Jonas").trim();
title = title.replace(/\s*\|\s*Hans Jonas\s*$/i, " | El Principio Vida - Hans Jonas");

// Scripts externos del <head> -> is:inline
const headScripts = (head.match(/<script[^>]*src=["'][^"']*["'][^>]*>\s*<\/script>/gi) || [])
  .map((tag) => tag.replace(/<script/i, "<script is:inline"));

// Bloque <style> del <head> -> <style is:global>
const styleBlock = pick(/(<style[^>]*>[\s\S]*?<\/style>)/i, head);
const styleGlobal = styleBlock ? styleBlock.replace(/<style[^>]*>/i, "<style is:global>") : "";

// En el body, todo <script> (con o sin src) pasa a is:inline salvo que ya lo tenga
const body = bodyInner.replace(/<script(?![^>]*is:inline)([^>]*)>/gi, "<script is:inline$1>");

const out = `---
import BaseLayout from "../layouts/BaseLayout.astro";
import SiteNav from "../components/SiteNav.astro";
---
<BaseLayout
  title="${title.replace(/"/g, "&quot;")}"
  lang="es"
  bodyClass="${bodyClass}"
>
  <Fragment slot="head">
${headScripts.map((s) => "    " + s).join("\n")}
    <!-- Lucide: requerido por el nav compartido (SiteNav) -->
    <script is:inline src="https://unpkg.com/lucide@latest"></script>
    ${styleGlobal}
  </Fragment>

  <SiteNav />
${body}
</BaseLayout>
`;

writeFileSync(dest, out, "utf8");
console.log(`OK: ${src} -> ${dest}  (title: ${title})`);
