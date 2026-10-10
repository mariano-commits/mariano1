/**
 * Primer filtro, determinístico y barato: descarta historias con palabras clave
 * de temas prohibidos ANTES de gastar en el LLM. Es deliberadamente agresivo
 * (prefiere falsos positivos); el agente de Cumplimiento cubre lo que esto no ve.
 *
 * Cada patrón es una raíz que matchea al inicio de palabra sobre texto
 * normalizado (minúsculas, sin acentos). Ej: "elecci" → elección, elecciones.
 */
const PATRONES: Record<string, string[]> = {
  politica: [
    "elecci", "electoral", "candidat", "presiden", "vicepresiden", "gobiern", "gobernador",
    "intendente", "alcalde", "ministr", "diputad", "senad", "legislat", "parlament",
    "congresista", "oficialismo", "oposicion", "peronis", "kirchner", "libertari",
    "partido politico", "campana electoral", "votacion", "referendum", "sancion economica",
    "politic", "election", "president", "senator", "congressm", "parliament", "prime minister",
    "democrat", "republican",
  ],
  guerra: [
    "guerra", "belic", "militar", "ejercito", "bombarde", "misil", "dron de ataque",
    "invasion", "tropas", "armamento", "ataque armado", "terroris", "atentado",
    "conflicto armado", "hamas", "hezbol", "otan", "nato", "war ", "military", "missile",
    "airstrike", "troops",
  ],
  violencia: [
    "asesin", "homicid", "femicid", "masacre", "tiroteo", "apunal", "secuestr", "violaci",
    "murder", "shooting",
  ],
  apuestas_drogas: ["apuestas deportivas", "casa de apuestas", "casino", "narco", "cocaina", "betting"],
};

export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const REGEX = Object.entries(PATRONES).map(([tema, raices]) => ({
  tema,
  regex: new RegExp(`(^|[^a-z0-9])(${raices.map(escapar).join("|")})`, "i"),
}));

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface ResultadoReglas {
  bloqueada: boolean;
  tema?: string;
  coincidencia?: string;
}

export function evaluarPorReglas(texto: string): ResultadoReglas {
  const t = ` ${normalizar(texto)} `;
  for (const { tema, regex } of REGEX) {
    const m = t.match(regex);
    if (m) return { bloqueada: true, tema, coincidencia: m[2] };
  }
  return { bloqueada: false };
}
