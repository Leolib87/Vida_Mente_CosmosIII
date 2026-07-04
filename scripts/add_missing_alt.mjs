// Agrega alt="" a las imágenes de public/ que no lo tienen, usando el
// texto ya presente en la página (el <p> que sigue a cada <img> en la
// galería de Pedagogia-Biologia2.html, o el <figcaption> en
// Neurofenomenologia.html) en vez de un alt genérico.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(scriptDir, "../public");

let totalFixed = 0;

// 1. Pedagogia-Biologia2.html: <img src="X"> seguido de <p>Título</p>
{
  const file = path.join(publicDir, "Pedagogia-Biologia2.html");
  let html = fs.readFileSync(file, "utf8");
  const re = /<img src="([^"]+)">(\s*<p>([^<]+)<\/p>)/g;
  let count = 0;
  html = html.replace(re, (full, src, rest, caption) => {
    count++;
    return `<img src="${src}" alt="Gráfico: ${caption.trim()}">${rest}`;
  });
  fs.writeFileSync(file, html, "utf8");
  console.log(`Pedagogia-Biologia2.html: ${count} imágenes con alt agregado`);
  totalFixed += count;
}

// 2. Neurofenomenologia.html: <img ...fenomeno.jpg...> dentro de <figure>
//    con <figcaption> a continuación.
{
  const file = path.join(publicDir, "Neurofenomenologia.html");
  let html = fs.readFileSync(file, "utf8");
  const from = '<img src="https://github.com/Leolib87/Vida_Mente_CosmosII/blob/main/fenomeno.jpg?raw=true" class="rounded-lg shadow-2xl border border-slate-800 opacity-90 hover:opacity-100 transition-opacity w-full object-cover">';
  const to = '<img src="https://github.com/Leolib87/Vida_Mente_CosmosII/blob/main/fenomeno.jpg?raw=true" alt="Esquema de cuatro vías de las orientaciones actuales en neurofenomenología" class="rounded-lg shadow-2xl border border-slate-800 opacity-90 hover:opacity-100 transition-opacity w-full object-cover">';
  const count = html.split(from).length - 1;
  if (count === 1) {
    html = html.split(from).join(to);
    fs.writeFileSync(file, html, "utf8");
    console.log(`Neurofenomenologia.html: ${count} imagen con alt agregado`);
    totalFixed += count;
  } else {
    console.log(`ALERTA Neurofenomenologia.html: ${count} ocurrencias (se esperaba 1)`);
  }
}

console.log(`\nTotal: ${totalFixed} imágenes corregidas`);
