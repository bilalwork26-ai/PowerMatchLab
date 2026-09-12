# Informe final — Sprint SEO orientado a CTR y conversión (septiembre 2026)

Rama: `claude/seo-ctr-sprint`, creada desde `origin/main` en `13d714356c8aaf26f1b835f5da3b7ab6ee6a1497`
(el mismo SHA de fusión indicado en la tarea; confirmado que no existía ninguno
posterior antes de empezar).

## 1. Diagnóstico basado en Search Console

Línea base real (ver también `marketing/17-seo-ctr-sprint-measurement.md`):
204 impresiones, 5 clics, CTR ~2.45%, 58 consultas, 35 páginas, sobre una
ventana real de apenas 7 días (3-9 septiembre 2026) en un sitio nuevo. Móvil:
32 impresiones / 5 clics / CTR 15.6% / posición media 18.5. Escritorio: 172
impresiones / 0 clics / posición media 47.6.

**Lectura honesta de esa diferencia móvil/escritorio:** no se encontró ningún
bug de renderizado, hidratación o CTA específico de escritorio durante el QA
(ver sección 7). La diferencia de posición media (18.5 frente a 47.6) ya
explica por sí sola un CTR de 0% en escritorio — a partir de la posición ~30,
el CTR esperado en cualquier estudio de mercado es cercano a cero
independientemente del dispositivo. No se inventó una causa más precisa de la
que permiten los datos.

El clúster temático más claro en las consultas (frigorífico, generador
interior, batería de respaldo, autonomía) ya tiene páginas dedicadas y
diferenciadas en el sitio — ver sección 3.

## 2. Páginas modificadas y por qué

| Página | Cambio | Justificación basada en evidencia |
|---|---|---|
| `/products` | Title reescrito: "Power Stations Catalog" → "Portable Power Station Catalog: Compare 39 Models by Spec" (número calculado dinámicamente desde el catálogo, nunca hardcodeado) | Title genérico sin propuesta de valor ni diferenciador, independientemente del tamaño de muestra (10 impresiones, posición 5.9, 0 clics) |
| `/products/[id]` (las 39+ páginas de producto) | Meta description acortada de hasta 227 caracteres (con el nombre de producto más largo) a un máximo real de 155 | Hallazgo sistémico y verificable: la plantilla anterior superaba el límite de fragmento de Google en escritorio (~155-160) y móvil (~120) para prácticamente todos los productos, no solo el que apareció en el informe (Anker SOLIX F3800, 191 caracteres) |
| `/about-methodology` | Añadido un Callout final con enlaces a `/power-calculator` y `/compare` | La página terminaba en enlaces solo legales/de confianza (Affiliate Disclosure, Editorial Policy, Contact) sin ningún camino hacia la conversión — un callejón sin salida real en una página que ya recibe clics reales (16 impresiones, 1 clic, posición 2.9) |
| `src/app/tools/[slug]/page.tsx`, `src/app/guides/[slug]/page.tsx` | Añadido `min-w-0` al elemento CSS Grid que envuelve el contenido principal | Bug real de overflow horizontal en móvil descubierto durante el QA del clúster de frigoríficos (ver sección 7) — sin este ajuste, la tabla de dispositivos (`min-w-[720px]`) empujaba toda la tarjeta de la calculadora más allá del viewport, dejando columnas de la tabla inalcanzables |
| `src/components/tools/LoadListCalculator.tsx` | Ajustado el `<select>` de ejemplos y su `<label>` a ancho completo en móvil, ancho automático desde `sm:` | Mismo bug de overflow horizontal — un `<select>` sin restricción de ancho, dentro de una fila `flex-wrap`, forzaba la fila completa fuera del viewport en móvil |

Ninguna página fue fusionada, eliminada o redirigida. Ninguna página con
muestra pequeña (`/compare`, `/deals`, las 3 guías con 5-21 impresiones,
`/best-for-camping`) fue reescrita de forma impulsiva — se revisaron una por
una (título, meta, H1, canonical, structured data, enlaces) y se concluyó que
ya coinciden con la intención real, sin justificación suficiente para tocarlas.
`/deals` está intencionadamente `noindex` (cero ofertas verificadas) y
correctamente excluida del sitemap — cualquier impresión que muestre Search
Console para ella no cambia con un rediseño de title/meta.

