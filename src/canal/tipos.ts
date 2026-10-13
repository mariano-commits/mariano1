/** Props de la composición "Noticiero". Las arma canal/src/video/preparar.ts. */
export type EscenaVideo = {
  tipo: 'apertura' | 'nota' | 'pase' | 'deportes' | 'clima' | 'cierre';
  personaje: {nombre: string; rol: string};
  texto: string;
  zocalo: string;
  fuentes: string[];
  /** Ruta dentro de public/ del clip del avatar. null = escena borrador (sin avatar). */
  videoSrc: string | null;
  duracionSeg: number;
};

export type NoticieroProps = {
  programa: string;
  titulo: string;
  fecha: string;
  titulares: string[];
  escenas: EscenaVideo[];
  /** Edición regional que se muestra en la portada (ej. "Edición España"). */
  edicion?: string;
};

export const FPS = 30;
/** Portada: apertura con la marca + sumario con un titular cada SEG_POR_TITULAR. */
export const SEG_APERTURA = 6;
export const SEG_POR_TITULAR = 2.5;
export const MAX_TITULARES_SUMARIO = 5;

export const framesPortada = (p: NoticieroProps): number =>
  Math.round((SEG_APERTURA + Math.min(p.titulares.length, MAX_TITULARES_SUMARIO) * SEG_POR_TITULAR) * FPS);

export const duracionTotalFrames = (p: NoticieroProps): number =>
  framesPortada(p) + p.escenas.reduce((acc, e) => acc + Math.max(1, Math.round(e.duracionSeg * FPS)), 0);
