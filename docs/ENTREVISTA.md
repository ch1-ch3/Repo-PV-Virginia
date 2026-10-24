# Entrevista — Front "Visita con Plan" (24/10/2026, 12:54–13:07)

1. **Objetivo:** caracterizar comercios (nuevos y clientes) a partir de fotos + 7 preguntas al dueño y recomendar un mix de productos La Virginia acorde a la categoría. La app termina en el mix: NO carga pedidos (se hacen luego en otro sistema).
2. **Usuario:** un solo rol, el vendedor. Sin vista de administración.
3. **Flujo:** login → lista de puntos asignados (orden de visita definido fuera de la app; mapa solo de referencia) → elige el comercio al llegar → (si es cliente: ve categoría previa, últimas ventas, fotos anteriores) → fotos (góndolas, fachada, cajas, productos clave leche/aceite/papel con precio) + GPS → 7 preguntas al dueño (incluye "¿tenés otros locales?") + confirmación de zona sugerida por IA → categorización → mix recomendado → chat.
4. **Inputs:** fotos, GPS (celular o metadatos), respuestas del dueño, catálogo (100 SKUs), guía de punto de venta, historial del comercio, ventas anteriores (DATOS DE EJEMPLO, declarar en el pitch).
5. **Outputs:** categoría (formato, tamaño, sucursales, zona, NSE con puntaje −1..+1 y señales, estado de góndola), precios clave vs comercios similares, sugerencia de recategorización para clientes, mix por gamas con %, 3 productos para ofrecer primero con argumento.
6. **Reglas:**
   - Gamas: Económica (La Morenita, Litoral, sobres), Media (La Virginia clásica), Premium (LVE, Puro Aroma, cápsulas, tostados de origen, tés especiales, Tuy Stevia/Sucra). Confirmado por el usuario.
   - Mix interpolado linealmente según puntaje NSE: −1 → 80/20/0 · 0 → 20/60/20 · +1 → 0/30/70 (Económica/Media/Premium, % sobre cantidad de productos distintos). Supuesto ajustable.
   - Tamaño del mix por formato: kiosco ≈ 5, almacén ≈ 10, autoservicio 15–20.
   - Zona: la IA propone (GPS + fotos de fachada/cuadra) y el vendedor confirma con un toque.
   - NSE calculado por código con la regla de la guía (umbral ±0,3, mínimo 4 respuestas, conflicto foto/dueño → medio).
7. **Excepciones:** comercio nuevo sin historial (no hay bloque "antes"); < 4 respuestas → pedir otra foto; precio ilegible → sin dato.
8. **Calidad:** visita ≤ 15 min (fotos + preguntas ≈ 3 min); resultado trazable (puntaje → regla → mix).
9. **Pendiente / riesgos:** ventas anteriores son simuladas; % de referencia del mix y gamas de algunos SKUs son supuestos; "comercios similares" = mismo formato y nivel NSE (supuesto); el backend v2 debe actualizarse (zona, sucursales, mix por gamas, historial, ventas de ejemplo).
10. **Siguiente acción:** generar las pantallas en Stitch con `PROMPT_STITCH.md`, exportar a código y alinear el contrato del back.