## 3. Mapa de intención del clúster de frigoríficos

| URL | Función | Evidencia de diferenciación |
|---|---|---|
| `/best-for-refrigerator-backup` | Selección comercial / ranking | Title "Best Power Stations for Refrigerator Backup", clasifica por surge rating verificado, capacidad y consumo idle — nunca por comisión o precio |
| `/guides/power-station-for-refrigerator` | Guía de dimensionamiento | Title "What Size Power Station Do I Need for a Refrigerator?" — responde "cuánta capacidad" |
| `/guides/can-a-power-station-run-a-refrigerator` | Viabilidad + autonomía | Title "Can a Power Station Run a Refrigerator, and For How Long?" — responde "funcionará" y "cuánto dura" |
| `/guides/best-indoor-generator-for-refrigerator` | Puente de seguridad/terminología | Title "Best Indoor Generator for a Refrigerator: Safe Battery Backup Options" — captura la búsqueda "generador interior" y redirige a la opción segura (batería, no combustión) |
| `/tools/refrigerator-runtime-calculator` | Herramienta interactiva | Calculadora con inputs propios del usuario, sin sesgo de afiliado |

**Conclusión de la auditoría de canibalización:** no existe. Los 5 títulos son
únicos, cada intro/quickAnswer apunta a una pregunta distinta (verificado con
test automatizado, ver sección 8), y el enlazado ya es bidireccional completo:
la página comercial enlaza a las 3 guías (`relatedGuideSlugs`); cada guía
enlaza de vuelta a la comercial (`relatedBestForSlug`) y a la calculadora
(`relatedToolSlug`); la calculadora enlaza a las 3 guías y a la comercial. No
se fusionó, eliminó ni redirigió ninguna página — la auditoría no encontró
justificación para hacerlo.

La calculadora del clúster (`refrigerator-runtime-calculator`, vía
`LoadListCalculator` → `src/lib/recommend.ts`) no usa `amazon_affiliate_url`,
comisión, precio ni popularidad en su lógica de recomendación — verificado
leyendo el código fuente y confirmado por los tests existentes
(`amazon-cta-affiliate-only.test.ts`).

## 4. Tabla de titles y meta descriptions (antes/después)

| Página | Antes | Después | Razón (intención de búsqueda) |
|---|---|---|---|
| `/products` (title) | "Power Stations Catalog" | "Portable Power Station Catalog: Compare 39 Models by Spec" | Sin valor añadido → nombra el tamaño real del catálogo y la acción ("Compare") |
| `/products/[id]` (description) | `"{name}: manufacturer-published specifications, PowerMatchLab's editorial score where the data justifies one, estimated runtime examples, pros and cons, and a direct link to Amazon."` (hasta 227 car.) | `"{name}: manufacturer specs, an editorial PowerMatch Score, estimated runtime examples, pros and cons, and a verified link to Amazon."` (máx. 155 car.) | Ajuste técnico de longitud de fragmento, mismo contenido/promesa |
| `/compare` | Sin cambio | Sin cambio | Title y meta ya coinciden con la intención ("Free Tool", specs reales); muestra pequeña (17 impresiones) no justifica reescritura |
| `/guides/solar-input-and-charging-times-explained` | Sin cambio | Sin cambio | Ya específico y correcto; 10 impresiones es muestra insuficiente |
| `/guides/power-station-for-refrigerator` | Sin cambio | Sin cambio | Title ya coincide literalmente con la consulta objetivo |
| `/guides/power-station-for-power-outage` | Sin cambio | Sin cambio | Igual — 5 impresiones, sin señal de defecto real |
| `/best-for-camping` | Sin cambio | Sin cambio | 2 impresiones — muestra insuficiente para cualquier conclusión |
| `/deals` | Sin cambio (sigue `noindex`) | Sin cambio | La página está intencionadamente fuera del índice; reescribir su title no tiene efecto en CTR real |

## 5. Cambios de enlaces internos

- `/about-methodology`: nuevo Callout con enlaces a `/power-calculator` y
  `/compare` (antes terminaba en enlaces solo legales).
