// Fuente única de verdad de "La Mente en la Vida" (Evan Thompson). A
// diferencia de los demás libros, cada página es una app de React
// renderizada en el navegador (JSX vía Babel Standalone) dentro de
// <div id="root">; su propio header fijo (con panel "Contenido") ya
// existe pero queda invisible detrás de SiteNav (ambos position:fixed
// top:0, SiteNav gana por z-index) y su tabla de contenidos solo enlaza
// el capítulo 1 (el resto son "#" sin conectar). Se deja ese header
// intacto (no se toca JSX) y se agrega ChapterNav + BookNav como HTML
// estático por fuera de #root, arriba y abajo.
//
// Faltan los capítulos 10 y 11 (nunca migrados); la numeración salta de
// MIL_09 a MIL_12 a propósito, no es un error de este script.
export const accent = "Evan Thompson";
export const indexSlug = "MIL_PORTADA.HTML";

export const chapters = [
  { slug: "MIL_01.HTML", label: "Cap. 1", title: "1. Ciencia cognitiva y experiencia humana" },
  { slug: "MIL_02.HTML", label: "Cap. 2", title: "2. La conexión fenomenológica" },
  { slug: "MIL_03.HTML", label: "Cap. 3", title: "3. Autonomía y emergencia" },
  { slug: "MIL_04.HTML", label: "Cap. 4", title: "4. La estructura del comportamiento" },
  { slug: "MIL_05.HTML", label: "Cap. 5", title: "5. Autopoiesis: la organización de lo vivo" },
  { slug: "MIL_06.HTML", label: "Cap. 6", title: "6. Vida y mente: la filosofía del organismo" },
  { slug: "MIL_07.HTML", label: "Cap. 7", title: "7. Haciendo camino al andar: desarrollo y evolución" },
  { slug: "MIL_08.HTML", label: "Cap. 8", title: "8. La vida más allá de la brecha" },
  { slug: "MIL_09.HTML", label: "Cap. 9", title: "9. Subjetividad sensoriomotora" },
  { slug: "MIL_12.HTML", label: "Cap. 12", title: "12. Dinamismo primordial: emoción y valencia" },
  { slug: "MIL_13.HTML", label: "Cap. 13", title: "13. Empatía y enculturación" },
  { slug: "MIL_APENDICE_A.HTML", label: "Apéndice A", title: "Apéndice A: Husserl y la ciencia cognitiva" },
  { slug: "MIL_APENDICE_B.HTML", label: "Apéndice B", title: "Apéndice B: Emergencia y causación descendente" },
  { slug: "MIL_NOTAS.HTML", label: "Notas", title: "Notas" },
  { slug: "MIL_REFERENCIAS.HTML", label: "Referencias", title: "Referencias" },
  { slug: "MIL_INDICE_CONCEPTOS.HTML", label: "Índice", title: "Índice de conceptos" },
];
