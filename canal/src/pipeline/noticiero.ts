/**
 * Pipeline del MVP: noticiero diario.
 *   investigar → cumplimiento (reglas + agente) → editor jefe → guionista
 *   → cumplimiento del guion (con 1 reescritura) → plan de promoción en redes
 *
 * Uso:  npm run canal:noticiero -- [--fuente=ejemplo|rss]
 * Salida: canal/salida/<fecha>/noticiero/
 */
import { cargarPersonajes, cargarPrograma } from "../config";
import { investigar, type NombreFuente } from "../fuentes";
import { escribirGuion, filtrarHistorias, planificarPromocion, revisarGuion, seleccionar } from "../agentes";
import { MODELO } from "../llm";
import { carpetaSalida, guardarJson, guionAMarkdown } from "../salida";
import fs from "node:fs";
import path from "node:path";

function argumento(nombre: string, porDefecto: string): string {
  const arg = process.argv.find((a) => a.startsWith(`--${nombre}=`));
  return arg ? arg.split("=")[1] : porDefecto;
}

async function main(): Promise<void> {
  const fuente = argumento("fuente", "ejemplo") as NombreFuente;
  const programa = cargarPrograma("noticiero");
  const personajes = cargarPersonajes(programa.conductores);
  const dir = carpetaSalida(programa.id);
  console.log(`📺 ${programa.nombre} · fuente=${fuente} · modelo=${MODELO}`);

  const historias = await investigar(fuente);
  guardarJson(dir, "1-historias.json", historias);
  console.log(`🔎 Investigación: ${historias.length} historias`);
  if (historias.length === 0) throw new Error("No hay historias: revisá config/fuentes.json o usá --fuente=ejemplo");

  const { aptas, descartes } = await filtrarHistorias(historias);
  guardarJson(dir, "2-cumplimiento.json", { aptas: aptas.map((h) => h.id), descartes });
  console.log(`🛡️  Cumplimiento: ${aptas.length} aptas, ${descartes.length} descartadas`);
  for (const d of descartes) console.log(`   ✗ [${d.etapa}] ${d.titulo} — ${d.motivo}`);
  if (aptas.length === 0) throw new Error("Ninguna historia pasó cumplimiento");

  const seleccion = await seleccionar(programa, aptas);
  guardarJson(dir, "3-seleccion.json", seleccion);
  console.log(`🗂️  Editor jefe: ${seleccion.bloques.length} bloques · "${seleccion.titularApertura}"`);

  let guion = await escribirGuion(programa, seleccion, aptas, personajes);
  let revision = await revisarGuion(guion, aptas);
  if (!revision.aprobado) {
    console.log(`✍️  Guion observado (${revision.observaciones.length}); reescribiendo una vez…`);
    guion = await escribirGuion(programa, seleccion, aptas, personajes, revision.observaciones);
    revision = await revisarGuion(guion, aptas);
  }
  guardarJson(dir, "4-guion.json", guion);
  guardarJson(dir, "5-revision.json", revision);
  fs.writeFileSync(path.join(dir, "guion.md"), guionAMarkdown(guion, aptas, personajes));

  if (!revision.aprobado) {
    console.error("❌ El guion no pasó cumplimiento. Observaciones:");
    for (const o of revision.observaciones) console.error(`   - ${o}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✅ Guion aprobado: ${guion.escenas.length} escenas, ~${Math.round(guion.duracionEstimadaSeg / 60)} min`);

  const promo = await planificarPromocion(programa, guion);
  guardarJson(dir, "6-promocion.json", promo);
  console.log(`📣 Marketing: ${promo.piezas.length} piezas para redes`);
  console.log(`\n📁 Salida en ${path.relative(process.cwd(), dir)}`);
  console.log("👀 Siguiente paso: revisión humana de guion.md antes de generar video.");
}

main().catch((err: unknown) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
