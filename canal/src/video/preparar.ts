import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import type { EscenaVideo, NoticieroProps } from "../../../src/canal/tipos";
import type { Guion, Historia, Personaje, Programa } from "../esquemas";
import { crearClip, descargar, esperarClip } from "./heygen";

/** Velocidad de lectura para estimar la duración de escenas borrador. */
const PALABRAS_POR_SEG = 2.6;
const COLOR_FONDO = "#16294d";

export interface OpcionesPreparar {
  usarHeygen: boolean;
  /** Carpeta dentro de public/ donde quedan los clips (Remotion lee de public/). */
  carpetaPublica: string;
  maxEscenas?: number;
}

export async function prepararNoticiero(
  programa: Programa,
  guion: Guion,
  historias: Historia[],
  personajes: Personaje[],
  titulares: string[],
  op: OpcionesPreparar,
): Promise<NoticieroProps> {
  const porId = new Map(personajes.map((p) => [p.id, p]));
  const fuentes = new Map(historias.map((h) => [h.id, h.fuente.nombre]));
  const escenas = guion.escenas.slice(0, op.maxEscenas ?? guion.escenas.length);
  fs.mkdirSync(path.join("public", op.carpetaPublica), { recursive: true });

  const resultado = await mapearConLimite(escenas, 3, async (e, i): Promise<EscenaVideo> => {
    const p = porId.get(e.personajeId);
    const base: Omit<EscenaVideo, "videoSrc" | "duracionSeg"> = {
      tipo: e.tipo,
      personaje: { nombre: p?.nombre ?? e.personajeId, rol: p?.rol ?? "" },
      texto: e.texto,
      zocalo: e.zocalo,
      fuentes: [...new Set(e.fuentes.map((id) => fuentes.get(id)).filter((f): f is string => Boolean(f)))],
    };

    if (op.usarHeygen && p?.avatarId && p.vozId) {
      // Nombre por hash del contenido: re-correr no vuelve a pagar clips ya generados.
      const hash = createHash("sha1").update(`${p.avatarId}|${p.vozId}|${e.texto}`).digest("hex").slice(0, 10);
      const relativo = `${op.carpetaPublica}/escena-${String(i + 1).padStart(2, "0")}-${hash}.mp4`;
      const absoluto = path.join("public", relativo);
      if (!fs.existsSync(absoluto)) {
        console.log(`   🎬 HeyGen escena ${i + 1} (${base.personaje.nombre})…`);
        const id = await crearClip({ avatarId: p.avatarId, vozId: p.vozId, texto: e.texto, colorFondo: COLOR_FONDO });
        await descargar(await esperarClip(id), absoluto);
      } else {
        console.log(`   ♻️  escena ${i + 1}: clip en caché`);
      }
      return { ...base, videoSrc: relativo, duracionSeg: await duracionDe(absoluto) };
    }

    if (op.usarHeygen) console.log(`   📝 escena ${i + 1}: ${base.personaje.nombre} no tiene avatarId/vozId → borrador`);
    const palabras = e.texto.split(/\s+/).filter(Boolean).length;
    return { ...base, videoSrc: null, duracionSeg: Math.max(3, Math.ceil(palabras / PALABRAS_POR_SEG)) };
  });

  return {
    programa: programa.nombre,
    titulo: guion.titulo,
    fecha: new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    titulares,
    escenas: resultado,
  };
}

async function duracionDe(archivo: string): Promise<number> {
  const { durationInSeconds } = await parseMedia({
    src: path.resolve(archivo),
    reader: nodeReader,
    fields: { durationInSeconds: true },
    acknowledgeRemotionLicense: true,
  });
  if (!durationInSeconds) throw new Error(`No se pudo leer la duración de ${archivo}`);
  return durationInSeconds;
}

async function mapearConLimite<T, R>(items: T[], limite: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const salida: R[] = new Array(items.length);
  let siguiente = 0;
  await Promise.all(
    Array.from({ length: Math.min(limite, items.length) }, async () => {
      while (siguiente < items.length) {
        const i = siguiente++;
        salida[i] = await fn(items[i], i);
      }
    }),
  );
  return salida;
}
