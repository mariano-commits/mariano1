/**
 * Etapa de video: guion aprobado → clips de avatar (HeyGen) → montaje en Remotion → MP4.
 *
 * Uso:
 *   npm run canal:video                          # borrador del último guion (sin HeyGen, gratis)
 *   npm run canal:video -- --demo                # borrador con un guion de ejemplo
 *   npm run canal:video -- --heygen --revisado   # clips reales (requiere HEYGEN_API_KEY)
 *   Opcionales: --fecha=AAAA-MM-DD  --escenas=N (solo las primeras N, para probar)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { cargarPersonajes, cargarPrograma, RAIZ_CANAL } from "../config";
import type { Guion, Historia, RevisionGuion, SeleccionEditorial } from "../esquemas";
import { historiasDeEjemplo } from "../fuentes/ejemplo";
import { carpetaSalida, guardarJson } from "../salida";
import { GUION_DEMO } from "../video/guion-demo";
import { heygenDisponible } from "../video/heygen";
import { prepararNoticiero } from "../video/preparar";

const flag = (n: string) => process.argv.includes(`--${n}`);
const valor = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];

function leer<T>(dir: string, archivo: string): T {
  const ruta = path.join(dir, archivo);
  if (!fs.existsSync(ruta)) throw new Error(`Falta ${path.relative(process.cwd(), ruta)}: corré antes npm run canal:noticiero`);
  return JSON.parse(fs.readFileSync(ruta, "utf8")) as T;
}

function ultimaFecha(): string {
  const base = path.join(RAIZ_CANAL, "salida");
  const fechas = fs.existsSync(base)
    ? fs.readdirSync(base).filter((f) => fs.existsSync(path.join(base, f, "noticiero", "4-guion.json"))).sort()
    : [];
  if (fechas.length === 0) throw new Error("No hay guiones generados: corré npm run canal:noticiero (o usá --demo)");
  return fechas[fechas.length - 1];
}

async function main(): Promise<void> {
  const demo = flag("demo");
  const usarHeygen = flag("heygen");
  const programa = cargarPrograma("noticiero");
  const personajes = cargarPersonajes(programa.conductores);

  let guion: Guion;
  let historias: Historia[];
  let titulares: string[];
  let dir: string;
  let fecha: string;

  if (demo) {
    fecha = new Date().toISOString().slice(0, 10);
    dir = carpetaSalida(programa.id);
    guion = GUION_DEMO;
    historias = historiasDeEjemplo();
    titulares = ["ej-1", "ej-4", "ej-3", "ej-6"].map((id) => historias.find((h) => h.id === id)!.titulo);
  } else {
    fecha = valor("fecha") ?? ultimaFecha();
    dir = path.join(RAIZ_CANAL, "salida", fecha, programa.id);
    guion = leer<Guion>(dir, "4-guion.json");
    const revision = leer<RevisionGuion>(dir, "5-revision.json");
    if (!revision.aprobado) throw new Error("El guion no está aprobado por Cumplimiento; no se genera video");
    historias = leer<Historia[]>(dir, "1-historias.json");
    const seleccion = leer<SeleccionEditorial>(dir, "3-seleccion.json");
    titulares = seleccion.bloques.map((b) => historias.find((h) => h.id === b.historiaId)?.titulo).filter((t): t is string => Boolean(t));
  }

  if (usarHeygen) {
    if (!heygenDisponible()) throw new Error("--heygen requiere HEYGEN_API_KEY");
    // Compuerta humana: los clips cuestan créditos y el contenido sale al público.
    if (!flag("revisado")) throw new Error("--heygen requiere --revisado: confirmá que una persona leyó guion.md");
  }

  console.log(`🎞️  ${programa.nombre} · ${fecha} · ${usarHeygen ? "HeyGen" : "borrador"}`);
  const props = await prepararNoticiero(programa, guion, historias, personajes, titulares, {
    usarHeygen,
    carpetaPublica: `canal/${fecha}/${programa.id}`,
    maxEscenas: valor("escenas") ? Number(valor("escenas")) : undefined,
  });
  guardarJson(dir, "7-video-props.json", props);

  const salida = path.join(dir, usarHeygen ? "noticiero.mp4" : "noticiero-borrador.mp4");
  const args = ["remotion", "render", "src/index.ts", "Noticiero", salida, `--props=${path.join(dir, "7-video-props.json")}`];
  // Permite usar un Chromium ya instalado en lugar de que Remotion descargue el suyo.
  if (process.env.CANAL_BROWSER) args.push(`--browser-executable=${process.env.CANAL_BROWSER}`);
  execFileSync("npx", args, { stdio: "inherit" });

  console.log(`\n✅ Video: ${path.relative(process.cwd(), salida)}`);
}

main().catch((err: unknown) => {
  console.error("❌", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
