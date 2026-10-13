import type { Guion } from "../esquemas";

/** Guion fijo (sobre las historias de ejemplo) para ver el armado de video sin claves. */
export const GUION_DEMO: Guion = {
  titulo: "Una nebulosa nunca vista y una app que traduce señas",
  duracionEstimadaSeg: 60,
  escenas: [
    {
      tipo: "apertura",
      personajeId: "ines-arce",
      texto: "Buenas tardes, esto es Central IA. Hoy: la imagen más nítida de una nebulosa lejana, una app que traduce el lenguaje de señas y el frío que llega el fin de semana.",
      zocalo: "Las noticias del día",
      visual: "Set del noticiero",
      fuentes: [],
    },
    {
      tipo: "nota",
      personajeId: "ines-arce",
      texto: "Según la fuente de ejemplo, un telescopio espacial captó una nebulosa a siete mil años luz con un detalle sin precedentes. Los científicos dicen que ayudará a entender cómo nacen las estrellas.",
      zocalo: "Telescopio capta una nebulosa a 7.000 años luz",
      visual: "Nebulosa generada por IA",
      fuentes: ["ej-1"],
    },
    {
      tipo: "nota",
      personajeId: "ines-arce",
      texto: "Un grupo de estudiantes creó una aplicación que reconoce gestos con la cámara del celular y los convierte en texto. La van a probar en escuelas.",
      zocalo: "Una app traduce lengua de señas en tiempo real",
      visual: "Manos y celular, ilustración",
      fuentes: ["ej-4"],
    },
    {
      tipo: "deportes",
      personajeId: "bruno-kel",
      texto: "¡Final de infarto en el básquet! El equipo local ganó 98 a 95 en tiempo extra y su base metió 31 puntos para quedarse con el premio al más valioso.",
      zocalo: "Campeón en tiempo extra: 98 a 95",
      visual: "Gráfica de marcador",
      fuentes: ["ej-3"],
    },
    {
      tipo: "clima",
      personajeId: "nube",
      texto: "¡Abríguense! Desde el viernes llega un frente frío con mínimas de cuatro grados, pero el domingo viene con cielo despejado.",
      zocalo: "Frente frío: mínimas de 4 °C",
      visual: "Mapa del clima",
      fuentes: ["ej-6"],
    },
    {
      tipo: "cierre",
      personajeId: "ines-arce",
      texto: "Eso es todo por hoy. Central IA es un noticiero producido con inteligencia artificial y personajes ficticios. ¡Hasta mañana!",
      zocalo: "Hasta mañana",
      visual: "Set del noticiero",
      fuentes: [],
    },
  ],
};
