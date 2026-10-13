import { z } from "zod";

export const CATEGORIAS = [
  "mundo",
  "actualidad",
  "tecnologia",
  "ciencia",
  "salud",
  "deportes",
  "cocina",
  "clima",
  "entretenimiento",
  "curiosidades",
  "naturaleza",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Historia normalizada que producen los investigadores. */
export interface Historia {
  id: string;
  titulo: string;
  resumen: string;
  categoria: Categoria;
  fuente: { nombre: string; url: string };
  publicadaEn: string | null;
  /** 0-100: interés general estimado. */
  puntajeInteres: number;
}

export interface Personaje {
  id: string;
  nombre: string;
  rol: string;
  personalidad: string;
  estiloHabla: string;
  aspecto: string;
  avatarId: string | null;
  /** Nombre del look/versión dentro del avatar de HeyGen (ej. "corporate 2"). */
  avatarLook?: string | null;
  vozId: string | null;
}

export interface Programa {
  id: string;
  nombre: string;
  horario: string;
  duracionMin: number;
  estado: string;
  canal?: string;
  conductores: string[];
  secciones: string[];
  categorias: Categoria[];
  historiasObjetivo: number;
}

// ---- Salidas estructuradas de los agentes (structured outputs) ----

export const EvaluacionCumplimiento = z.object({
  evaluaciones: z.array(
    z.object({
      id: z.string(),
      apta: z.boolean(),
      motivo: z.string(),
    }),
  ),
});
export type EvaluacionCumplimiento = z.infer<typeof EvaluacionCumplimiento>;

export const SeleccionEditorial = z.object({
  titularApertura: z.string(),
  bloques: z.array(
    z.object({
      historiaId: z.string(),
      seccion: z.string(),
      enfoque: z.string(),
      duracionSeg: z.number().int(),
    }),
  ),
});
export type SeleccionEditorial = z.infer<typeof SeleccionEditorial>;

export const Guion = z.object({
  titulo: z.string(),
  duracionEstimadaSeg: z.number().int(),
  escenas: z.array(
    z.object({
      tipo: z.enum(["apertura", "nota", "pase", "deportes", "clima", "cierre"]),
      personajeId: z.string(),
      texto: z.string(),
      zocalo: z.string(),
      visual: z.string(),
      fuentes: z.array(z.string()),
    }),
  ),
});
export type Guion = z.infer<typeof Guion>;

export const RevisionGuion = z.object({
  aprobado: z.boolean(),
  observaciones: z.array(z.string()),
});
export type RevisionGuion = z.infer<typeof RevisionGuion>;

export const PlanPromocion = z.object({
  piezas: z.array(
    z.object({
      red: z.enum(["youtube_shorts", "tiktok", "instagram_reels", "x"]),
      escenaIndice: z.number().int(),
      gancho: z.string(),
      copy: z.string(),
      hashtags: z.array(z.string()),
      duracionSeg: z.number().int(),
    }),
  ),
});
export type PlanPromocion = z.infer<typeof PlanPromocion>;
