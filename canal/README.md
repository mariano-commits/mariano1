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
npm run canal:test                    # tests del filtro de cumplimiento
npm run canal:typecheck
```

Variables opcionales:
- `CANAL_MODELO`: modelo de Claude (por defecto `claude-opus-5-5`).

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
3. Agregar la etapa `video`: guion → API de HeyGen por escena → montaje con Remotion (zócalos y gráficas; ya está en este repo) → MP4.
4. Agregar la etapa `publicar`: YouTube Data API con Premiere programada, descripción con fuentes y marca de contenido sintético.
5. Programar la corrida diaria (cron o GitHub Actions).
