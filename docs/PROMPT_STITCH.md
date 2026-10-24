# Prompt para Google Stitch — "Visita con Plan" (front)

> Pegar en Stitch en modo **Mobile**. Si Stitch genera todo junto y se mezcla, pegarlo por bloques:
> primero "Contexto + Estilo", después las pantallas de a 2 o 3.

---

Design a mobile app (Android/iOS, portrait) called **"Visita con Plan"** for field sales reps of a coffee, tea and
food brand in Argentina. All UI text must be in **Spanish (Argentina)**. Use realistic sample data.

**Purpose:** a sales rep visits small stores (kiosks, corner stores, self-service shops). In under 15 minutes per
store, they take photos of the shelves and ask the owner 7 quick questions. AI then **categorizes the store**
(format, socioeconomic level, zone, size, shelf condition, key prices vs similar stores) and **recommends a product
mix** split into three price tiers (Económica / Media / Premium). The app does NOT take orders: it ends at the
recommended mix. One role only: the sales rep.

**Style:** clean, practical, high contrast, big touch targets (used outdoors, one hand). Rounded cards,
bottom navigation with 3 tabs: **Puntos de venta · Mapa · Asistente**.

Font: clean sans-serif (Inter or Roboto).

**Brand color palette — La Virginia official colors (use exactly these hex values):**
| Role | Hex | Use |
|---|---|---|
| Primary — La Virginia blue | `#0E4194` | Top app bar, primary buttons, active tab, selected states, links |
| Primary pressed | `#0A3373` | Pressed/hover state of primary buttons |
| Logo yellow | `#FFD302` | Wordmark and key icons ON blue backgrounds only; main CTA label on blue |
| Secondary gold | `#B09613` | Badges, secondary accents, "Ofrecer primero" highlights, notifications |
| Text dark | `#4D5864` | Body text, icons, secondary labels |
| Background | `#F1F1F1` | Screen background |
| Surface | `#FFFFFF` | Cards, sheets, inputs |
| Success | `#627D47` | "Ya tiene", completed checklist items, positive deltas |
| Alert | `#C0392B` | Errors, conflicts, "precio por encima de la mediana" |

Keep yellow `#FFD302` only on blue `#0E4194` (high contrast); never yellow text on white.

**Price-tier colors (same in every mix bar, chip and legend):**
Económica = `#8A949E` (grey) · Media = `#B09613` (gold) · Premium = `#0E4194` (blue).

## Screens

**1. Iniciar sesión**
Logo placeholder "Visita con Plan", fields Usuario and Contraseña, button "Ingresar". Small text: "Vendedor · Zona Rosario Sur".

**2. Mis puntos de venta (home)**
Header "Hola, Martín · 12 puntos asignados hoy". Search bar. Filter chips: Todos · Nuevos · Clientes · Pendientes.
List of store cards: store name, address, distance, and a status badge:
- "Nuevo · sin caracterizar" (outlined badge), or
- current category e.g. "Autoservicio · NSE medio · hace 45 días".
Each card has a small 3-color bar showing its current mix (if any). Floating button not needed (stores are pre-assigned).

**3. Mapa**
Map with pins of today's assigned stores, numbered in visiting order (order is read-only). Pin color: grey `#8A949E` = new,
blue `#0E4194` = client. Tapping a pin shows a mini card with "Ver punto de venta".

**4. Detalle del punto de venta — cliente existente**
Store name, address, last visit date. Card "Categoría actual": format, NSE level with score, zone.
Card "Últimas ventas" (sample data): small table of last 3 orders with products and units.
Horizontal gallery "Fotos de la visita anterior". Current mix bar (Económica/Media/Premium %).
Primary button "Iniciar visita".
Variant for a new store: same layout but a single card "Sin caracterización previa" and button "Caracterizar comercio".

**5. Visita — Fotos**
Progress stepper at top: Fotos → Entrevista → Resultado.
Photo checklist with thumbnails and check marks:
Fachada y cuadra · Góndola de bebidas · Góndola de almacén (yerba, café, té) · Limpieza y papel · Cajas ·
Producto clave: Leche (con precio) · Producto clave: Aceite (con precio) · Producto clave: Papel higiénico (con precio).
Big camera button. Chip "Ubicación capturada · GPS" with a small map snippet. Button "Siguiente".

**6. Visita — Entrevista rápida al dueño**
Title "7 preguntas rápidas (≈ 1 min)". Each question is one row with 3 large segmented buttons + "No sé":
¿Cuántas cajas tenés? (Una · Dos · Tres o más) · ¿Quién repone? (El dueño · Un empleado · Repositores) ·
¿Cuántos trabajan acá? (Familia · 2 a 4 · 5 o más) · ¿Hacés delivery o apps? (No · Propio · Apps/online) ·
¿Qué te pide la gente que no tenés? (Más barato · De todo · Premium) · ¿Cuánto lleva cada cliente? (Poco · Compra del día · Compra grande) ·
¿Tenés otros locales? (No · 1 más · 2 o más).
Below: "Zona sugerida por IA: Media" with three chips to confirm: Vulnerable · Media · Acomodada.
Button "Analizar".

**7. Analizando**
Loader with 4 steps checking off: Leyendo góndolas · Calculando nivel socioeconómico · Comparando precios · Armando el mix.

**8. Resultado — Categorización**
Top summary card (2 lines): "Autoservicio chico de público medio-bajo. Arrancá por café molido 250 g y mate cocido."
Card "Categoría": Formato (Autoservicio · 2 cajas · 5 góndolas · sin otros locales), Zona (Media).
Card "Nivel socioeconómico": a horizontal gauge from −1 to +1 with marker at −0,4 and label "Bajo (cerca de medio)",
then an expandable list of signals, each with +1/0/−1 chip and evidence text (e.g. "Gaseosas: primeras y segundas marcas · 0").
Card "Estado de góndola": Regular, with 2–3 observations.
Card "Precios clave vs comercios similares": for Leche, Aceite, Papel higiénico show this store's price on a
min–median–max bar of similar stores, with label "12% más caro que la mediana".
For existing clients only: a comparison strip "Antes: Autoservicio · NSE medio → Ahora: NSE bajo" with a "Cambio sugerido" tag.
Button "Ver mix recomendado".

**9. Mix recomendado**
Big 3-color stacked bar: Económica 44% · Media 44% · Premium 12%, with caption "Calculado con puntaje −0,4 · 16 productos".
Section "Ofrecer primero" with 3 product cards, each with a one-line sales argument the rep can say out loud.
Then the mix grouped by tier (collapsible): product name, category (Café, Té, Yerba, Especias, Sopas), and a tag
"Ya tiene" / "Le falta". Buttons: "Copiar mix" and "Guardar caracterización".

**10. Asistente**
Chat screen tied to the current store (header shows store name and category). Suggested question chips:
"¿Con qué arranco?" · "¿Por qué nivel bajo?" · "¿Qué tiene la competencia?". Assistant bubbles are short (2–4 lines)
and can include product chips.
