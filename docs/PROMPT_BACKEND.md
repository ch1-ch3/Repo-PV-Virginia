# Prompt para el agente de VS Code — Backend "Visita con Plan"

> Copiá todo lo que está debajo de la línea y pegalo en el agente. Trabajá por FASES: al terminar cada una,
> el agente se detiene, muestra qué cambió y vos hacés commit + push a `claude/back` y PR a `main`.

---

## Rol y contexto

Sos el desarrollador backend de "Visita con Plan", una app para vendedores de La Virginia (hackathon Shippear #3,
cierre de entrega 15:30). Otra persona hace el front en v0 y NO toca el back. Vos NO tocás el front.

**El problema real (entrevista con La Virginia):**
- El vendedor tiene ~15 minutos por cliente; si se pasa, no llega con su ruta. Necesita un input que AGILICE la venta.
- Hay un cuestionario socioeconómico por comercio, pero el último se hizo hace 4 años: los vendedores no cargan
  datos y queda incompleto.
- Quieren: fotos (góndolas e instalaciones), nivel socioeconómico, formato/tipo de comercio, estado de góndola,
  ubicación, cantidad y calidad de productos, cantidad de cajas, comparar precios de productos clave
  (papel higiénico, aceite, leche) entre comercios, y que cada visita sea una "visita con plan".

**Tesis del producto:** el relevamiento que nadie completa se completa solo, como subproducto de la venta:
fotos + 6 toques al dueño → ficha completa + plan de venta + precios para comparar.

## Lo que ya existe (NO reescribir, extender)

Leé primero: `AGENTS.md`, `docs/CONTRATO_V2.md` (contrato nuevo, manda), `lib/*`, `app/api/*`.
- `lib/llm.ts`: llama a Gemini / OpenAI / Anthropic por fetch, sin dependencias, según la env var disponible.
- `lib/prompt.ts`, `lib/catalogo.ts`: prompt y catálogo PROVISORIOS → hay que reemplazarlos.
- `lib/db.ts`: Supabase por REST si hay env vars; si no, memoria + `data/fichas-demo.json`.
- `app/api/analizar`, `app/api/chat` (devuelve texto plano), `app/api/comercios`.
- `data/catalogo.json` (100 SKUs: material, linea, sublinea, rubro) y `data/guia-pdv.txt` ya convertidos desde `Input/`.

## Reglas

1. Solo tocás: `app/api/**`, `lib/**`, `data/**`, `supabase/**`, `docs/**`. Nunca `components/**`, `app/(ui)/**`, estilos.
   Única excepción: `components/datos/tipos.ts` puede quedar como re-export de `lib/types.ts` si el front lo pide.
2. No agregar dependencias npm salvo que sea imprescindible; si agregás una, versión FIJA (sin `^` ni "latest").
3. Claves solo por env vars (`GEMINI_API_KEY` u otra). Nada de claves en el código ni en commits.
4. **El modelo extrae evidencia; el código decide.** El nivel socioeconómico se CALCULA en TypeScript con las reglas
   de la guía, nunca lo elige el modelo.
5. El modelo no inventa: si no se ve, `null` o lista vacía. `material` debe existir en `data/catalogo.json`
   (validar y descartar lo que no exista).
6. Cada ruta responde `{ error }` con status correcto. Nada de fallar en silencio.
7. Correr `pnpm typecheck` (o `npx tsc --noEmit`) al final de cada fase. Si falla, se arregla antes de seguir.

## FASE 1 — Catálogo, tipos y motor NSE (objetivo: 12:45)

1. `lib/types.ts`: reemplazar por los tipos de `docs/CONTRATO_V2.md` (FichaComercio, RespuestasDueno, PlanVisita,
   ComparadorPrecios, ValorNSE).
2. `lib/catalogo.ts`: cargar `data/catalogo.json`. Exportar `CATALOGO`, `buscarMaterial(codigo)` y
   `catalogoParaPrompt()` (texto compacto agrupado por línea → sublínea, con el código de material).
   Agregar reglas de afinidad formato/NSE por línea **como supuestos marcados con `// SUPUESTO`**:
   - Cápsulas, tostados premium (Puro Aroma, LVE 500 g), tés especiales/saborizados, Tuy Stevia/Sucra → NSE medio-alto, autoservicio/súper.
   - Torrados, saquitos, té común, yerba Litoral, herboristería, especias en sobre, sopas/caldos → todo formato, NSE bajo-medio; en NSE bajo, presentaciones chicas.
   - "PRODUCTOS FUERA DEL HOGAR" (café en grano 1 kg MKP, azúcar en palitos, Tuy polvo 400) → gastronomía/institucional.
   - Instantáneos y mixes de cappuccino → autoservicio, kiosco, estación de servicio.
   - Giacomo (capelettis) → requiere heladera/exhibidor: solo si se ven heladeras.
