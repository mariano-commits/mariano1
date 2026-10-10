import { ejecutarAgente } from "./llm";
import { evaluarPorReglas } from "./cumplimiento/reglas";
import {
  EvaluacionCumplimiento,
  Guion,
  PlanPromocion,
  RevisionGuion,
  SeleccionEditorial,
  type Historia,
  type Personaje,
  type Programa,
} from "./esquemas";

export interface Descarte {
  id: string;
  titulo: string;
  etapa: "reglas" | "cumplimiento";
  motivo: string;
}

/** Cumplimiento en dos capas: palabras clave (gratis) y luego el agente LLM. */
export async function filtrarHistorias(historias: Historia[]): Promise<{ aptas: Historia[]; descartes: Descarte[] }> {
  const descartes: Descarte[] = [];
  const candidatas = historias.filter((h) => {
    const r = evaluarPorReglas(`${h.titulo} ${h.resumen}`);
    if (r.bloqueada) {
      descartes.push({ id: h.id, titulo: h.titulo, etapa: "reglas", motivo: `${r.tema}: "${r.coincidencia}"` });
    }
    return !r.bloqueada;
  });
  if (candidatas.length === 0) return { aptas: [], descartes };

  const { evaluaciones } = await ejecutarAgente(
    "editorial/cumplimiento-historias.md",
    { historias: candidatas.map(({ id, titulo, resumen, fuente }) => ({ id, titulo, resumen, fuente: fuente.nombre })) },
    EvaluacionCumplimiento,
    "low",
  );

  // Fail-closed: si el agente no evaluó una historia, no pasa.
  const porId = new Map(evaluaciones.map((e) => [e.id, e]));
  const aptas = candidatas.filter((h) => {
    const e = porId.get(h.id);
    if (e?.apta) return true;
    descartes.push({ id: h.id, titulo: h.titulo, etapa: "cumplimiento", motivo: e?.motivo ?? "sin evaluación" });
    return false;
  });
  return { aptas, descartes };
}

export async function seleccionar(programa: Programa, historias: Historia[]): Promise<SeleccionEditorial> {
  const relevantes = historias.filter((h) => programa.categorias.includes(h.categoria));
  const seleccion = await ejecutarAgente(
    "editorial/editor-jefe.md",
    { programa, historias: relevantes.length > 0 ? relevantes : historias },
    SeleccionEditorial,
  );
  const ids = new Set(historias.map((h) => h.id));
  // Nunca dejar pasar IDs inventados por el modelo.
  return { ...seleccion, bloques: seleccion.bloques.filter((b) => ids.has(b.historiaId)) };
}

export async function escribirGuion(
  programa: Programa,
  seleccion: SeleccionEditorial,
  historias: Historia[],
  personajes: Personaje[],
  observaciones: string[] = [],
): Promise<Guion> {
  const elegidas = historias.filter((h) => seleccion.bloques.some((b) => b.historiaId === h.id));
  return ejecutarAgente(
    "guion/guionista-noticiero.md",
    { programa, seleccion, historias: elegidas, personajes, observacionesCumplimiento: observaciones },
    Guion,
    "high",
  );
}

export async function revisarGuion(guion: Guion, historias: Historia[]): Promise<RevisionGuion> {
  return ejecutarAgente("editorial/cumplimiento-guion.md", { guion, historias }, RevisionGuion, "high");
}

export async function planificarPromocion(programa: Programa, guion: Guion): Promise<PlanPromocion> {
  return ejecutarAgente("marketing/clipper-redes.md", { programa: programa.nombre, guion }, PlanPromocion);
}
