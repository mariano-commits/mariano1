import { createHash } from "node:crypto";
import { CATEGORIAS, type Categoria, type Historia } from "../esquemas";
import type { ConfigFuentes } from "../config";

/** Lector RSS mínimo (sin dependencias): titular, resumen, enlace y fecha. */
export async function leerRss(config: ConfigFuentes): Promise<Historia[]> {
  const resultados = await Promise.allSettled(
    config.rss.map(async (feed) => {
      const res = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${feed.nombre}: HTTP ${res.status}`);
      const xml = await res.text();
      return extraerItems(xml)
        .slice(0, config.maxPorFuente)
        .map((item) => aHistoria(item, feed.nombre, feed.categoria));
    }),
  );

  const historias: Historia[] = [];
  resultados.forEach((r, i) => {
    if (r.status === "fulfilled") historias.push(...r.value);
    else console.warn(`⚠️  No se pudo leer ${config.rss[i].nombre}: ${r.reason}`);
  });
  return historias;
}

interface ItemRss {
  titulo: string;
  resumen: string;
  url: string;
  fecha: string | null;
}

export function extraerItems(xml: string): ItemRss[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  return items
    .map((item) => ({
      titulo: limpiar(etiqueta(item, "title")),
      resumen: limpiar(etiqueta(item, "description")),
      url: limpiar(etiqueta(item, "link")),
      fecha: etiqueta(item, "pubDate") || null,
    }))
    .filter((i) => i.titulo && i.url);
}

function etiqueta(xml: string, nombre: string): string {
  const m = xml.match(new RegExp(`<${nombre}[^>]*>([\\s\\S]*?)</${nombre}>`));
  return m ? m[1] : "";
}

function limpiar(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function aHistoria(item: ItemRss, fuente: string, categoria: string): Historia {
  return {
    id: createHash("sha1").update(item.url).digest("hex").slice(0, 10),
    titulo: item.titulo,
    resumen: item.resumen.slice(0, 600),
    categoria: (CATEGORIAS as readonly string[]).includes(categoria) ? (categoria as Categoria) : "actualidad",
    fuente: { nombre: fuente, url: item.url },
    publicadaEn: item.fecha ? new Date(item.fecha).toISOString() : null,
    // Sin señal de viralidad en RSS: se prioriza por recencia; el Editor Jefe re-pondera.
    puntajeInteres: 50,
  };
}
