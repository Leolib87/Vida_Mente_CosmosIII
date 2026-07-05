// Fuente única de verdad de los capítulos de "¿Qué es la Vida?" (Erwin
// Schrödinger). La usa scripts/add_book_nav_que_es_la_vida.mjs para inyectar
// ChapterNav + BookNav (ver scripts/lib/book_nav_templates.mjs) en las 11
// páginas del libro. La portada (indexSlug) queda fuera del arreglo, igual
// que "principio-vida" en src/data/bookChapters.js: es la página de índice,
// no un capítulo.
export const accent = "Erwin Schrödinger";
export const indexSlug = "Que_es_la_Vida.html";

export const chapters = [
  { slug: "Que_es_la_vida_Prefacio.html", label: "Prefacio", title: "Prefacio" },
  { slug: "Que_Es_la_vidaa_cap1.html", label: "Cap. 1", title: "1. Perspectiva desde la física clásica" },
  { slug: "que_es _la_vida_cap2.html", label: "Cap. 2", title: "2. El mecanismo de la herencia" },
  { slug: "QUE_ES_LA_VIDA_CAP3.HTML", label: "Cap. 3", title: "3. Mutaciones" },
  { slug: "QUE_ES_LA_VIDA_CAP4.HTML", label: "Cap. 4", title: "4. La evidencia según la mecánica cuántica" },
  { slug: "QUE_ES_LA_VIDA_CAP5.HTML", label: "Cap. 5", title: "5. Discusión y verificación del modelo de Delbrück" },
  { slug: "QUE_ES_LA_VIDA_CAP6.HTML", label: "Cap. 6", title: "6. Orden, desorden y entropía" },
  { slug: "QUE_ES_LA_VIDA_CAP7.HTML", label: "Cap. 7", title: "7. ¿Está basada la vida en las leyes de la física?" },
  { slug: "QUE_ES_LA_VIDA_EPILOGO.HTML", label: "Epílogo", title: "Epílogo: Sobre el determinismo y el libre albedrío" },
  { slug: "QUE_ES_LA_VIDA_NOTAS.HTML", label: "Notas", title: "Notas" },
  { slug: "QUE_ES_LA_VIDA_BIOGRAFIA.HTML", label: "Biografía", title: "Biografía" },
];

