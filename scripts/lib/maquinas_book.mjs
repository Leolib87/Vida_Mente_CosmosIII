// Fuente única de verdad de "De Máquinas y Seres Vivos" (Autopoiesis) —
// Maturana & Varela. La portada (indexSlug) es un mini-SPA propio con
// pestañas (Landing/Introducción/Capítulos/Apéndice) que YA funciona y no
// se toca; solo se reemplaza el nav "de arriba" (roto/inconsistente, sin
// dropdown ni anterior/siguiente real entre páginas) de las 8 páginas de
// contenido por ChapterNav + BookNav, igual que en "¿Qué es la Vida?".
export const accent = "Maturana & Varela";
export const indexSlug = "MAQUINA_SERES_VIVOS.html";

export const chapters = [
  { slug: "maquinas_intro.html", label: "Intro", title: "Introducción" },
  { slug: "MAQUINAS_CAPITULO_I.HTML", label: "Cap. I", title: "I. De máquinas vivientes y de las otras" },
  { slug: "Maquinas_cap_2.html", label: "Cap. II", title: "II. Teleonomía, un concepto prescindible" },
  { slug: "MAQUINAS_CAP_3.HTML", label: "Cap. III", title: "III. Materializaciones de la autopoiesis" },
  { slug: "MAQUINAS_CAP_4.HTML", label: "Cap. IV", title: "IV. Diversidad de la autopoiesis" },
  { slug: "MAQUINAS_CAP_5.html", label: "Cap. V", title: "V. Presencia de la autopoiesis" },
  { slug: "MAQUINAS_APENDICE_A.html", label: "Apéndice A", title: "Apéndice A: El sistema nervioso" },
  { slug: "MAQUINAS_APENDICE_B.html", label: "Apéndice B", title: "Apéndice B: Glosario" },
];
