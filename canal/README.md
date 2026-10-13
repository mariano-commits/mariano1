# Canal IA: estructura de agentes

Canal de TV 100% producido por IA para YouTube. Esta carpeta tiene la **redacción de agentes**: política editorial, grilla, personajes, prompts de cada rol y el pipeline del MVP (noticiero diario).

## Flujo

```
INVESTIGACIÓN ──► CUMPLIMIENTO ──► EDITOR JEFE ──► GUIONISTA ──► CUMPLIMIENTO ──► MARKETING
 (RSS / APIs)     reglas + IA      selección y      guion por     revisión final   cortos para
                  (política,       orden            escenas       (1 reescritura)  redes
                   guerra…)
                                                                        │
                                                       revisión humana ─┴─► video (HeyGen / Veo) ─► YouTube
```

## Estructura

| Ruta | Qué es |
|---|---|
| `politica-editorial.md` | Reglas que se anteponen a **todos** los agentes: sin política, sin guerra, sin copias, personajes ficticios |
| `config/grilla.json` | Programas, horarios, duración, conductores y estado (`mvp`, `fase-2`…) |
| `config/personajes.json` | Biblia de personajes ficticios (personalidad, voz, aspecto, IDs de avatar y voz) |
| `config/fuentes.json` | Fuentes por región (`es` por defecto, `latam`): feeds RSS por sección y ciudades para el clima |
| `agentes/` | Prompt de cada rol, por área: investigación, editorial, guion, arte, marketing, emisión |
| `src/pipeline/noticiero.ts` | Pipeline del MVP |
| `src/cumplimiento/reglas.ts` | Filtro determinístico por palabras clave (primera barrera, sin costo) |
| `src/fuentes/` | Adaptadores de fuentes (ejemplo, RSS, clima con Open-Meteo). Ahí se suman NewsAPI, YouTube Data API, deportes, etc. |
| `salida/<fecha>/<programa>/` | Resultados de cada corrida (no se versiona) |

### Agentes conectados al código (MVP)

| Agente | Prompt | Esfuerzo |
|---|---|---|
| Cumplimiento (historias) | `agentes/editorial/cumplimiento-historias.md` | low |
| Editor jefe | `agentes/editorial/editor-jefe.md` | medium |
| Guionista del noticiero | `agentes/guion/guionista-noticiero.md` | high |
| Cumplimiento (guion) | `agentes/editorial/cumplimiento-guion.md` | high |
| Clipper y redes | `agentes/marketing/clipper-redes.md` | medium |

Los demás prompts (morning, mesa, infantil, trivia, tendencias, deportes, cocina, escenógrafo, programador, analista) ya están escritos y se conectan en las fases siguientes.

## Uso

```bash
npm install
export ANTHROPIC_API_KEY=...         # o `ant auth login`

npm run canal:noticiero               # con historias de ejemplo (sin red)
npm run canal:noticiero -- --fuente=rss
npm run canal:video -- --demo         # video borrador de ejemplo (sin claves)
npm run canal:video                   # video borrador del último guion
npm run canal:video -- --heygen --revisado --escenas=1   # prueba real con HeyGen (1 escena)
npm run canal:video -- --heygen --revisado               # noticiero completo con avatares
npm run canal:test                    # tests del filtro de cumplimiento
npm run canal:typecheck
```

Variables opcionales:
- `CANAL_MODELO`: modelo de Claude (por defecto `claude-opus-5-5`).
- `HEYGEN_API_KEY`: necesaria para `--heygen`.
- `HEYGEN_API_BASE`: para apuntar a otra versión o host de la API de HeyGen.
- `CANAL_BROWSER`: Chromium ya instalado para Remotion (si no, Remotion descarga el suyo).

## Video (HeyGen + Remotion)

```
guion aprobado ─► por escena: ¿el personaje tiene avatarId + vozId?
                    ├─ sí ─► HeyGen genera el clip ─► public/canal/<fecha>/noticiero/escena-NN-<hash>.mp4
                    └─ no ─► escena BORRADOR (tarjeta + texto, duración estimada por palabras)
               ─► Remotion, composición "Noticiero" (src/canal/): cortina, clips, zócalos, fuente, mosca y ticker
               ─► canal/salida/<fecha>/noticiero/noticiero.mp4
```