3. `lib/nse.ts`: función pura `calcularNSE(criteriosFoto, respuestasDueno)` según la guía:
   - Criterios de foto (id): `gaseosas_cerveza`, `vinos`, `papel_limpieza`, `premium_saludable`,
     `marcas_basicos` (galletitas/yerba/fideos/aceite), `forma_venta`, `surtido`, `orden_carteles`.
   - Criterios del dueño: los 6 de `RespuestasDueno`.
   - `puntaje = suma / respondidas` (null no cuenta). `≥ +0,3` → alto; `≤ −0,3` → bajo; resto → medio.
   - `respondidas < 4` → nivel "medio" y `pedir_otra_foto = true`.
   - Conflicto: promedio de foto y promedio del dueño con signo opuesto y |diferencia| ≥ 0,6 → "medio" y `conflicto_foto_dueno = true`.
   - `explicacion` en una línea (ej. "Promedio +0,4 en 7 criterios: alto").
   - Incluir 5 casos de prueba en `lib/nse.test-cases.ts` (entrada → salida esperada) y un script
     `scripts/probar-nse.ts` ejecutable con `npx tsx` que los verifique.

**Criterio de aceptación:** typecheck OK y los 5 casos pasan.

## FASE 2 — Análisis v2 (objetivo: 13:30, con almuerzo en el medio)

1. `lib/prompt.ts`: prompt nuevo que use `catalogoParaPrompt()` y `data/guia-pdv.txt`. El modelo devuelve SOLO JSON con:
   formato (tipo + formato según la guía, cajas, góndolas, justificación), `criterios_foto` (cada uno con valor
   −1/0/+1/null y evidencia), gondola (estado, variedad, observaciones), surtido tiene/falta con `material` exacto,
   ofrecer_primero (máx. 3, con argumento que el vendedor pueda decir tal cual), pedido_sugerido (cantidades
   prudentes según tamaño y variedad), competencia, precios_clave, checklist_fotos_faltantes, resumen.
   Regla de surtido de la guía: si la variedad es baja, ofrecer pocas presentaciones de alta rotación.
2. `app/api/analizar/route.ts`: aceptar `respuestas_dueno` (JSON en el form), llamar al modelo, validar materiales
   contra el catálogo, calcular NSE con `lib/nse.ts`, armar `FichaComercio` v2, guardar y devolver.
3. **Modo demo sin clave:** si no hay ninguna env var de modelo, devolver una ficha de demo coherente
   (`origen: "demo"`) con el NSE calculado igual a partir de `respuestas_dueno`, para que la app funcione siempre.
4. Actualizar `data/fichas-demo.json` a v2 con 3 comercios distintos (almacén NSE bajo, autoservicio medio,
   súper alto), con precios clave cargados, para que el comparador tenga datos.

**Criterio de aceptación:** `curl -F fotos=@foto.jpg -F 'respuestas_dueno={"cajas":1,"empleados":0}' localhost:3000/api/analizar`
devuelve una ficha v2 válida (con y sin clave).

## FASE 3 — Plan de visita y comparador (objetivo: 14:30)

1. `GET /api/plan`: busca el comercio por nombre (normalizado) o por cercanía (< 50 m) en el historial.
   Conocido → última ficha, días desde la última visita, objetivo (ej. productos que faltaban), checklist de fotos.
   Nuevo → checklist estándar: fachada, góndola de bebidas, góndola de almacén (yerba/café/té), limpieza y papel,
   cajas, carteles de precios.
2. `GET /api/precios`: agrupar `precios_clave` de todas las fichas por producto; mínimo, mediana y máximo.
3. `app/api/chat`: actualizar el contexto al formato v2 (incluir criterios NSE y catálogo resumido).

**Criterio de aceptación:** con las fichas de demo, `/api/precios` devuelve 3 productos con estadísticas y
`/api/plan?nombre=<demo>` devuelve `conocido: true`.

## FASE 4 — Cierre (14:45–15:00)

- Typecheck y build (`pnpm build`) OK. Actualizar `docs/CONTRATO_V2.md` si algo cambió y avisar al front.
- README corto: cómo correr, env vars, endpoints.
- A partir de las 15:00: solo correcciones de bugs.

## Formato de trabajo

Al final de cada fase mostrá: archivos cambiados, cómo probarlo (comando concreto) y riesgos pendientes.
Si algo del contrato es ambiguo, preguntá antes de inventar.

---

## ACTUALIZACIÓN POST-ENTREVISTA (13:10) — leé esto primero, manda sobre lo anterior

Leé la sección "CAMBIOS POST-ENTREVISTA" de `docs/CONTRATO_V2.md` y `docs/ENTREVISTA.md`. Ajustes al plan:

- **Fase 1:** en `lib/catalogo.ts` agregar `gama` a cada SKU con las reglas del contrato (por prefijo/línea; marcar `// SUPUESTO`).
  Agregar `otros_locales` a `RespuestasDueno` y al cálculo NSE. Nuevo `lib/mix.ts`: `calcularMix(puntaje, formato, catalogo, tiene[])`
  con interpolación lineal de porcentajes, tamaño por formato, redondeo que sume `total_productos`, priorizando
  los SKUs "le_falta" y de mayor rotación (presentaciones chicas si la variedad de góndola es baja). Casos de prueba incluidos.
- **Fase 2:** quitar `pedido_sugerido`. La IA elige productos SOLO dentro del mix calculado por código y redacta los argumentos.
  Agregar `zona` (sugerida por IA + `zona_confirmada` del form) y `recategorizacion` cuando llega `punto_id`.
- **Fase 3 (reemplaza a /api/plan):** `GET /api/puntos` y `GET /api/puntos/:id` con `data/puntos-demo.json`
  (12 puntos en Rosario zona sur: 7 nuevos, 5 clientes con ventas y categoría de ejemplo). Mantener `/api/precios`.
- **Prioridad si falta tiempo:** analizar + NSE + mix > puntos > precios > chat.
