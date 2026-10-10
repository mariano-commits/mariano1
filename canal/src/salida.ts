import fs from "node:fs";
import path from "node:path";
import { RAIZ_CANAL } from "./config";
import type { Guion, Historia, Personaje } from "./esquemas";

export function carpetaSalida(programaId: string, fecha = new Date()): string {
  const dia = fecha.toISOString().slice(0, 10);
  const dir = path.join(RAIZ_CANAL, "salida", dia, programaId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function guardarJson(dir: string, nombre: string, datos: unknown): void {
  fs.writeFileSync(path.join(dir, nombre), JSON.stringify(datos, null, 2) + "\n");
}

/** Guion legible para revisión humana (y base para el teleprompter / HeyGen). */
export function guionAMarkdown(guion: Guion, historias: Historia[], personajes: Personaje[]): string {
  const nombre = new Map(personajes.map((p) => [p.id, p.nombre]));
  const fuente = new Map(historias.map((h) => [h.id, h.fuente]));
  const min = Math.round(guion.duracionEstimadaSeg / 6) / 10;

  const escenas = guion.escenas.map((e, i) => {
    const fuentes = e.fuentes
      .map((id) => fuente.get(id))
      .filter((f) => f != null)
      .map((f) => `[${f.nombre}](${f.url})`)
      .join(", ");
    return [
      `### ${i + 1}. ${e.tipo.toUpperCase()} — ${nombre.get(e.personajeId) ?? e.personajeId}`,
      "",
      e.texto,
      "",
      `- **Zócalo:** ${e.zocalo}`,
      `- **Visual:** ${e.visual}`,
      fuentes ? `- **Fuentes:** ${fuentes}` : "",
    ]
      .filter((l) => l !== "")
      .join("\n");
  });

  return [`# ${guion.titulo}`, "", `Duración estimada: ${min} min`, "", ...escenas.flatMap((e) => [e, ""])].join("\n");
}
