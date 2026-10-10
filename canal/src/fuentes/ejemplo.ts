import type { Historia } from "../esquemas";

/**
 * Historias de ejemplo para probar el pipeline sin red ni claves de APIs de noticias.
 * Son ficticias; NO publicar contenido generado con esta fuente.
 */
export function historiasDeEjemplo(): Historia[] {
  const base = (id: string, h: Omit<Historia, "id" | "publicadaEn" | "fuente">): Historia => ({
    id,
    publicadaEn: new Date().toISOString(),
    fuente: { nombre: "Fuente de ejemplo", url: `https://ejemplo.invalid/${id}` },
    ...h,
  });
  return [
    base("ej-1", {
      titulo: "Telescopio espacial capta la imagen más nítida de una nebulosa lejana",
      resumen: "Una agencia espacial difundió una imagen en alta resolución de una nebulosa a 7.000 años luz. Los científicos dicen que ayudará a estudiar cómo nacen las estrellas.",
      categoria: "ciencia",
      puntajeInteres: 82,
    }),
    base("ej-2", {
      titulo: "El presidente visitó la final del torneo juvenil",
      resumen: "El mandatario asistió al partido y saludó a los jugadores.",
      categoria: "deportes",
      puntajeInteres: 60,
    }),
    base("ej-3", {
      titulo: "Equipo local gana la final del torneo de básquet en tiempo extra",
      resumen: "El club se impuso 98 a 95 tras un alargue. Su base anotó 31 puntos y fue elegido el jugador más valioso.",
      categoria: "deportes",
      puntajeInteres: 74,
    }),
    base("ej-4", {
      titulo: "Una app traduce el lenguaje de señas en tiempo real",
      resumen: "Un grupo de estudiantes desarrolló una aplicación que reconoce gestos con la cámara del celular y los convierte en texto. La probarán en escuelas.",
      categoria: "tecnologia",
      puntajeInteres: 79,
    }),
    base("ej-5", {
      titulo: "Tensión militar en la frontera entre dos países",
      resumen: "Se reportan movimientos de tropas.",
      categoria: "mundo",
      puntajeInteres: 90,
    }),
    base("ej-6", {
      titulo: "Llega un frente frío: temperaturas de hasta 4 °C el fin de semana",
      resumen: "El servicio meteorológico anticipa un descenso de temperatura desde el viernes, con mínimas de 4 °C y cielo despejado el domingo.",
      categoria: "clima",
      puntajeInteres: 70,
    }),
    base("ej-7", {
      titulo: "La receta de pan casero sin amasado se vuelve viral",
      resumen: "Un método de pan con levado largo y sin amasado suma millones de reproducciones. Lleva harina, agua, sal y poca levadura.",
      categoria: "cocina",
      puntajeInteres: 68,
    }),
    base("ej-8", {
      titulo: "Rescatan a un pingüino perdido a 2.000 km de su colonia",
      resumen: "Voluntarios encontraron al ave en una playa, la atendieron en un centro de fauna y la liberarán cuando recupere peso.",
      categoria: "naturaleza",
      puntajeInteres: 77,
    }),
  ];
}