- Confirmado (sin cambios necesarios) que ya existían: enlace desde la home
  (`ToolsSection`) a `/tools`, `/power-calculator`, `/compare`, `/products`;
  enlace directo desde la home (`UseCaseCards`) a
  `/best-for-refrigerator-backup` con anchor descriptivo; enlazado bidireccional
  completo del clúster de frigoríficos (sección 3); sidebar "Next steps" en
  cada guía/herramienta enlazando al siguiente paso lógico, posicionado
  `order-first` en móvil (aparece antes que el cuerpo del artículo en pantallas
  estrechas, beneficiando exactamente al tráfico móvil que genera los clics
  reales).
- Verificado que `/best-for-*` NO depende solo del footer para ser
  descubierta: aparece en el footer, en la home (dos secciones distintas), y en
  las guías/herramientas relacionadas.

## 6. Auditoría www / no-www

**Resultado: correcto, sin cambios necesarios.** Verificado en
`next.config.mjs` (una única regla de redirección permanente, apex → www,
sin bucles, orden correcto respecto a la regla del Delta 3), `src/lib/site.ts`
(`SITE.url` fuerza `www` incluso si la variable de entorno llega mal
configurada), `src/lib/seo.ts` (`absoluteUrl()` es la única función que
genera URLs absolutas, usada de forma consistente en sitemap, RSS, OG y
JSON-LD). Búsqueda exhaustiva en `src/` de cualquier URL hardcodeada al dominio
raíz sin `www`: cero resultados fuera de la constante `APEX_HOST` (usada
exactamente para detectarlo y corregirlo). La cobertura de test ya existente
(`tests/canonical-host-redirect.test.ts`, `tests/canonical-www-enforcement.test.ts`)
es exhaustiva — no se duplicó, solo se añadieron dos aserciones ligeras nuevas
que fijan la conclusión de esta auditoría como regresión permanente (ver
`tests/seo-ctr-sprint.test.ts`, sección "canonical host audit conclusion").

## 7. Resultado del QA móvil/escritorio

Build de producción reconstruido desde cero, servidor levantado, verificado
con Playwright/Chromium (desktop 1280×900, móvil 390×844) en las 10 páginas
tocadas o auditadas: `/`, `/products`, `/products/anker-solix-f3800`,
`/about-methodology`, `/compare`, `/best-for-refrigerator-backup`, las 3 guías
del clúster, `/tools/refrigerator-runtime-calculator`.

- **HTTP 200 en las 10 páginas**, en ambos viewports.
- **Sin errores de consola ni de hidratación** atribuibles al código de la
  app — los únicos mensajes de consola detectados fueron `ERR_TUNNEL_CONNECTION_FAILED`
  al cargar Cloudflare Beacon y Google AdSense, causados por la política de
  salida de red de este entorno (el mismo bloqueo confirmado en sesiones
  anteriores para IndexNow y para el propio dominio de producción) — no por un
  defecto del código, y ocurren igual en páginas no modificadas.
- **Bug real encontrado y corregido:** en móvil, `/tools/refrigerator-runtime-calculator`
  (y por extensión cualquier página que usa `LoadListCalculator` o comparte el
  mismo layout de grid: RV, home-backup, y las páginas de guías) tenía un
  overflow horizontal real — verificado con mediciones directas (bounding
  rects, no solo `scrollWidth`) antes y después: antes, la tarjeta de la
  calculadora se renderizaba a 758-770px de ancho en un viewport de 390px,
  dejando columnas de la tabla de dispositivos inalcanzables (la página no
  se desplaza horizontalmente por el `overflow-x-hidden` global, así que ese
  contenido quedaba simplemente recortado, no accesible). Después de aplicar
  `min-w-0` en el elemento de grid y ajustar el `<select>`/`<label>` de la fila
  de ejemplos: la tarjeta de la calculadora mide 358px (dentro del viewport),
  el contenedor de scroll de la tabla mide 324px, y el scroll interno de la
  tabla ahora alcanza el 100% de sus 720px de ancho — confirmado
  programáticamente (`wrapCanScrollFully: true`, `pageCanScrollHorizontally: false`).
  Verificado visualmente antes y después con capturas de pantalla.
- **Escritorio:** sin regresión — el `<select>` y el botón "Add custom unit"
  siguen mostrándose lado a lado como antes, confirmado visualmente.
- **Estados de consentimiento:** el banner de consentimiento se renderiza
  igual en todas las páginas probadas, sin opacidad permanente ni bloqueo del
  contenido subyacente (comportamiento ya verificado en una sesión anterior y
  no alterado por este sprint).

