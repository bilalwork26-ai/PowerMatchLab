# Informe final — Campaña de adquisición real tools_launch_2026

Fecha: 2026-09-12. Rama de trabajo: `claude/tools-launch-assets` (más el PR técnico ya
fusionado desde `claude/tools-launch-campaign`). Este informe cubre exactamente lo
ejecutado en esta sesión — no repite ni reinterpreta los informes de sesiones anteriores
(recuperación de PR #38, motor de recomendación en PR #39), que ya se cerraron y verificaron
por separado.

## 1. Línea base real (honesta, no inventada)

- **Visitas reales:** esencialmente cero, confirmado por el propio dueño del sitio al
  inicio de esta tarea. No hay acceso a Search Console ni a Cloudflare Web Analytics desde
  esta sesión (verificado con `ListConnectors`, que devolvió una lista vacía) — estos datos
  se marcan como **no accesibles**, nunca como cero, salvo el hecho ya confirmado
  verbalmente de que las visitas reales son prácticamente nulas.
- **España y Argelia:** tráfico propio / familiar del dueño — explícitamente excluido de
  cualquier lectura de adquisición real, tal como se documentó ya en
  `marketing/01-campaign-baseline.md` de una ronda anterior. No se ha alterado ni borrado
  ese historial; solo se reitera aquí la misma separación.
- **Clics de afiliado y compras:** no accesibles (no hay acceso a Amazon Associates Reports
  desde esta sesión). Cero ventas confirmadas hasta la fecha, según lo indicado por el
  dueño — una compra solo cuenta si aparece confirmada en Amazon Associates, nunca inferida.
- **Cuenta propia de PowerMatchLab en el propio buscador:** un agente de investigación de
  esta sesión buscó "powermatchlab.com" vía WebSearch y no encontró ningún resultado
  relevante indexado — no se puede distinguir si es por ser un sitio nuevo, por retraso de
  indexación, o por otra causa. Se reporta como el punto de partida honesto, no como una
  conclusión.
- **Amazon PA API / Creators API:** sigue sin estar disponible (cuenta pendiente de
  aprobación completa; requiere 10 ventas calificadas en 30 días), sin cambios desde la
  sesión anterior.

## 2. Investigación de demanda real

26 consultas reales de WebSearch (mínimo pedido: 15-20) sobre las 3 páginas prioritarias
más consultas generales de RV/home-backup. Nunca se inventó volumen de búsqueda, CPC ni una
puntuación numérica de dificultad — este entorno no proporciona esos datos, así que se
reportó densidad competitiva cualitativa en su lugar. Tabla completa de 26 filas (consulta →
intención → activo de PowerMatchLab más afín → densidad competitiva cualitativa → tipo de
contenido → oportunidad → evidencia) en
**`marketing/10-tools-launch-demand-competitor-research.md`**.

Hallazgos honestos que vale la pena repetir aquí: `WebFetch` está bloqueado para todo
dominio externo en este entorno, así que ninguna página competidora fue realmente abierta
— todo lo dicho sobre "qué promete" un competidor viene solo de su título/URL, nunca de su
contenido real. La herramienta de búsqueda tampoco devolvió contenido real de Reddit en
ninguna de las 4 consultas que lo pedían explícitamente (marcado como "no accesible", no
como "no existe interés en Reddit").

## 3. Competidores analizados y gaps encontrados

Análisis completo por tema en el mismo archivo (`marketing/10-...`). Resumen:
- **Refrigerador:** saturado de blogs de marca (EcoFlow, Jackery, Anker, Oupes, UDPOWER) y
  sitios de contenido independientes; ya existe un sub-clúster de calculadoras dedicadas
  (powerstationhq.com, generatorchecker.com, powerstationtips.com).
- **CPAP:** el tema con competidores de mayor autoridad — Sleep Foundation, ResMed (el
  propio fabricante), cpap.com, Aeroflow Sleep. Ninguno, por título, ofrece una calculadora
  interactiva — es la diferencia real y verificable que ya tiene la página de PowerMatchLab.
- **Starlink:** el tema más "competido por fuentes primarias" — un foro real con datos
  medidos (Escape RV Owners Forum), un boletín técnico independiente creíble (RV
  Electricity Substack) y al menos un vídeo de YouTube que afirma pruebas rigurosas
  multi-semana. La postura ya adoptada en la página (recomendar la propia medición del
  usuario, no afirmar autonomía garantizada) es la correcta frente a esto.

**No se creó ninguna página duplicada.** El único gap real y demostrable encontrado —
ausencia de imagen Open Graph específica por herramienta — se corrigió con código (sección
9), no con contenido nuevo.

## 4. Cambios hechos a las 3 páginas prioritarias

Revisión sistemática contra la checklist del brief (título orientado a consulta, meta
description, H1 directo, explicación breve, fórmula, ejemplo, FAQ real, enlaces a guías
relacionadas, CTA de comparación, recomendaciones proporcionadas, CTA de afiliado solo
cuando existe `amazon_affiliate_url`, OG específico, comportamiento móvil, datos
estructurados válidos):

- **Ya cumplido antes de esta sesión** (verificado leyendo `src/content/tools.ts` y
  `src/app/tools/[slug]/page.tsx` directamente, no asumido): título orientado a consulta,
  meta description, H1 (vía `shortAnswer`), fórmula visible, FAQ real (incluyendo la
  pregunta explícita "¿Es esto consejo médico?" en CPAP), enlaces a guías relacionadas, CTA
  de comparación, `articleJsonLd` + `breadcrumbJsonLd` sin reseñas ni ratings inventados
  (hay un test dedicado, `tests/no-faqpage-schema.test.ts`, que impide usar FAQPage
  schema), CTA de Amazon controlado exclusivamente por `amazon_affiliate_url` (verificado
  por `tests/amazon-cta-affiliate-only.test.ts`, que sigue en verde).
- **Corregido en esta sesión:** las 3 páginas (y el hub `/tools`) no tenían imagen Open
  Graph propia — cualquier pin, publicación o enlace externo mostraba la tarjeta genérica
  del sitio en lugar de nombrar la herramienta real. Se creó
  `src/app/tools/opengraph-image.tsx` y `src/app/tools/[slug]/opengraph-image.tsx`
  (siguiendo el patrón ya existente en `src/app/guides/[slug]/opengraph-image.tsx`). Durante
  la verificación visual se encontró y corrigió además un bug real: `next/og` no tiene
  glifo para "≈" (aparece como un cuadro vacío) — se añadió `sanitizeForOgFont()` en
  `src/lib/og-template.tsx` para sustituir "≈" por "~" solo en las imágenes OG generadas
  (el texto HTML de la página no se tocó). Verificado visualmente reconstruyendo el sitio
  desde cero y volviendo a capturar las 4 imágenes.

## 5. Activos de campaña creados (30 días, en inglés, EE. UU.)

Todo lo siguiente está **listo, no publicado**:

- **30 pines de Pinterest** (10 refrigerador / 10 CPAP / 10 Starlink) — archivos PNG reales
  de 1000×1500 ya generados (no descripciones de diseño) en `marketing/pins/`, renderizados
  con Playwright/Chromium usando la misma paleta navy/cyan del sitio. Cada uno con título,
  descripción, texto en la imagen, texto alternativo, tablero recomendado, enlace con UTM y
  divulgación de afiliado. Detalle completo en
  `marketing/09-tools-launch-pinterest-pins.md`.
- **12 guiones de vídeo corto** (4/4/4) — gancho, guion de 20-45s, texto en pantalla, lista
  de escenas, tono de voz en off, título, descripción, hashtags moderados, CTA, enlace UTM y
  divulgación. En `marketing/11-tools-launch-video-scripts.md`.
- **12 publicaciones de Facebook/LinkedIn** — 6 por plataforma, cada una con texto propio
  (ninguna copiada/pegada entre sí ni de los pines). En
  `marketing/12-tools-launch-social-posts.md`.
- **7 borradores de respuesta para comunidades/foros reales** encontrados durante la
  investigación (Rokslide, Forest River Forums, SolarPanelTalk, Camp-Inn Forum,
  CPAPtalk.com, Escape RV Owners Forum, TractorByNet) — cada uno responde primero la
  pregunta real, divulga la relación con PowerMatchLab, nunca inventa experiencia personal
  ni posesión de producto, y señala explícitamente que la política de cada foro no fue
  verificada (WebFetch bloqueado) y debe revisarse antes de publicar. En
  `marketing/13-tools-launch-community-answers.md`.
- **19 oportunidades de enlaces editoriales** cualificadas (no una base masiva) — blogs de
  RV, sitios de camping, recursos de preparación ante apagones, un boletín de Starlink, un
  sitio dedicado a CPAP, dos páginas .edu, dos revisores independientes reales. Cada una
  con URL real verificada por WebSearch, razón de encaje, política de contacto (marcada
  como "no verificada" en casi todos los casos), y mensaje personalizado. Dos posibles
  direcciones de correo que solo aparecieron en el resumen sintetizado de la búsqueda —no en
  el fragmento citable— se marcan explícitamente como **no verificadas, no usar sin
  confirmar** en lugar de presentarse como hechos. En
  `marketing/14-tools-launch-editorial-outreach.md`.

## 6. Publicaciones realmente hechas

**Ninguna.** `ListConnectors` devolvió una lista vacía — no hay conector de Pinterest,
Facebook, LinkedIn, Instagram, TikTok, YouTube, Search Console, Cloudflare o Amazon
Associates disponible en esta sesión. No se afirma ninguna publicación, ninguna URL
publicada, ningún contacto real. Todo lo anterior está preparado, esperando que el dueño
del sitio conecte las cuentas correspondientes o publique manualmente.

## 7. Publicaciones preparadas pero bloqueadas

Los 30 pines, 12 vídeos, 12 posts, 7 borradores de comunidad y 19 mensajes editoriales —
listados completos en la sección 5 — están en estado "preparado, no publicado" por falta de
acceso a cada canal, nunca por falta de contenido terminado.

## 8. Contactos investigados y mensajes preparados

19 contactos editoriales investigados vía WebSearch (ver sección 5 y archivo 14). Ningún
correo fue inventado; donde una dirección apareció solo en un resumen sintetizado y no en
un fragmento citable, se marcó explícitamente como no verificada. Ningún mensaje fue
enviado — no existe cuenta de correo autorizada en esta sesión para hacerlo, y aunque
existiera, el envío requiere revisión humana previa de cada mensaje.

## 9. Resultado de IndexNow

Se intentó ejecutar `node scripts/submit-indexnow.mjs` (script ya existente de una ronda
anterior). Resultado exacto:

```
IndexNow submission — site: https://www.powermatchlab.com
Could not fetch https://www.powermatchlab.com/sitemap.xml: sitemap.xml returned HTTP 403
```

Se verificó además directamente con `curl` contra `api.indexnow.org` y contra
`www.powermatchlab.com`: ambos devuelven `CONNECT tunnel failed, response 403` — el propio
estado del proxy de este entorno (`/__agentproxy/status`) confirma que es un
**"connect_rejected" por política de la organización**, el mismo tipo de bloqueo que afecta
incluso a `www.google.com` desde esta sesión. No es un problema específico de IndexNow ni
del sitio: es una política de salida general de este entorno. No se afirma ninguna
indexación ni notificación real a Bing/IndexNow — el intento y su bloqueo quedan
documentados tal cual ocurrieron, sin inventar un resultado.

Verificado por código (sin necesidad de red): el sitemap ya incluye `/tools` y las 3
calculadoras prioritarias, `robots.txt` es correcto y apunta al sitemap, la clave de
IndexNow (`public/dcb5beb84967ddf9fbccc19821a7e2da.txt`) sigue publicada, y el canonical de
cada página de herramienta se genera correctamente vía `pageMetadata()`.

## 10. Calendario de 30 días

Calendario completo, día por día, canal por canal, con "estado" y "conexión requerida"
explícitos por cada fila, en `marketing/15-tools-launch-utm-and-calendar.md`. Incluye
revisiones recomendadas a 7 y 30 días (ver sección 17).

## 11. Convención UTM

`utm_campaign=tools_launch_2026` fijo; `utm_source` por canal (`pinterest`, `facebook`,
`linkedin`, `video`); `utm_medium` (`social` o `short_video`); `utm_content` con el patrón
`<tipo>_<tema>_<n>`. Ningún dato personal ni texto libre sensible en ningún valor. Detalle
completo en el mismo archivo 15.

## 12. Archivos creados o modificados

**Código de la aplicación (PR #40, ya fusionado):**
- `src/app/tools/opengraph-image.tsx` (nuevo)
- `src/app/tools/[slug]/opengraph-image.tsx` (nuevo)
- `src/lib/og-template.tsx` (modificado — `sanitizeForOgFont()`)
- `tests/og-image-coverage.test.ts` (nuevo, 4 tests)

**Contenido de marketing (esta rama, `claude/tools-launch-assets`):**
- `marketing/09-tools-launch-pinterest-pins.md`
- `marketing/10-tools-launch-demand-competitor-research.md`
- `marketing/11-tools-launch-video-scripts.md`
- `marketing/12-tools-launch-social-posts.md`
- `marketing/13-tools-launch-community-answers.md`
- `marketing/14-tools-launch-editorial-outreach.md`
- `marketing/15-tools-launch-utm-and-calendar.md`
- `marketing/16-tools-launch-final-report.md` (este archivo)
- `marketing/pins/*.png` (30 archivos)
- `marketing/scripts/pins-data.mjs`, `marketing/scripts/generate-pins.mjs`

**Nada de esto tocó** `products.json`, enlaces SiteStripe, `amazon_product_url`,
`amazon_affiliate_url`, notas de catálogo, imágenes de producto, reglas de consentimiento
ni Cloudflare Web Analytics. `products.json` se verificó con el mismo hash sha256 antes y
después de toda la sesión: `57d831f7cc4d1d36bcf93c6579ada830541c937e09bf4230408a071ffd8aa270`.

## 13. Validación técnica

Ejecutado varias veces a lo largo de la sesión, siempre en verde en el último intento:
- `npx tsc --noEmit` → sin errores
- `npx next lint` → sin advertencias ni errores
- `npx vitest run` → **576/576 tests**, 34 archivos de test
- `npx next build` → correcto; el build lista `/tools/opengraph-image` y
  `/tools/[slug]/opengraph-image/[__metadata_id__]` como nuevas rutas
- Verificación visual: servidor de producción local reconstruido desde cero,
  las 4 imágenes OG (hub + 3 calculadoras prioritarias) recapturadas y confirmadas
  correctas (1200×630, sin el glifo faltante de "≈")

## 14. PR y SHA (cambio de código)

- **PR #40** — "Add per-tool Open Graph images for /tools calculators"
- Base verificada como el `origin/main` más reciente confirmado (`e140c972...`)
- `mergeable_state: clean` verificado antes de fusionar
- Fusionado por squash — **SHA: `5df454a3c13a3313823a1063c90be969323a3aa4`**
- `main` local sincronizado por fast-forward después de la fusión

El contenido de marketing (`claude/tools-launch-assets`) no toca código de la aplicación,
pasa toda la suite de validación sin cambios, y queda lista para que el dueño decida si
prefiere fusionarla igualmente para tener todo en `main` con historial trazable, o
mantenerla como rama de referencia.

## 15. Estado real de despliegue

No se pudo verificar el sitio en producción desde esta sesión — `www.powermatchlab.com`
está bloqueado por la política de salida del entorno (`connect_rejected`, igual que
`api.indexnow.org` y `www.google.com`). El PR #40 sí se fusionó correctamente en GitHub
(verificado con la propia API de GitHub, que no pasa por el proxy de red bloqueado), así que
el código está en `main` lista para que el pipeline de despliegue del propio hosting lo
despliegue — pero esa confirmación final de "ya está en vivo" no se pudo hacer desde aquí.

## 16. Accesos externos que siguen faltando

- Pinterest (cuenta/API) — para publicar los 30 pines
- Facebook Page — para publicar los 6 posts
- LinkedIn (perfil o página) — para publicar los 6 posts
- Plataforma de vídeo (YouTube/TikTok/Instagram) — para producir y publicar los 12 vídeos
- Cuentas de foro reales (Rokslide, Forest River Forums, SolarPanelTalk, Camp-Inn Forum,
  CPAPtalk.com, Escape RV Owners Forum, TractorByNet) — para publicar las 7 respuestas,
  y verificar manualmente la política de cada foro antes de publicar
- Cuenta de correo autorizada — para enviar los 19 mensajes editoriales
- Search Console — para medir impresiones/clics/posición real
- Cloudflare Web Analytics (dashboard, no solo el pixel ya instalado) — para sesiones reales
- Amazon Associates Reports — para clics de afiliado y compras confirmadas
- Acceso de red saliente sin la política de bloqueo actual — para poder ejecutar realmente
  el envío a IndexNow desde un entorno automatizado

No se pidió ninguna contraseña ni secreto para nada de esto — la lista de arriba es
exactamente lo que falta conectar, no una petición de credenciales.

## 17. Seguimiento recomendado

- **Revisión a 7 días:** ¿se conectó algún canal? Si sí, ¿se publicaron ya los primeros
  pines/posts/vídeos según el calendario? Revisar Search Console (si ya es accesible) para
  ver si `/tools` y las 3 calculadoras aparecen indexadas.
- **Revisión a 30 días:** completar la tabla semanal de medición
  (`marketing/15-tools-launch-utm-and-calendar.md`) con datos reales de cada canal que ya
  tenga acceso, excluyendo siempre España/Argelia/bots de la lectura de adquisición.
  Decidir si continuar, ajustar o pausar la campaña según señales reales — nunca antes de
  tener esas señales.

**Ningún resultado de tráfico, posicionamiento, clics o ventas se garantiza ni se ha
inventado en este informe.** Todo lo marcado como "preparado, no publicado" es exactamente
eso — trabajo terminado esperando el acceso que permita ejecutarlo.
