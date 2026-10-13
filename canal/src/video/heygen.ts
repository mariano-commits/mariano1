/**
 * Adaptador de HeyGen (avatares parlantes). Aislado acá porque HeyGen está migrando
 * su API (v2 → v3): si cambia un endpoint o un campo, se toca solo este archivo.
 *
 * ⚠️ Escrito contra la API v2 documentada (POST /v2/video/generate + estado por
 * /v1/video_status.get) sin poder probarlo contra una cuenta real. Antes de producir,
 * correr una prueba con una sola escena: `npm run canal:video -- --heygen --escenas=1`.
 */
import fs from "node:fs";

const BASE = process.env.HEYGEN_API_BASE ?? "https://api.heygen.com";

function clave(): string {
  const k = process.env.HEYGEN_API_KEY;
  if (!k) throw new Error("Falta HEYGEN_API_KEY");
  return k;
}

export function heygenDisponible(): boolean {
  return Boolean(process.env.HEYGEN_API_KEY);
}

async function llamar(ruta: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE}${ruta}`, {
    ...init,
    headers: { "X-Api-Key": clave(), "Content-Type": "application/json", Accept: "application/json", ...init.headers },
    signal: AbortSignal.timeout(60_000),
  });
  const cuerpo = await res.text();
  let json: any;
  try {
    json = JSON.parse(cuerpo);
  } catch {
    throw new Error(`HeyGen ${ruta}: HTTP ${res.status} respuesta no JSON: ${cuerpo.slice(0, 200)}`);
  }
  if (!res.ok || json.error) {
    throw new Error(`HeyGen ${ruta}: HTTP ${res.status} ${JSON.stringify(json.error ?? json).slice(0, 300)}`);
  }
  return json;
}

export interface PedidoClip {
  avatarId: string;
  vozId: string;
  texto: string;
  colorFondo: string;
}

/** Pide un clip de un solo avatar hablando. Devuelve el video_id. */
export async function crearClip(p: PedidoClip): Promise<string> {
  const json = await llamar("/v2/video/generate", {
    method: "POST",
    body: JSON.stringify({
      video_inputs: [
        {
          character: { type: "avatar", avatar_id: p.avatarId, avatar_style: "normal" },
          voice: { type: "text", input_text: p.texto, voice_id: p.vozId },
          background: { type: "color", value: p.colorFondo },
        },
      ],
      dimension: { width: 1920, height: 1080 },
    }),
  });
  const id = json?.data?.video_id;
  if (!id) throw new Error(`HeyGen no devolvió video_id: ${JSON.stringify(json).slice(0, 300)}`);
  return id;
}

/** Espera a que el clip termine y devuelve la URL de descarga (prefirmada, expira: descargar enseguida). */
export async function esperarClip(videoId: string, timeoutMin = 20): Promise<string> {
  const limite = Date.now() + timeoutMin * 60_000;
  while (Date.now() < limite) {
    const json = await llamar(`/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`);
    const d = json?.data ?? {};
    if (d.status === "completed" && d.video_url) return d.video_url;
    if (d.status === "failed" || d.status === "cancelled") {
      throw new Error(`HeyGen falló el clip ${videoId}: ${JSON.stringify(d.error ?? d.failure_message ?? d).slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  throw new Error(`HeyGen: timeout esperando el clip ${videoId}`);
}

export async function descargar(url: string, destino: string): Promise<void> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10 * 60_000) });
  if (!res.ok) throw new Error(`Descarga fallida (HTTP ${res.status})`);
  fs.writeFileSync(destino, Buffer.from(await res.arrayBuffer()));
}

const resueltos = new Map<string, Promise<string>>();

/**
 * Si el personaje tiene un look ("corporate 2"), busca dentro del grupo de avatares
 * el avatar_id de ese look. Si el ID ya es el del look o la consulta falla, usa el ID tal cual.
 * ⚠️ Endpoint de grupos (/v2/avatar_group/{id}/avatars) sin verificar contra una cuenta real.
 */
export function resolverAvatar(avatarId: string, look?: string | null): Promise<string> {
  if (!look) return Promise.resolve(avatarId);
  const clave = `${avatarId}|${look}`;
  if (!resueltos.has(clave)) resueltos.set(clave, buscarLook(avatarId, look));
  return resueltos.get(clave)!;
}

async function buscarLook(grupoId: string, look: string): Promise<string> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  try {
    const json = await llamar(`/v2/avatar_group/${encodeURIComponent(grupoId)}/avatars`);
    const lista: any[] = json?.data?.avatar_list ?? json?.data?.avatars ?? [];
    const candidatos = lista.filter((a) => norm(String(a.avatar_name ?? a.name ?? "")).includes(norm(look)));
    if (candidatos.length === 1) {
      const id = candidatos[0].avatar_id ?? candidatos[0].id;
      console.log(`   🎭 ${grupoId} · "${look}" → ${id}`);
      return id;
    }
    console.warn(
      `   ⚠️  Look "${look}" ${candidatos.length === 0 ? "no encontrado" : "ambiguo"} en ${grupoId}` +
        ` (disponibles: ${lista.map((a) => a.avatar_name ?? a.name).join(", ") || "ninguno"}); uso el ID tal cual`,
    );
  } catch (err) {
    console.warn(`   ⚠️  No se pudo resolver el look "${look}" (${err instanceof Error ? err.message : err}); uso el ID tal cual`);
  }
  return grupoId;
}
