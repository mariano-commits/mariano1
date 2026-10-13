/**
 * Adaptador de HeyGen (avatares parlantes). Aislado acá porque HeyGen está migrando
 * su API (v2 → v3): si cambia un endpoint o un campo, se toca solo este archivo.
 *
 * Usa la API v3 (POST /v3/videos, GET /v3/videos/{id}, GET /v3/avatars/looks).
 * La v2 se da de baja el 2026-10-31 y no ve los looks de los avatares públicos.
 * Para probar cambios: `npm run canal:video -- --demo --heygen --revisado --escenas=1`.
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
    // v3 devuelve { error: { code, message } }; v2 devolvía error null en respuestas OK.
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
  const json = await llamar("/v3/videos", {
    method: "POST",
    body: JSON.stringify({
      type: "avatar",
      avatar_id: p.avatarId,
      script: p.texto,
      voice_id: p.vozId,
      background: { type: "color", value: p.colorFondo },
      aspect_ratio: "16:9",
      resolution: "1080p",
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
    const json = await llamar(`/v3/videos/${encodeURIComponent(videoId)}`);
    const d = json?.data ?? {};
    if (d.status === "completed" && d.video_url) return d.video_url;
    if (d.status === "failed" || d.status === "cancelled") {
      throw new Error(`HeyGen falló el clip ${videoId}: ${d.failure_code ?? ""} ${d.failure_message ?? JSON.stringify(d).slice(0, 300)}`);
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

export interface AvatarResuelto {
  avatarId: string;
  /** Voz por defecto del avatar según HeyGen (se usa si el personaje no tiene vozId). */
  vozDefecto: string | null;
}

const resueltos = new Map<string, Promise<AvatarResuelto>>();

/**
 * Resuelve el avatar a usar. `avatarId` puede ser un look o un grupo (personaje):
 * - Si hay look ("corporate 2"), lista los looks del grupo y elige el único cuyo nombre lo contiene.
 * - Sin look, o si no matchea, usa el ID tal cual (asumiendo que ya es un look).
 * - La voz por defecto sale del look elegido o de GET /v3/avatars/looks/{id}.
 */
export function resolverAvatar(avatarId: string, look?: string | null): Promise<AvatarResuelto> {
  const clave = `${avatarId}|${look ?? ""}`;
  if (!resueltos.has(clave)) resueltos.set(clave, resolver(avatarId, look));
  return resueltos.get(clave)!;
}

async function looksDelGrupo(grupoId: string): Promise<any[]> {
  const looks: any[] = [];
  let token: string | null = null;
  do {
    const q = new URLSearchParams({ group_id: grupoId, limit: "50" });
    if (token) q.set("token", token);
    const json = await llamar(`/v3/avatars/looks?${q}`);
    looks.push(...(json?.data ?? []));
    token = json?.has_more ? json?.next_token : null;
  } while (token);
  return looks;
}

async function resolver(grupoId: string, look?: string | null): Promise<AvatarResuelto> {
  let avatarId = grupoId;
  let vozDefecto: string | null = null;

  if (look) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    try {
      const lista = await looksDelGrupo(grupoId);
      const candidatos = lista.filter((a) => norm(String(a.name ?? "")).includes(norm(look)));
      if (candidatos.length === 1) {
        avatarId = candidatos[0].id;
        vozDefecto = candidatos[0].default_voice_id ?? null;
        console.log(`   🎭 ${grupoId} · "${look}" → ${avatarId} (${candidatos[0].name})`);
      } else {
        console.warn(
          `   ⚠️  Look "${look}" ${candidatos.length === 0 ? "no encontrado" : "ambiguo"} en ${grupoId}` +
            ` (${(candidatos.length ? candidatos : lista).map((a) => a.name).join(", ") || "ninguno"}); uso el ID tal cual`,
        );
      }
    } catch (err) {
      console.warn(`   ⚠️  No se pudo resolver el look "${look}" (${err instanceof Error ? err.message : err}); uso el ID tal cual`);
    }
  }

  if (!vozDefecto) {
    try {
      const json = await llamar(`/v3/avatars/looks/${encodeURIComponent(avatarId)}`);
      vozDefecto = json?.data?.default_voice_id ?? null;
    } catch (err) {
      console.warn(`   ⚠️  No se pudo leer la voz por defecto de ${avatarId} (${err instanceof Error ? err.message : err})`);
    }
  }
  if (vozDefecto) console.log(`   🔊 ${avatarId}: voz por defecto ${vozDefecto}`);
  return { avatarId, vozDefecto };
}