// Secciones internas por capítulo para ChapterNav ("Índice del capítulo").
// Los capítulos 1-7 ya traen subtítulos numerados con id real en su HTML
// (cap1-1, cap1-2...); se listan explícitos (en vez de generarlos por script)
// para poder curar la redacción del label como en bookChapters.js. Portada/
// Prefacio/Epílogo/Notas son de una sola sección (su contenido no está
// subdividido con anclas propias) y Biografía reutiliza el mismo patrón de
// 3 anclas que epv-biografia.astro.
export const sections = {
  "Que_es_la_Vida.html": [{ href: "#presentacion", label: "Presentación" }],
  "Que_es_la_vida_Prefacio.html": [{ href: "#prefacio", label: "Prefacio" }],
  "Que_Es_la_vidaa_cap1.html": [
    { href: "#cap1-1", label: "1.1. Características de la investigación" },
    { href: "#cap1-2", label: "1.2. Física estadística" },
    { href: "#cap1-3", label: "1.3. La perspectiva del físico ingenuo" },
    { href: "#cap1-4", label: "1.4. ¿Por qué tan pequeños los átomos?" },
    { href: "#cap1-6", label: "1.6. Leyes físicas exactas" },
    { href: "#cap1-8", label: "1.8. Primer ejemplo: paramagnetismo" },
    { href: "#cap1-9", label: "1.9. Segundo ejemplo: movimiento browniano" },
    { href: "#cap1-11", label: "1.11. La regla de √n" },
  ],
  "que_es _la_vida_cap2.html": [
    { href: "#cap2-1", label: "2.1. La suposición del físico clásico" },
    { href: "#cap2-2", label: "2.2. El mensaje cifrado de la herencia" },
    { href: "#cap2-3", label: "2.3. Crecimiento por división celular" },
    { href: "#cap2-5", label: "2.5. División reductora y fertilización" },
    { href: "#cap2-8", label: "2.8. Entrecruzamiento" },
    { href: "#cap2-9", label: "2.9. Tamaño máximo de un gen" },
    { href: "#cap2-11", label: "2.11. Permanencia" },
  ],
  "QUE_ES_LA_VIDA_CAP3.HTML": [
    { href: "#cap3-1", label: "3.1. Mutaciones discontinuas" },
    { href: "#cap3-2", label: "3.2. Herencia de las mutaciones" },
    { href: "#cap3-3", label: "3.3. Localización, recesividad y dominancia" },
    { href: "#cap3-4", label: "3.4. Lenguaje técnico" },
    { href: "#cap3-8", label: "3.8. Mutaciones por rayos X" },
    { href: "#cap3-9", label: "3.9. Primera ley: evento aislado" },
    { href: "#cap3-10", label: "3.10. Segunda ley: localización" },
  ],
  "QUE_ES_LA_VIDA_CAP4.HTML": [
    { href: "#cap4-1", label: "4.1. Permanencia inexplicable por la física clásica" },
    { href: "#cap4-2", label: "4.2. Explicable por la teoría cuántica" },
    { href: "#cap4-3", label: "4.3. Estados discretos, saltos cuánticos" },
    { href: "#cap4-4", label: "4.4. Moléculas" },
    { href: "#cap4-5", label: "4.5. Estabilidad y temperatura" },
    { href: "#cap4-6", label: "4.6. Interludio matemático" },
  ],
  "QUE_ES_LA_VIDA_CAP5.HTML": [
    { href: "#cap5-1", label: "5.1. Imagen general de la sustancia hereditaria" },
    { href: "#cap5-6", label: "5.6. El sólido aperiódico" },
    { href: "#cap5-8", label: "5.8. Comparación con los hechos" },
    { href: "#cap5-9", label: "5.9. Estabilidad de los genes" },
    { href: "#cap5-12", label: "5.12. Cómo producen mutaciones los rayos X" },
    { href: "#cap5-14", label: "5.14. Mutaciones reversibles" },
  ],
  "QUE_ES_LA_VIDA_CAP6.HTML": [
    { href: "#cap6-1", label: "6.1. Una notable conclusión general" },
    { href: "#cap6-2", label: "6.2. Orden basado en orden" },
    { href: "#cap6-3", label: "6.3. La materia viva elude el equilibrio" },
    { href: "#cap6-4", label: "6.4. La vida se alimenta de entropía negativa" },
    { href: "#cap6-5", label: "6.5. ¿Qué es entropía?" },
    { href: "#cap6-7", label: "6.7. Orden extraído del entorno" },
  ],
  "QUE_ES_LA_VIDA_CAP7.HTML": [
    { href: "#cap7-1", label: "7.1. Nuevas leyes esperables en el organismo" },
    { href: "#cap7-3", label: "7.3. Resumen de la situación física" },
    { href: "#cap7-4", label: "7.4. El sorprendente contraste" },
    { href: "#cap7-5", label: "7.5. Dos modos de producir orden" },
    { href: "#cap7-9", label: "7.9. Teorema de Nernst" },
    { href: "#cap7-11", label: "7.11. Mecanismo de relojería y organismo" },
  ],
  "QUE_ES_LA_VIDA_EPILOGO.HTML": [{ href: "#epilogo", label: "Epílogo" }],
  "QUE_ES_LA_VIDA_NOTAS.HTML": [{ href: "#notas", label: "Notas" }],
  "QUE_ES_LA_VIDA_BIOGRAFIA.HTML": [
    { href: "#introduccion", label: "Introducción" },
    { href: "#biografia", label: "Biografía" },
    { href: "#cronologia", label: "Cronología" },
  ],
};