- **Modo borrador (por defecto):** es gratis y sirve para revisar ritmo, zócalos y orden sin gastar créditos.
- **`--heygen` exige `--revisado`:** es la compuerta humana, porque los clips cuestan y el contenido sale al público.
- **Caché:** cada clip se nombra con un hash del avatar, la voz y el texto, así que re-correr no vuelve a pagar escenas que no cambiaron.
- **Duración real:** se lee del MP4 descargado con `@remotion/media-parser`, no de la API.
- **Adaptador HeyGen** (`src/video/heygen.ts`): usa la API v3 (`POST /v3/videos`, `GET /v3/videos/{id}`, `GET /v3/avatars/looks`). Probado contra una cuenta real. La v2 se da de baja el 2026-10-31.
- **Avatares:** Inés y Bruno son avatares propios creados desde texto (`POST /v3/avatars` con `type: "prompt"`), con el set incluido en la imagen: redacción para Inés y estudio deportivo para Bruno. Para cambiar el set, generar otro look con el mismo `avatar_id` como referencia.
- **Personajes:** completá `avatarId` (HeyGen), `avatarLook` (versión, opcional) y `vozId` (si es `null`, se usa la voz por defecto del avatar) (voz de HeyGen; las voces de ElevenLabs se pueden vincular desde la cuenta de HeyGen) en `config/personajes.json`. Para Nube, el personaje animado, se necesita un avatar a partir de una imagen animada; mientras no lo tenga, sale como borrador.
- **Diseño:** editar `src/canal/Noticiero.tsx`. Para previsualizarlo, `npm start` abre Remotion Studio con la composición "Noticiero".

Salida en `canal/salida/<fecha>/noticiero/`:
`1-historias.json` → `2-cumplimiento.json` → `3-seleccion.json` → `4-guion.json` + `guion.md` → `5-revision.json` → `6-promocion.json`.

## Fuentes

Configuradas por región en `config/fuentes.json`. La región por defecto es `es` (España); se cambia con `CANAL_REGION=latam`.

- **Noticias:** feeds RSS por sección (El País, 20minutos, Xataka, Infosalus) y portadas (El País, La Vanguardia). Hasta `maxPorFuente` notas por feed.
- **Categoría:** la del feed de sección (ciencia, salud, tecnología, deportes, entretenimiento, cocina). Las portadas entran como `actualidad` y van al final del listado, así que al deduplicar gana la versión de sección.
- **Clima:** pronóstico real de hoy y mañana con Open-Meteo (gratis, sin clave) para las ciudades de la región. Entra como una historia de categoría `clima`.
- **En contenedores con proxy** (como Claude Code en la web): el `fetch` de Node no usa el proxy por defecto y algunos medios responden 403. Correr con `NODE_USE_ENV_PROXY=1`.

## Decisiones de diseño

- **Cumplimiento en tres capas:**
  1. Palabras clave, que no cuestan tokens.
  2. Agente sobre las historias.
  3. Agente sobre el guion final.

  Las tres funcionan en modo *fail-closed*: si algo no se pudo evaluar, no pasa.
- **Salidas estructuradas:** cada agente devuelve JSON validado con Zod, y el código descarta los IDs de historia que el modelo invente.
- **Prompt estable cacheado:** el `system` es la política más el rol, siempre igual, así que se cachea entre corridas.
- **Fallback del modelo:** se usa `fallbacks: "default"`. Si el modelo principal declina, la API reintenta con otro modelo automáticamente.
- **Revisión humana obligatoria** en la Fase 1, antes de generar video.

## Próximos pasos

1. Clasificar cada nota con el agente investigador (`agentes/investigacion/investigador-noticias.md`) en lugar de heredar la categoría del feed, y sumar una API de noticias (NewsAPI o Event Registry).
2. Crear los avatares del resto de los personajes (morning, Nube, La Mesa) y revisar que las voces tengan acento de España.
3. Formato largo (15–20 min) con avatar solo en presentaciones y voz en off sobre imágenes para el resto.
4. Agregar la etapa `publicar`: YouTube Data API con Premiere programada, descripción con fuentes y marca de contenido sintético.
5. Programar la corrida diaria (cron o GitHub Actions).
