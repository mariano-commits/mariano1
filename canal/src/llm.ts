import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { leerTexto } from "./config";

export const MODELO = process.env.CANAL_MODELO ?? "claude-opus-5-5";

// Modelos que aceptan `fallbacks: "default"` (reintento automático en otro modelo
// si el principal declina por sus clasificadores de seguridad).
const MODELOS_CON_FALLBACK = new Set([
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-fable-5-1",
  "claude-sonnet-5-5",
]);

let cliente: Anthropic | undefined;
function obtenerCliente(): Anthropic {
  // Toma las credenciales de ANTHROPIC_API_KEY (o de `ant auth login`).
  cliente ??= new Anthropic();
  return cliente;
}

type Esfuerzo = "low" | "medium" | "high" | "xhigh" | "max";

/**
 * Ejecuta un agente: system = política editorial + prompt del rol (estable, se cachea);
 * user = la entrada en JSON. Devuelve la salida validada contra `esquema`.
 */
export async function ejecutarAgente<T extends z.ZodType>(
  promptRol: string,
  entrada: unknown,
  esquema: T,
  esfuerzo: Esfuerzo = "medium",
): Promise<z.infer<T>> {
  const system = `${leerTexto("politica-editorial.md")}\n\n---\n\n${leerTexto(`agentes/${promptRol}`)}`;
  const conFallback = MODELOS_CON_FALLBACK.has(MODELO);

  const respuesta = await obtenerCliente().beta.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    ...(conFallback
      ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
      : {}),
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    output_config: { effort: esfuerzo, format: betaZodOutputFormat(esquema) },
    messages: [{ role: "user", content: JSON.stringify(entrada, null, 2) }],
  });

  if (respuesta.stop_reason === "refusal") {
    throw new Error(`El agente ${promptRol} declinó la tarea: ${respuesta.stop_details?.explanation ?? "sin detalle"}`);
  }
  if (respuesta.stop_reason === "max_tokens") {
    throw new Error(`El agente ${promptRol} se quedó sin tokens de salida`);
  }
  if (respuesta.parsed_output == null) {
    throw new Error(`El agente ${promptRol} no devolvió una salida válida`);
  }
  return respuesta.parsed_output as z.infer<T>;
}
