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
};

export const FPS = 30;
export const SEG_CORTINA = 3;

export const duracionTotalFrames = (p: NoticieroProps): number =>
  Math.round(SEG_CORTINA * FPS) + p.escenas.reduce((acc, e) => acc + Math.max(1, Math.round(e.duracionSeg * FPS)), 0);
