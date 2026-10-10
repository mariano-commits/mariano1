import fs from "node:fs";
import path from "node:path";
import type { Personaje, Programa } from "./esquemas";

/** Raíz de la carpeta `canal/` (los comandos se corren desde la raíz del repo). */
export const RAIZ_CANAL = path.resolve(process.cwd(), "canal");

function leerJson<T>(relativo: string): T {
  return JSON.parse(fs.readFileSync(path.join(RAIZ_CANAL, relativo), "utf8")) as T;
}

export function leerTexto(relativo: string): string {
  return fs.readFileSync(path.join(RAIZ_CANAL, relativo), "utf8");
}

export function cargarPrograma(id: string): Programa {
  const { programas } = leerJson<{ programas: Programa[] }>("config/grilla.json");
  const programa = programas.find((p) => p.id === id);
  if (!programa) throw new Error(`Programa "${id}" no existe en config/grilla.json`);
  return programa;
}

export function cargarPersonajes(ids: string[]): Personaje[] {
  const { personajes } = leerJson<{ personajes: Personaje[] }>("config/personajes.json");
  return ids.map((id) => {
    const p = personajes.find((x) => x.id === id);
    if (!p) throw new Error(`Personaje "${id}" no existe en config/personajes.json`);
    return p;
  });
}

export interface ConfigFuentes {
  rss: { nombre: string; url: string; categoria: string }[];
  maxPorFuente: number;
}

export function cargarFuentes(): ConfigFuentes {
  return leerJson<ConfigFuentes>("config/fuentes.json");
}
