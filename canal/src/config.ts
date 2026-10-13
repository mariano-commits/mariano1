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

export interface FeedRss {
  nombre: string;
  url: string;
  categoria: string;
}

export interface CiudadClima {
  nombre: string;
  lat: number;
  lon: number;
}

export interface ConfigFuentes {
  region: string;
  nombreRegion: string;
  zonaHoraria: string;
  rss: FeedRss[];
  clima?: { fuente: string; ciudades: CiudadClima[] };
  maxPorFuente: number;
}

interface ArchivoFuentes {
  region: string;
  maxPorFuente: number;
  regiones: Record<string, { nombre: string; zonaHoraria: string; rss: FeedRss[]; clima?: ConfigFuentes["clima"] }>;
}

/** Fuentes de la región pedida (CANAL_REGION, o la `region` por defecto de config/fuentes.json). */
export function cargarFuentes(region = process.env.CANAL_REGION): ConfigFuentes {
  const archivo = leerJson<ArchivoFuentes>("config/fuentes.json");
  const id = region ?? archivo.region;
  const r = archivo.regiones[id];
  if (!r) throw new Error(`Región "${id}" no existe en config/fuentes.json (hay: ${Object.keys(archivo.regiones).join(", ")})`);
  return { region: id, nombreRegion: r.nombre, zonaHoraria: r.zonaHoraria, rss: r.rss, clima: r.clima, maxPorFuente: archivo.maxPorFuente };
}
