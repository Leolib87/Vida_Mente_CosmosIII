// Fuente única de verdad de los capítulos del libro "El Principio Vida" (Hans
// Jonas) ya migrados a Astro. La usan BookNav.astro (navegación prev/next +
// desplegable "Índice del libro"). Al migrar un capítulo nuevo (EPV10–12,
// biografía, epílogo, notas), añadir aquí su entrada EN ORDEN y listo: se
// propaga a toda la navegación del libro.
//
//   slug:  nombre de la página sin extensión (coincide con src/pages/<slug>.astro)
//   label: etiqueta corta para los botones "Anterior/Siguiente" (compacto)
//   title: título completo del capítulo para el desplegable "Índice del libro"
export const chapters = [
  { slug: "epv-prologo", label: "Prólogo", title: "Prólogo" },
  { slug: "epv-01", label: "Cap. 1", title: "1. Vida y cuerpo en la doctrina del ser" },
  { slug: "epv-02", label: "Cap. 2", title: "2. Percepción, causalidad y teleología" },
  { slug: "epv-03", label: "Cap. 3", title: "3. Aspectos filosóficos del darwinismo" },
  { slug: "epv-04", label: "Cap. 4", title: "4. Armonía, equilibrio y devenir" },
  { slug: "epv-05", label: "Cap. 5", title: "5. ¿Es Dios un matemático? (Metabolismo)" },
  { slug: "epv-06", label: "Cap. 6", title: "6. Movimiento y sentimiento" },
  { slug: "epv-07", label: "Cap. 7", title: "7. Cibernética y fin. Una crítica" },
  { slug: "epv-08", label: "Cap. 8", title: "8. La nobleza de la vista" },
  { slug: "epv-09", label: "Cap. 9", title: "9. Homo Pictor: Libertad de la imagen" },
];
