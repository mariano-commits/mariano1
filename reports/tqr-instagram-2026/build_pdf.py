from reportlab.lib.pagesizes import A4
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image,
                                PageBreak, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import matplotlib, os

fdir = os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
pdfmetrics.registerFont(TTFont("DV", os.path.join(fdir, "DejaVuSans.ttf")))
pdfmetrics.registerFont(TTFont("DVB", os.path.join(fdir, "DejaVuSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("DVI", os.path.join(fdir, "DejaVuSans-Oblique.ttf")))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("DV", normal="DV", bold="DVB", italic="DVI", boldItalic="DVB")

INK = colors.HexColor("#0b0b0b"); INK2 = colors.HexColor("#52514e"); BLUE = colors.HexColor("#2a78d6")
LINE = colors.HexColor("#e4e3df"); SOFT = colors.HexColor("#f3f6fb"); WARN = colors.HexColor("#fff4e5")
WARNB = colors.HexColor("#eda100"); OK = colors.HexColor("#eaf6ef"); OKB = colors.HexColor("#1baf7a")

H1 = ParagraphStyle("h1", fontName="DVB", fontSize=15, leading=19, textColor=INK, spaceBefore=10, spaceAfter=6)
H2 = ParagraphStyle("h2", fontName="DVB", fontSize=11, leading=14, textColor=INK, spaceBefore=8, spaceAfter=4)
P = ParagraphStyle("p", fontName="DV", fontSize=8.8, leading=12.6, textColor=INK, spaceAfter=4)
SM = ParagraphStyle("sm", parent=P, fontSize=7.6, leading=10.2, textColor=INK2)
TC = ParagraphStyle("tc", parent=P, fontSize=7.4, leading=9.6, spaceAfter=0)
TH = ParagraphStyle("th", parent=TC, fontName="DVB", textColor=colors.white)
BUL = ParagraphStyle("b", parent=P, leftIndent=10, bulletIndent=0)

def p(t, st=P): return Paragraph(t, st)
def bullets(items): return [Paragraph(i, BUL, bulletText="•") for i in items]
def img(f, w=180):
    from reportlab.lib.utils import ImageReader
    iw, ih = ImageReader(f).getSize(); return Image(f, width=w*mm, height=w*mm*ih/iw)

def table(rows, widths, head=True):
    data = [[Paragraph(str(c), TH if (head and i == 0) else TC) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=[w*mm for w in widths], repeatRows=1 if head else 0)
    st = [("GRID", (0, 0), (-1, -1), 0.4, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
          ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fafaf8")])]
    if head: st.append(("BACKGROUND", (0, 0), (-1, 0), INK))
    t.setStyle(TableStyle(st)); return t

def box(title, lines, bg=SOFT, border=BLUE):
    inner = [Paragraph(f"<b>{title}</b>", P)] + [Paragraph(l, P) for l in lines]
    t = Table([[inner]], colWidths=[180*mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg), ("LINEBEFORE", (0, 0), (0, -1), 3, border),
                           ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    return t

def kpis(items):
    cells = [[Paragraph(f"<font size=15><b>{v}</b></font><br/><font size=7 color='#52514e'>{l}</font>", P) for v, l in items]]
    t = Table(cells, colWidths=[180/len(items)*mm]*len(items))
    t.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.4, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
                           ("TOPPADDING", (0, 0), (-1, -1), 6), ("LEFTPADDING", (0, 0), (-1, -1), 7)]))
    return t

TAG_D = "<font color='#1baf7a'><b>[DATO]</b></font>"
TAG_I = "<font color='#2a78d6'><b>[INFERENCIA]</b></font>"
TAG_H = "<font color='#c98500'><b>[HIPÓTESIS]</b></font>"
TAG_R = "<font color='#4a3aa7'><b>[RECOMENDACIÓN]</b></font>"

S = []
S += [p("Nicho detectado: SaaS B2B de ticketing y gestión integral de eventos para productoras y boliches (Argentina) | "
        "Período analizado: 01/01/2026 – 28/09/2026 (publicaciones: 15/01/2026 – 27/05/2026)", SM), Spacer(1, 4)]
S += [p("TQR (@tqr_ticketera) — Diagnóstico de Instagram y plan de acción", ParagraphStyle("t", parent=H1, fontSize=19, leading=23)),
      p("Fuente: Windsor.ai · conector Instagram · cuenta 17841456098842282 · extracción 29/09/2026. "
        "Etiquetas: " + TAG_D + " observado en datos · " + TAG_I + " deducido de datos · " + TAG_H + " no demostrado · " + TAG_R, SM)]

# 1
S += [p("1. Resumen ejecutivo", H1)]
S += [kpis([("1.003", "seguidores (hoy)"), ("21", "posts en 2026"), ("124 días", "sin publicar en feed"),
            ("246", "alcance medio por post"), ("2", "comentarios en 21 posts")]), Spacer(1, 6)]
S += bullets([
    f"{TAG_D} La cuenta está <b>parada</b>: el último post del feed es del 27/05/2026. Entre el 10/05 y el 04/08 el alcance diario promedió <b>4 cuentas/día</b>.",
    f"{TAG_D} El 99% del alcance diario del año (146.114 de 148.105 alcances-día sumados) cae en <b>dos bloques con encendido y apagado abrupto</b> (10/03–09/05 y 05/08–16/08) que no coinciden con picos de posts. {TAG_I} Patrón típico de distribución paga (ads/boost); Windsor no tiene conectado Meta Ads, así que no se puede confirmar ni medir su retorno.",
    f"{TAG_D} Los <b>Reels</b> duplican el alcance de los carruseles (mediana 271 vs 109; 2,5x). El engagement por alcance es similar (2,2% vs 2,5%).",
    f"{TAG_D} Dos posts (\"TQR no es una ticketera más\" y \"15.000 personas. Una sola noche\") concentran el <b>68% de los guardados</b> y el 35% del engagement de 2026. Ambos: mensaje corto (≤276 caracteres), sin CTA de palabra clave.",
    f"{TAG_D} Los 4 posts con CTA \"comentá EVENTO / DATOS\" obtuvieron <b>0 comentarios</b>. El mecanismo de captación por comentario no funciona hoy.",
    f"{TAG_D} El alcance medio por post cayó <b>-48%</b> entre los primeros 8 posts (351) y los 13 siguientes (182).",
])
S += [Spacer(1, 4), box("Las 5 cosas para hacer a partir de mañana", [
    "1. <b>Volver a publicar</b>: 3 piezas/semana (2 Reels + 1 carrusel) con calendario fijo durante 8 semanas.",
    "2. <b>Reels de evento real con cifra en el primer segundo</b> (\"15.000 personas. Una sola noche.\"): el único Reel con skip rate &lt;50%.",
    "3. <b>Eliminar el CTA \"comentá PALABRA\"</b> y reemplazarlo por CTA a DM + link de bio con UTM, para poder medir leads.",
    "4. <b>Conectar Meta Ads a Windsor</b> y auditar los dos bloques de alcance antes de volver a invertir.",
    "5. <b>Test de horario</b> 11:00 vs 18:30 (ART) con el mismo formato: hoy el horario está confundido con la caída temporal.",
])]

# 2
S += [p("2. Datos analizados", H1)]
S += [table([
    ["Fuente / tabla", "Qué se usó", "Cobertura"],
    ["Instagram · media_info + media_insights", "Tipo, caption, fecha, alcance, views, likes, comentarios, guardados, shares, visitas a perfil, watch time y skip rate (Reels)", "21 posts 15/01–27/05/2026 con métricas completas. 24 posts 2022–2023 (métricas incompletas; excluidos del análisis comparativo)"],
    ["Instagram · insights diarios de cuenta", "reach, views, accounts_engaged, likes, comments, shares, saves, profile_links_taps", "01/01–28/09/2026"],
    ["Instagram · follower_count_1d", "Nuevos seguidores por día", "Solo últimos 30 días (límite de la API): 30/08–28/09/2026"],
    ["Instagram · audiencia lifetime", "Género × edad, ciudad", "997 seguidores clasificados; 45 ciudades con ≥3 seguidores"],
    ["Instagram · comentarios", "Texto de comentarios", "2 comentarios en 2026"],
    ["Instagram · stories", "—", "Vacío (la API solo guarda 24 h)"],
], [45, 75, 60])]
S += [p("Único conector activo en Windsor: Instagram. No hay Meta Ads, GA4, CRM ni datos de ventas/leads.", SM)]

# 3
S += [p("3. Principales hallazgos", H1), img("c1_daily.png")]
S += [table([
    ["#", "Hallazgo", "Tipo", "Evidencia"],
    ["H1", "Actividad orgánica interrumpida", "DATO", "0 posts de feed desde el 27/05. Alcance medio 10/05–04/08: 4/día; 17/08–28/09: 11/día."],
    ["H2", "El alcance del año depende de bloques externos a los posts", "DATO + INFERENCIA", "10/03–09/05: 1.885/día promedio (61 días). 05/08–16/08: 2.595/día (12 días) sin ningún post publicado. En abril la cuenta sumó 575 likes; los 5 posts orgánicos de abril sumaron 21."],
    ["H3", "Ese alcance extra casi no genera interacción", "DATO", "accounts_engaged / alcance diario sumado: 0,77% (mar–may) y 0,35% (ago)."],
    ["H4", "Reels > carruseles en alcance", "DATO", "Mediana 271 vs 109; promedio 336 vs 165."],
    ["H5", "Resultados concentrados en 2 piezas", "DATO", "17 de 25 guardados y 44 de 126 interacciones."],
    ["H6", "CTA de palabra clave en comentarios = 0 respuesta", "DATO", "4 posts, 0 comentarios. ER 1,35% vs 2,62% (CTA a DM) y 2,58% (sin CTA / suave)."],
    ["H7", "Pico anómalo 23/09", "DATO + HIPÓTESIS", "22.498 views, 2.685 comentarios, 327 likes, 124 shares en un día sin post propio en el feed. Nuevos seguidores ese día: 6."],
    ["H8", "Audiencia 35–54 años, concentrada en Rosario", "DATO", "54% de seguidores entre 35 y 54. Rosario = 277 (27,8%)."],
], [9, 50, 25, 96])]

# 4
S += [p("4. Qué está funcionando", H1)]
S += [table([
    ["Post", "Formato", "Alcance", "ER*", "Guardados", "Qué tiene"],
    ["15.000 personas. Una sola noche (23/02)", "Reel", "552", "4,3%", "8", "Cifra concreta como hook; 164 caracteres; skip rate 35,4% (el mejor); watch medio 8,5 s"],
    ["TQR no es una ticketera más (14/02)", "Carrusel", "395", "5,1%", "9", "Posicionamiento directo; 276 caracteres; único post con comentario-lead (\"INFO\") y 4 visitas a perfil"],
    ["Cuando el evento crece… (02/04)", "Reel", "239", "3,8%", "0", "192 caracteres; contraste problema/solución"],
    ["¿Qué pasa si tu QR no funciona? (30/04)", "Carrusel", "106", "3,8%", "1", "Responde una objeción de compra explícita"],
], [52, 17, 15, 12, 17, 67])]
S += [p("*ER = (likes + comentarios + guardados + shares) / alcance. Promedio de los 21 posts: 2,4%.", SM)]
S += bullets([
    f"{TAG_D} Contenido de <b>evento real</b> (3 posts: 15.000 personas, Esto no es solo una fiesta, Wine Fest): alcance medio 487 vs 206 del resto (2,4x).",
    f"{TAG_D} Captions ≤350 caracteres (13 posts): alcance medio 287 y ER 2,7%; captions &gt;350 (8 posts): alcance 179 y ER 1,9%. {TAG_H} Parte de la diferencia puede deberse a que los captions largos se concentraron en mar–may, cuando el alcance ya caía.",
])

# 5
S += [p("5. Qué NO está funcionando", H1)]
S += bullets([
    f"{TAG_D} <b>Captación por comentario</b>: \"Escribinos EVENTO\", \"Comentá DATOS\", \"escribinos en comentarios\", \"Comentá EVENTO\" → 0 comentarios en los 4 casos.",
    f"{TAG_D} <b>Carruseles de tesis abstracta</b> publicados desde mayo (RRPP, profesionalización, service charge): alcance 76–113, ER 1,3–2,6%, 0 guardados.",
    f"{TAG_D} <b>Reels con skip rate &gt;78%</b> (\"Esto no es solo una fiesta\" 80,6%, \"Podés vender todo el evento\" 78,5%): watch medio 3,6–3,8 s. \"Esto no es solo una fiesta\" tuvo el mayor alcance (639) pero ER 1,3%: alcance sin retención.",
    f"{TAG_D} <b>Alcance extra (mar–may y ago) sin conversión visible</b>: 0,35–0,77% de interacción sobre alcance diario y profile_links_taps = 0 todo el año. {TAG_H} Si es pauta, se optimizó hacia alcance/reproducciones y no hacia leads.",
    f"{TAG_D} <b>Reputación</b>: el único comentario del post top (14/02) además del lead es \"Horrible atención al cliente\" (05/04). NO HAY DATOS sobre si se respondió.",
])

# 6
S += [p("6. Patrones detectados", H1), img("c2_posts.png")]
S += [table([
    ["Patrón", "Frecuencia", "Evidencia", "Hipótesis explicativa", "Experimento que lo valida"],
    ["Hook con cifra real retiene", "1 de 10 Reels", "Skip 35,4% vs mediana ~64%", "Un número concreto es más específico que un concepto (\"control\", \"orden\")", "E2: hook numérico vs conceptual"],
    ["Caída sostenida de alcance por post", "13 posts desde 05/03", "-48% vs 8 primeros posts", "Saturación del mensaje (la fórmula \"no es (solo) una ticketera / no solo vendés entradas\" aparece en 5 captions) o cambio de horario", "E1 + rotar temas"],
    ["Guardados solo en 2 piezas", "17/25 guardados", "Resto: 0–3 por post", "El usuario guarda pruebas (escala, diferenciación), no tesis", "E4: carrusel con números de caso"],
    ["Pico de comentarios sin seguidores", "1 día (23/09)", "2.685 comentarios / 6 nuevos seguidores", "Sorteo o colaboración publicada desde otra cuenta", "Identificar la pieza (no está en el feed propio)"],
], [34, 22, 36, 48, 40])]

# 7
S += [p("7. Análisis de contenido", H1), img("c3_formats.png", 170)]
S += [table([
    ["Dimensión", "Observado", "Lectura"],
    ["Formato", "10 Reels / 11 carruseles. 0 imágenes simples en 2026.", "Reels: más alcance. Carrusel: iguala en ER solo cuando es posicionamiento u objeción."],
    ["Temas", "Operación/control (6), datos/finanzas (3), evento real (3), producto (3), otros (6)", "\"Operación / control\" es el tema más repetido y ninguno de sus 6 posts supera 344 de alcance."],
    ["CTA", "DM/escribinos 11 · palabra clave en comentario 4 · sin CTA o suave 6", "Sin CTA: mayor alcance (345). Palabra clave: peor ER (1,35%)."],
    ["Largo de caption", "109–582 caracteres", "≤350: mejor desempeño (con el matiz temporal de la sección 4)."],
    ["Hashtags", "0 hashtags en los 21 posts de 2026 (los de 2023 sí usaban)", "NO HAY DATOS SUFICIENTES para medir su efecto: no hay variación en 2026."],
    ["Duración de Reel", "No disponible en Windsor", "Solo watch time medio: 3,6–8,5 s."],
    ["Colaboraciones", "media_collaborators vacío en todos", "Sin collabs propias medibles."],
], [28, 72, 80])]
S += [Spacer(1, 4), img("c4_skip.png")]

# 8
S += [p("8. Análisis de audiencia", H1), img("c5_age.png")]
S += [table([
    ["Variable", "Dato", "Implicancia"],
    ["Género", "Hombres 553 (55%) · Mujeres 360 (36%) · Sin dato 84 (8%)", "—"],
    ["Edad", "35–54: 54% · 25–34: 21% · 18–24: 5,5%", f"{TAG_I} Perfil compatible con dueños/productores, no con público de fiesta. Coherente con un producto B2B."],
    ["Ciudad", "Rosario 277 (27,8%). Rosario + 10 localidades del Gran Rosario/cordón: 367 (36,8%). CABA 63 (6,3%). Córdoba 28. Área Mendoza (7 localidades): 43", "La base es Rosario. CABA, el mercado más grande del país, tiene solo el 6%."],
    ["Crecimiento", "25 nuevos seguidores brutos en 30 días (30/08–28/09); 6 el día del pico 23/09. Unfollows: no extraídos", "NO HAY DATOS de seguidores antes de agosto (límite API de 30 días)."],
    ["Intereses / retención de audiencia", "No disponible", "NO HAY DATOS."],
], [26, 80, 74])]

# 9
S += [p("9. Análisis temporal", H1)]
S += [table([
    ["Mes 2026", "Posts", "Alcance medio/post", "ER medio", "Guardados"],
    ["Enero", "1", "461", "2,4%", "1"], ["Febrero", "6", "284", "3,2%", "18"], ["Marzo", "5", "340", "1,3%", "5"],
    ["Abril", "5", "159", "2,9%", "1"], ["Mayo", "4", "126", "1,7%", "0"], ["Jun–Sep", "0", "—", "—", "—"],
], [35, 20, 45, 35, 45])]
S += bullets([
    f"{TAG_D} Horario (hora Argentina): 13 posts antes de las 14:00 (11 entre 09:00 y 13:00) → alcance medio 311, ER 2,6%. 8 posts entre 18:00 y 19:30 → alcance 141, ER 1,9%.",
    f"{TAG_I} El cambio a 18:00 ocurre casi todo en abril–mayo, cuando el alcance ya caía: <b>no se puede atribuir la diferencia al horario</b>. NO HAY DATOS SUFICIENTES PARA AFIRMARLO.",
    f"{TAG_D} Día de semana: miércoles (6 posts) tiene el alcance medio más bajo (131). Los demás días tienen 1–2 posts (jueves 7): muestra insuficiente para rankear días.",
    f"{TAG_D} Febrero, el mes con más volumen (6 posts), tuvo el mejor ER (3,2%) y el 72% de los guardados del año.",
])

# 10
S += [p("10. Oportunidades", H1)]
S += bullets([
    "<b>Volumen</b>: la cuenta pasó 4 meses sin publicar; cualquier reactivación compite contra una base de ~4–11 alcances/día.",
    "<b>Casos reales con números</b>: TQR tiene el insumo (eventos de 15.000 personas, Wine Fest, histórico Blizard Rosario 2023) y es lo que mejor retiene.",
    "<b>Medición de leads</b>: hoy profile_links_taps = 0 y no hay datos de DMs. Sin eso, no se puede saber qué contenido genera clientes.",
    "<b>Pauta</b>: ~146.000 alcances-día sumados en 73 días sin evidencia de conversión. Reorientar el objetivo o recortar.",
    "<b>CABA</b>: 6% de la audiencia. Hipótesis de expansión; requiere contenido con eventos/productores de Buenos Aires.",
    "<b>El pico del 23/09</b> (2.685 comentarios): identificar qué pieza fue y si dejó leads; si fue sorteo, el costo por seguidor fue muy alto (≈450 comentarios por nuevo seguidor).",
])

# 11
S += [p("11. Matriz de decisión", H1)]
S += [table([
    ["Oportunidad", "Evidencia", "Impacto potencial", "Confianza", "Esfuerzo", "Acción recomendada"],
    ["Reactivar publicación", "124 días sin posts; alcance base 4/día", "Alto: sin publicaciones no hay distribución orgánica", "Alta", "Medio", "3 piezas/semana × 8 semanas"],
    ["Reels de evento real con cifra en el hook", "Skip 35% vs ~64%; alcance 2,4x", "Alto", "Media (n=3 posts de evento real; 1 con cifra)", "Medio (requiere filmar en eventos)", "1 Reel/semana de un evento real, con número en el primer segundo"],
    ["Reemplazar CTA palabra clave", "0 comentarios en 4 posts", "Medio", "Alta en el resultado; n=4", "Bajo", "CTA a DM + link bio con UTM"],
    ["Auditar pauta", "0,35–0,77% interacción; links taps 0", "Alto (presupuesto)", "Media: la pauta es inferencia", "Bajo", "Conectar Meta Ads a Windsor; objetivo mensajes/leads"],
    ["Carrusel de objeciones y diferenciación", "ER 5,1% y 3,8% en los 2 casos", "Medio", "Baja-media (n=2)", "Bajo", "1 carrusel/semana: objeción + prueba"],
    ["Test de horario", "311 vs 141 de alcance, pero confundido", "Medio", "Baja", "Bajo", "E1"],
    ["Responder reputación", "1 comentario negativo en post top", "Bajo-medio", "Alta (dato), n=1", "Bajo", "Responder públicamente y derivar a DM"],
], [30, 34, 30, 28, 22, 36])]

# 12
S += [p("12. Experimentos recomendados", H1)]
S += [p("Todos los umbrales de éxito son <b>hipótesis experimentales</b> construidas sobre los valores observados en 2026; no son benchmarks de la industria.", SM)]
exps = [
    ["E1 · Horario", "Publicar 11:00 ART rinde más alcance que 18:30 ART", "Hora de publicación", "Formato (Reel), tipo de hook, largo de caption, día (martes y jueves)", "4 semanas", "8 Reels (4 + 4, alternados)", "Alcance a 7 días", "ER, skip rate", "Diferencia ≥30% sostenida en 3 de 4 pares", "Fijar el horario ganador; si no hay diferencia, horario libre"],
    ["E2 · Hook", "Un número concreto en el primer segundo baja el skip rate", "Primer texto/plano: cifra (\"3.200 ingresos en 40 minutos\") vs concepto (\"El control lo es todo\")", "Duración, música, horario, CTA", "3 semanas", "6 Reels (3 + 3)", "Skip rate", "Watch time medio, alcance, guardados", "Skip rate medio &lt;50% en variante numérica (hoy mediana ~64%; mejor caso 35%)", "Adoptar el hook ganador como plantilla"],
    ["E3 · CTA", "CTA a DM con palabra clave genera más contactos que el CTA en comentarios", "CTA: \"Mandanos DEMO por DM\" vs link bio con UTM vs sin CTA", "Formato y tema", "4 semanas", "9 piezas (3 × 3)", "DMs/clics por pieza (registro manual + UTM)", "ER, visitas al perfil", "Cualquier variante con ≥1 lead calificado por pieza en promedio", "Estandarizar el CTA con más leads"],
    ["E4 · Carrusel de prueba", "Un carrusel con números de un caso real se guarda más que un carrusel de tesis", "Carrusel caso con datos (antes/después) vs carrusel concepto", "Horario, largo de caption (≤350)", "4 semanas", "4 carruseles (2 + 2)", "Guardados / alcance", "Shares, visitas perfil", "Guardados/alcance ≥2% (el post top tuvo 2,3%)", "Reemplazar carruseles de tesis por casos"],
]
for e in exps:
    S += [KeepTogether([table([["Campo", e[0]]] + [[k, v] for k, v in zip(
        ["Hipótesis", "Qué cambiar", "Qué mantener", "Duración", "Publicaciones", "Métrica principal", "Secundarias", "Éxito (hipótesis)", "Decisión posterior"], e[1:])],
        [38, 142]), Spacer(1, 5)])]

# 13
S += [p("13. Plan de acción (8 semanas)", H1)]
S += [table([
    ["Semana", "Qué", "Entregable"],
    ["0 (esta semana)", "Conectar Meta Ads y (si existe) GA4/CRM a Windsor. UTM en cada link del Linktree. Planilla de registro de DMs por post. Responder comentario negativo.", "Tracking operativo"],
    ["1–4", "3 piezas/semana: Martes Reel de evento real (E1/E2) · Jueves Reel producto u objeción (E1/E2) · Sábado carrusel (E4). CTA según E3.", "12 piezas + resultados E1, E2, E4"],
    ["5", "Revisión: alcance, skip, guardados, DMs por pieza. Decidir horario, hook y CTA.", "Informe de corte"],
    ["5–8", "Escalar lo ganador; 70% formatos probados / 30% nuevos tests. Si se pauta: solo sobre los 2 posts con mejor ER orgánico y objetivo mensajes.", "12 piezas + decisión de pauta"],
], [28, 112, 40])]

# 14
S += [p("14. Top 10 acciones", H1)]
top = [
    ("Retomar publicación: 3 piezas/semana", "La cuenta no tiene distribución orgánica sin posts.", "0 posts desde 27/05; 4 alcances/día promedio 10/05–04/08. Febrero (6 posts) fue el mes con mejor ER (3,2%).", "Calendario fijo Mar/Jue/Sáb; producir 2 semanas por adelantado.", "Comenzar esta semana"),
    ("Reel semanal de evento real con cifra en el hook", "Es el formato con mejor retención y más guardados.", "\"15.000 personas\": skip 35,4%, 8 guardados, ER 4,3%. Evento real: alcance medio 487 vs 206.", "Primer texto en pantalla = número real del evento (asistentes, ingresos/minuto, tiempo de validación). ≤170 caracteres de caption.", "Semana 1"),
    ("Eliminar el CTA \"comentá PALABRA\"", "No genera respuesta.", "4 posts, 0 comentarios; ER 1,35%.", "Reemplazar por \"Mandanos DEMO por DM\" o link bio con UTM (E3).", "Inmediata"),
    ("Conectar Meta Ads a Windsor y auditar", "El 99% del alcance del año viene de bloques no explicados por los posts.", "Mar–may 1.885/día; ago 2.595/día sin posts; interacción 0,35–0,77%.", "Conectar el conector facebook (Meta Ads) y cruzar gasto, objetivo y resultados.", "Esta semana"),
    ("Hacer medible la conversión", "Hoy no se puede saber qué post trae clientes.", "profile_links_taps = 0 todo el año; sin datos de DMs ni ventas.", "UTM por post en Linktree; registro manual de DMs por pieza; GA4 si hay web.", "Esta semana"),
    ("Pausar carruseles de tesis abstracta", "Rinden lo mínimo de la cuenta.", "Carruseles de mayo: alcance 76–113, 0 guardados.", "Sustituir por carrusel caso-con-números u objeción (E4).", "Semana 1"),
    ("Carrusel de objeciones y diferenciación, 1 por semana", "Los 2 carruseles con mejor ER responden \"¿por qué TQR?\" o \"¿y si falla?\".", "ER 5,1% y 3,8% vs 2,5% promedio de carruseles.", "Banco de objeciones: QR que falla, migración, cobro, comisiones, soporte.", "Semana 2"),
    ("Test de horario 11:00 vs 18:30", "El dato actual no separa horario de tendencia.", "311 vs 141 de alcance medio, pero confundido con la caída de abr–may.", "E1: 8 Reels en 4 semanas.", "Semanas 1–4"),
    ("Identificar la pieza del 23/09", "Fue el mayor volumen de interacción del año.", "2.685 comentarios, 22.498 views, 6 nuevos seguidores.", "Revisar en la app qué contenido fue (sorteo/collab/story) y si generó DMs.", "Esta semana"),
    ("Responder el comentario negativo del post top", "Está visible en la pieza con más interacción.", "\"Horrible atención al cliente\", 05/04, post del 14/02.", "Respuesta pública breve + derivación a DM.", "Inmediata"),
]
for i, (a, pq, ev, como, pr) in enumerate(top, 1):
    S += [KeepTogether([p(f"<b>{i}. {a}</b>", H2), p(f"<b>Por qué:</b> {pq}"), p(f"<b>Evidencia:</b> {ev}"),
                        p(f"<b>Cómo:</b> {como}"), p(f"<b>Prioridad:</b> {pr}")])]

# 7b content strategy
S += [KeepTogether([p("Estrategia de contenido derivada", H2), table([
    ["Elemento", "Recomendación", "Base"],
    ["Distribución", "2 Reels + 1 carrusel por semana (≈65/35)", "Reels 2,5x alcance mediano"],
    ["Temas prioritarios", "Evento real con cifras · objeciones · diferenciación vs ticketera tradicional", "Top 4 posts por ER"],
    ["Temas a reducir", "\"Operación/control\" genérico (6 posts, ninguno &gt;344 de alcance)", "Sección 7"],
    ["Largo de caption", "≤350 caracteres; idealmente ≤200 en Reels", "Sección 4"],
    ["Horario", "Probar 11:00 vs 18:30 ART (E1)", "Sección 9"],
], [30, 90, 60])])]
S += [p("Hooks de ejemplo (derivados del patrón \"cifra real\" y \"objeción\"; los números deben ser reales de TQR):", P)]
S += bullets([
    "\"15.000 personas. Una sola noche. 0 filas en la puerta.\"",
    "\"¿Qué pasa si se cae internet en la puerta de tu boliche?\"",
    "\"Así validamos [N] entradas en [N] minutos en [evento real].\"",
    "\"El error que hace que tus RRPP vendan y vos no sepas cuánto.\"",
    "\"Antes de cambiar de ticketera, mirá esto.\"",
])

# 15-16
S += [p("15. Qué dejar de hacer", H1)]
S += bullets([
    f"CTA \"comentá PALABRA\": 4 de 4 posts sin comentarios {TAG_D}.",
    f"Carruseles de tesis sin prueba (mayo: 3 carruseles, alcance 76–113, 0 guardados) {TAG_D}.",
    f"Repetir la fórmula \"TQR no es (solo) una ticketera / no solo vendés entradas\" (5 de 21 captions) {TAG_H}: posible saturación del mensaje en paralelo a la caída de alcance; no demostrada.",
    f"Invertir en alcance sin medir conversión {TAG_I}.",
    "Períodos sin publicar: el patrón ene–sep muestra que sin posts ni pauta la cuenta cae a ~4 alcances/día " + TAG_D + ".",
])
S += [p("16. Qué hacer más", H1)]
S += bullets([
    f"Reels de eventos reales con números concretos {TAG_D}.",
    f"Captions cortos (≤350 caracteres) {TAG_D} (con matiz temporal).",
    f"Carruseles que responden una objeción o marcan diferencia competitiva {TAG_D} (n=2).",
    f"Volumen sostenido: febrero (6 posts) = mejor mes {TAG_D}; la causalidad volumen→ER no está demostrada {TAG_H}.",
])

# 17
S += [p("17. Limitaciones", H1)]
S += [table([
    ["Aspecto", "Detalle"],
    ["Muestra", "21 posts con métricas completas. Cualquier comparación por subgrupo (día, horario, CTA) tiene n=1–13: son señales, no conclusiones estadísticas."],
    ["Pauta", "No hay conector Meta Ads. La atribución de los bloques de alcance a publicidad es inferencia."],
    ["Conversión", "Sin datos de DMs, leads, demos, ventas ni clics en link. profile_links_taps = 0 en todos los días (puede ser dato real o métrica no poblada)."],
    ["Seguidores", "Historial solo de 30 días. No se puede medir crecimiento ene–ago."],
    ["accounts_engaged", "En 0 hasta el 13/03 aunque hubo likes: la métrica no parece poblada antes de esa fecha."],
    ["Pico 23/09", "Reach diario 12 con 22.498 views: inconsistente. No hay post propio ese día en el feed; la pieza no es identificable desde Windsor."],
    ["Stories", "La API conserva 24 h; no hay histórico."],
    ["Alcance diario sumado", "Sumar alcances diarios cuenta personas repetidas; se usa solo para comparar períodos, no como alcance único."],
    ["Alta confianza", "Cuenta inactiva; Reels > carruseles en alcance; CTA de comentario sin respuesta; concentración de guardados; perfil de audiencia."],
    ["Baja confianza", "Efecto del horario, del día, del largo de caption y de la saturación del mensaje."],
    ["No determinable", "ROI de la pauta, qué contenido genera clientes, duración óptima de Reel, efecto de hashtags."],
], [35, 145])]

# 18
S += [p("18. Conclusión", H1)]
S += [p("El problema principal de @tqr_ticketera no es qué publica sino que <b>dejó de publicar</b> y que el alcance del año dependió de bloques "
        "(probablemente pagos) que no dejaron interacción ni conversión medible. Dentro de lo publicado, el patrón es claro aunque con muestra chica: "
        "<b>Reels cortos de eventos reales con una cifra concreta</b> y <b>carruseles que responden objeciones</b> superan al resto; los CTA de palabra clave "
        "en comentarios no funcionan. La prioridad es reactivar con 3 piezas semanales, instrumentar la medición de leads y correr E1–E4 durante 4 semanas "
        "antes de volver a invertir en pauta.")]

def footer(c, d):
    c.saveState(); c.setFont("DV", 7); c.setFillColor(INK2)
    c.drawString(15*mm, 10*mm, "TQR · Diagnóstico Instagram 2026 · Fuente: Windsor.ai")
    c.drawRightString(195*mm, 10*mm, f"{d.page}"); c.restoreState()

doc = SimpleDocTemplate("TQR_Instagram_Diagnostico_2026.pdf", pagesize=A4, leftMargin=15*mm, rightMargin=15*mm,
                        topMargin=14*mm, bottomMargin=16*mm, title="TQR · Diagnóstico Instagram 2026", author="Análisis Windsor.ai")
doc.build(S, onFirstPage=footer, onLaterPages=footer)
print("ok")