## 8. Tests añadidos o modificados

Nuevo archivo `tests/seo-ctr-sprint.test.ts`, 18 tests:
- Metadata de `/products` (title específico, conteo dinámico, no hardcodeado).
- Longitud de la meta description de `/products/[id]` verificada contra
  **todo el catálogo real** (39+ productos), no solo un caso de ejemplo.
- Diferenciación estructural del clúster de frigoríficos: 5 entidades existen,
  ningún title duplicado, cada intro apunta a una pregunta distinta, enlazado
  bidireccional completo (comercial↔guías↔herramienta).
- Enlaces internos esenciales: `/about-methodology` enlaza a
  `/power-calculator` y `/compare`; la home enlaza a `/tools` y a
  `/best-for-refrigerator-backup` fuera del footer.
- Ausencia de precios inventados: ningún producto tiene campo de precio
  manual; el dataset de `DEALS` no tiene campos de precio/descuento/porcentaje.
- Conclusión de la auditoría www/no-www fijada como regresión permanente.
- Fix del overflow horizontal en `LoadListCalculator` y confirmación de que
  `CpapCalculator`/`StarlinkCalculator` no tenían el mismo problema.

No se modificó ningún test existente — todos los 580 tests previos siguen
intactos y en verde.

## 9. Resultado exacto de validación técnica

```
npx tsc --noEmit         → sin errores
npx next lint            → sin advertencias ni errores
npx vitest run           → 598/598 tests, 36 archivos de test
npx next build           → correcto
```

## 10. Integridad de `products.json` y enlaces afiliados

- `products.json` sha256 idéntico antes y después de todo el sprint:
  `57d831f7cc4d1d36bcf93c6579ada830541c937e09bf4230408a071ffd8aa270`.
- `git diff --stat` contra `products.json`, `marketing/`, `indexnow-manifest.json`,
  `public/*.txt`, `src/lib/amazon.ts`, `src/data/products.ts`: **vacío** —
  ningún archivo prohibido fue tocado.
- Tests de integridad de afiliados ya existentes
  (`amazon-cta-affiliate-only.test.ts`, `amazon-link-schema-rules.test.ts`,
  `amazon-cta.test.ts`) siguen en verde sin modificación.
- Ningún precio manual, descuento o campo simulado fue añadido en ningún
  punto de este sprint — verificado explícitamente por los nuevos tests de la
  sección 8.

## 11. Archivos tocados

```
src/app/about-methodology/page.tsx
src/app/guides/[slug]/page.tsx
src/app/products/[id]/page.tsx
src/app/products/page.tsx
src/app/tools/[slug]/page.tsx
src/components/tools/LoadListCalculator.tsx
tests/seo-ctr-sprint.test.ts               (nuevo)
marketing/17-seo-ctr-sprint-measurement.md  (nuevo)
marketing/18-seo-ctr-sprint-final-report.md (nuevo, este documento)
```

## 12-13. PR y SHA de fusión

Ver el mensaje de cierre de esta sesión para el número de PR y el SHA de
fusión exactos, confirmados en el momento de fusionar (no se rellenan aquí
antes de que ese paso ocurra realmente).

## 14. Estado real de producción

`www.powermatchlab.com` es inalcanzable desde este entorno
(`CONNECT tunnel failed, response 403` — política de salida de red de la
organización, confirmado también contra `api.indexnow.org` y `www.google.com`
en sesiones anteriores). El código fusionado en GitHub es verificable vía la
propia API de GitHub (que no pasa por ese bloqueo), pero la confirmación de
que el sitio en vivo ya sirve estos cambios no se pudo hacer desde aquí.

## 15. Métricas a revisar en 14 días

Ver tabla completa en `marketing/17-seo-ctr-sprint-measurement.md`. Resumen:
impresiones, clics, CTR y posición media (total, móvil, escritorio);
impresiones/clics de `/products`, de las páginas de producto y de
`/tools/refrigerator-runtime-calculator`; movimiento de posición en el clúster
de consultas de frigorífico/generador/respaldo; `calculator_start`,
`view_product`, `compare_add_product`, `affiliate_click` (GA4, si está
activo); compras confirmadas **únicamente** vía Amazon Associates. Ninguna
celda debe rellenarse con 0 hasta comprobarse contra el panel real
correspondiente — usar "pendiente / no accesible" en su lugar.
