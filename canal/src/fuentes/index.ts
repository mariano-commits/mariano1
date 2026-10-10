import type { Historia } from "../esquemas";
import { cargarFuentes } from "../config";
import { historiasDeEjemplo } from "./ejemplo";
import { leerRss } from "./rss";

export type NombreFuente = "ejemplo" | "rss";

/**
 * Punto único de entrada de los investigadores. Para sumar NewsAPI, Event Registry,
 * YouTube Data API, API-Football, etc., agregar un adaptador que devuelva Historia[].
 */
export async function investigar(fuente: NombreFuente): Promise<Historia[]> {
  const historias = fuente === "ejemplo" ? historiasDeEjemplo() : await leerRss(cargarFuentes());
  return deduplicar(historias);
}

function deduplicar(historias: Historia[]): Historia[] {
  const vistos = new Set<string>();
  return historias.filter((h) => {
    const clave = h.titulo.toLowerCase().replace(/\W+/g, " ").trim();
    if (vistos.has(clave) || vistos.has(h.id)) return false;
    vistos.add(clave);
    vistos.add(h.id);
    return true;
  });
}
