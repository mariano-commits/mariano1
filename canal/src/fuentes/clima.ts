import type { Historia } from "../esquemas";
import type { ConfigFuentes } from "../config";

/**
 * Pronóstico real para el bloque del clima (Open-Meteo: gratis, sin clave, cobertura mundial).
 * Devuelve una sola Historia de categoría "clima" con hoy y mañana por ciudad de la región,
 * para que el guionista no invente temperaturas.
 */
export async function leerClima(config: ConfigFuentes): Promise<Historia[]> {
  const clima = config.clima;
  if (!clima?.ciudades.length) return [];

  const q = new URLSearchParams({
    latitude: clima.ciudades.map((c) => c.lat).join(","),
    longitude: clima.ciudades.map((c) => c.lon).join(","),
    daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
    timezone: config.zonaHoraria,
    forecast_days: "2",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${q}`;
  let res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  // 429/503 son frecuentes desde IPs compartidas: un reintento corto alcanza.
  if (res.status === 429 || res.status >= 500) {
    await new Promise((r) => setTimeout(r, 5_000));
    res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  }
  if (!res.ok) throw new Error(`Open-Meteo: HTTP ${res.status}`);
  const json = await res.json();
  const datos: any[] = Array.isArray(json) ? json : [json];

  const linea = (d: any, i: number) =>
    `${describir(d.weather_code[i])}, ${Math.round(d.temperature_2m_min[i])} a ${Math.round(d.temperature_2m_max[i])} °C` +
    (d.precipitation_probability_max[i] >= 30 ? `, ${d.precipitation_probability_max[i]}% de probabilidad de lluvia` : "");
  const resumen = clima.ciudades
    .map((c, k) => {
      const d = datos[k]?.daily;
      return d ? `${c.nombre}: hoy ${linea(d, 0)}; mañana ${linea(d, 1)}.` : null;
    })
    .filter(Boolean)
    .join(" ");

  const hoy = datos[0]?.daily?.time?.[0] ?? new Date().toISOString().slice(0, 10);
  return [
    {
      id: `clima-${config.region}-${hoy}`,
      titulo: `El tiempo en ${config.nombreRegion}: hoy y mañana`,
      resumen,
      categoria: "clima",
      fuente: { nombre: clima.fuente, url: "https://open-meteo.com/" },
      publicadaEn: new Date().toISOString(),
      puntajeInteres: 70,
    },
  ];
}

/** Códigos WMO de Open-Meteo, agrupados en descripciones aptas para TV. */
function describir(codigo: number): string {
  if (codigo === 0) return "despejado";
  if (codigo <= 2) return "poco nuboso";
  if (codigo === 3) return "nublado";
  if (codigo <= 48) return "niebla";
  if (codigo <= 57) return "llovizna";
  if (codigo <= 67) return "lluvia";
  if (codigo <= 77) return "nieve";
  if (codigo <= 82) return "chubascos";
  if (codigo <= 86) return "chubascos de nieve";
  return "tormentas";
}
