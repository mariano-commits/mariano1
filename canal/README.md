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
| `config/fuentes.json` | Feeds RSS de noticias |
| `agentes/` | Prompt de cada rol, por área: investigación, editorial, guion, arte, marketing, emisión |
| `src/pipeline/noticiero.ts` | Pipeline del MVP |
| `src/cumplimiento/reglas.ts` | Filtro determinístico por palabras clave (primera barrera, sin costo) |
| `src/fuentes/` | Adaptadores de fuentes (ejemplo, RSS). Ahí se suman NewsAPI, YouTube Data API, deportes, etc. |
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
- **Adaptador HeyGen** (`src/video/heygen.ts`): está escrito contra la API v2 (`/v2/video/generate` y `/v1/video_status.get`), pero **sin probar contra una cuenta real**. HeyGen está migrando a v3, así que hay que probar primero con `--escenas=1`.
- **Personajes:** completá `avatarId` (HeyGen) y `vozId` (voz de HeyGen; las voces de ElevenLabs se pueden vincular desde la cuenta de HeyGen) en `config/personajes.json`. Para Nube, el personaje animado, se necesita un avatar a partir de una imagen animada; mientras no lo tenga, sale como borrador.
- **Diseño:** editar `src/canal/Noticiero.tsx`. Para previsualizarlo, `npm start` abre Remotion Studio con la composición "Noticiero".

Salida en `canal/salida/<fecha>/noticiero/`:
`1-historias.json` → `2-cumplimiento.json` → `3-seleccion.json` → `4-guion.json` + `guion.md` → `5-revision.json` → `6-promocion.json`.

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

1. Verificar los feeds de `config/fuentes.json` y sumar un adaptador de API de noticias (NewsAPI o Event Registry).
2. Crear los avatares en HeyGen y las voces en ElevenLabs, y completar `avatarId` y `vozId` en `personajes.json`.
3. Crear los avatares y probar `--heygen --escenas=1`.
4. Agregar la etapa `publicar`: YouTube Data API con Premiere programada, descripción con fuentes y marca de contenido sintético.
5. Programar la corrida diaria (cron o GitHub Actions).
