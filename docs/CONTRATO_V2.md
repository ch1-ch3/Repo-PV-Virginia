# Contrato v2 — Front ↔ Back (Visita con Plan)

Reemplaza a `docs/CONTRATO.md`. **El front (v0) consume esto; el back lo implementa.**
Si alguno necesita cambiar un campo, se avisa ANTES y se actualiza este archivo.

Fuentes: `Input/Shippear3_Catalogo_Productos.xlsx` (→ `data/catalogo.json`, 100 SKUs) y
`Input/Shippear3_Guia_Punto_de_Venta.pdf` (→ `data/guia-pdv.txt`), más la entrevista con La Virginia.

---

## Flujo del vendedor (≤ 15 min por cliente)

1. **Antes de entrar** — `GET /api/plan?nombre=...&lat=..&lng=..` → si el comercio ya fue visitado, devuelve
   la última ficha + qué cambió + objetivo de la visita. Si es nuevo, devuelve un checklist de qué fotografiar.
2. **Durante (≈ 2 min)** — saca 3–6 fotos (góndolas, fachada/instalaciones, carteles de precios) y responde
   6 preguntas rápidas al dueño (botones Bajo/Medio/Alto/No sé) → `POST /api/analizar`.
3. **Ficha** — formato, NSE con puntaje trazable, estado de góndola, surtido La Virginia, qué ofrecer, pedido.
4. **Chat** — `POST /api/chat` para repreguntar.
5. **Después** — `GET /api/comercios` (historial) y `GET /api/precios` (comparador de precios clave).

---

## POST /api/analizar  (multipart/form-data)

| Campo | Tipo | Obligatorio |
|---|---|---|
| `fotos` | 1–6 archivos JPEG (el front comprime a ≤1280 px antes de subir) | sí |
| `nombre` | string | no |
| `lat`, `lng` | number | no |
| `nota` | string libre del vendedor | no |
| `respuestas_dueno` | JSON string: `RespuestasDueno` | no |

```ts
type ValorNSE = -1 | 0 | 1 | null          // null = "no sé / no aplica" (no cuenta)

type RespuestasDueno = {
  cajas?: ValorNSE            // Una (-1) · Dos (0) · Tres o más (+1)
  repositor?: ValorNSE        // El dueño (-1) · Un empleado (0) · Repositores de marcas/propio (+1)
  empleados?: ValorNSE        // Dueño o familia (-1) · 2 a 4 (0) · 5 o más (+1)
  delivery?: ValorNSE         // No (-1) · Propio por teléfono (0) · Apps o tienda online (+1)
  pedidos_faltantes?: ValorNSE// Más barato/suelto (-1) · De todo (0) · Premium/importado (+1)
  ticket?: ValorNSE           // Pocas unidades (-1) · Compra del día (0) · Compra grande (+1)
}
```

### Respuesta 200: `FichaComercio`

```ts
type FichaComercio = {
  id: string
  creado: string                          // ISO
  nombre: string | null
  ubicacion: { lat: number; lng: number } | null

  formato: {
    tipo: "almacen_kiosco" | "autoservicio" | "supermercado" | "mayorista"
        | "gastronomia_hoteleria" | "institucional" | "especializado"
    formato: "kiosco" | "almacen" | "autoservicio" | "autoservicio_a4" | "supermercado" | "hipermercado"
        | "mayorista" | "bar_cafeteria" | "restaurante_hotel" | "oficina_catering" | "vending"
        | "dietetica" | "estacion_servicio" | "ecommerce"
    cajas_estimadas: number | null
    gondolas_estimadas: number | null
    justificacion: string
  }

  nse: {
    nivel: "bajo" | "medio" | "alto"      // calculado por CÓDIGO, no por el modelo
    puntaje: number | null                // promedio de criterios respondidos (−1..+1)
    respondidas: number
    criterios: {
      id: string                          // ej. "gaseosas", "vinos", "cajas"
      etiqueta: string                    // texto para mostrar
      fuente: "foto" | "dueno"
      valor: ValorNSE
      evidencia: string                   // qué se vio / qué dijo
    }[]
    pedir_otra_foto: boolean              // true si hubo < 4 respuestas
    conflicto_foto_dueno: boolean         // true si foto y dueño apuntan a niveles opuestos
    explicacion: string                   // 1 línea: por qué quedó en ese nivel
  }

  gondola: {
    estado: "buena" | "regular" | "mala"
    variedad: "baja" | "media" | "alta"   // cuánto surtido tiene (define cuántos SKUs ofrecer)
    observaciones: string[]
  }

  surtido: {
    tiene: { material: string; rubro: string; observacion?: string }[]
    falta: { material: string; rubro: string; motivo: string }[]
  }
  ofrecer_primero: { material: string; rubro: string; argumento: string }[]   // máx. 3
  pedido_sugerido: { material: string; cantidad: number; unidad: string }[]
  competencia: { marca: string; categoria: string; observacion: string }[]
  precios_clave: {
    producto: "papel_higienico" | "aceite" | "leche" | "yerba" | "cafe" | "azucar" | "otro"
    descripcion: string                   // marca + presentación
    precio: number | null                 // null si no se lee
  }[]
  checklist_fotos_faltantes: string[]     // qué foto conviene sacar para mejorar el análisis
  resumen: string                         // 2–3 líneas, se lee en 10 segundos
  origen: "ia" | "demo"                   // "demo" si no hay clave de modelo
}
```

`material` es SIEMPRE el código exacto del catálogo (`data/catalogo.json`), p. ej. `"CAFE MOL LV TOR EQUIL 250G"`.

---

## GET /api/plan?nombre=&lat=&lng=
```ts
type PlanVisita = {
  conocido: boolean
  ultima_ficha: FichaComercio | null
  dias_desde_ultima: number | null
  objetivo: string                        // ej. "Recuperar mate cocido, que faltaba la última vez"
  checklist_fotos: string[]               // qué fotografiar en esta visita
}
```

## POST /api/chat  (JSON)
Request: `{ ficha: FichaComercio, mensajes: { rol: "vendedor" | "asistente"; texto: string }[] }`
Response: **texto plano** (el front lo lee como stream).

## GET /api/comercios
Response: `FichaComercio[]` (más recientes primero; incluye fichas de demo).

## GET /api/precios
```ts
type ComparadorPrecios = {
  producto: string                        // "papel_higienico", ...
  comercios: { fichaId: string; nombre: string | null; descripcion: string; precio: number; fecha: string }[]
  minimo: number; mediana: number; maximo: number
}[]
```

## Errores
Toda ruta devuelve `{ error: string }` con status 4xx/5xx. El front muestra el mensaje y NO cae en silencio a datos de ejemplo
(salvo si `origen: "demo"`, que se muestra con un aviso).

---

## CAMBIOS POST-ENTREVISTA (13:10) — mandan sobre lo anterior

1. **Sin pedido.** Se elimina `pedido_sugerido`. La app termina en el mix recomendado.
2. **Gamas.** Cada SKU del catálogo tiene `gama: "economica" | "media" | "premium"`:
   Económica = La Morenita (MO/MORE), Litoral, especias/condimentos en sobre · Media = La Virginia clásica (LV torrados, saquitos, té común, Tuy clásico, herboristería LV, sopas/caldos) · Premium = LVE, Puro Aroma, cápsulas, tostados de origen, tés especiales/saborizados, Tuy Stevia/Sucra/Sweet, mixes de cappuccino.
3. **Mix por gamas (continuo).** Interpolación lineal según `nse.puntaje` entre anclas
   −1 → 80/20/0 · 0 → 20/60/20 · +1 → 0/30/70 (Económica/Media/Premium, % sobre cantidad de SKUs distintos).
   Tamaño del mix por formato: kiosco 5 · almacén 10 · autoservicio 16 · súper 20 · gastronomía 8.
   ```ts
   mix: {
     puntaje_usado: number
     porcentajes: { economica: number; media: number; premium: number }   // suman 100
     total_productos: number
     productos: { material: string; rubro: string; gama: "economica" | "media" | "premium"; estado: "ya_tiene" | "le_falta" }[]
   }
   ofrecer_primero: { material: string; rubro: string; gama: string; argumento: string }[]  // máx. 3
   ```
4. **7ª pregunta al dueño:** `otros_locales?: ValorNSE` → No (−1) · 1 más (0) · 2 o más (+1). Cuenta para el NSE y se muestra en formato (`sucursales`).
5. **Zona.** `zona: { sugerida: "vulnerable" | "media" | "acomodada"; confirmada: ... | null; evidencia: string }`.
   La IA sugiere (fotos de fachada/cuadra); el vendedor confirma enviando `zona_confirmada` en el form de `/api/analizar`.
6. **Puntos de venta asignados (nuevo).** `GET /api/puntos` → lista del vendedor (datos de ejemplo, ~12):
   ```ts
   type PuntoDeVenta = {
     id: string; nombre: string; direccion: string; lat: number; lng: number; orden: number
     estado: "nuevo" | "cliente"
     categoria_actual: { formato: string; nse: "bajo" | "medio" | "alto"; puntaje: number; fecha: string } | null
     ultimas_ventas: { fecha: string; items: { material: string; unidades: number }[] }[]   // EJEMPLO
     fotos_anteriores: string[]                                                           // URLs de ejemplo
     mix_actual: { economica: number; media: number; premium: number } | null
   }
   ```
   `GET /api/puntos/:id` → un punto. `POST /api/analizar` recibe `punto_id` y la ficha incluye
   `recategorizacion: { antes: {formato, nse, puntaje} | null; ahora: {formato, nse, puntaje}; cambio: boolean; motivo: string }`.
7. **Login:** solo visual (usuario de demo), sin backend de autenticación.

---

## IMPLEMENTADO (24/10, tarde) — esto es lo que hoy corre; `lib/types.ts` es la fuente de verdad

- **Fotos opcionales.** `POST /api/analizar` acepta 0–10 fotos; exige al menos una foto **o** una respuesta del dueño (si no, 400).
  Campos nuevos del form: `tipos_fotos` (JSON `TipoFoto[]`, mismo orden que `fotos`: fachada · almacen · bebidas · limpieza ·
  cajas · leche · aceite · papel_higienico · otra), `no_vende` (JSON, subconjunto de leche/aceite/papel_higienico), `punto_id`.
- **Precios clave** llevan `estado: "relevado" | "ilegible" | "sin_foto" | "no_vende"`. "No vende" no cuenta como faltante ni entra al comparador.
- **Sin fotos o sin clave del modelo** la ficha se arma igual con código (`origen: "demo"`): formato por cajas / categoría anterior,
  NSE solo con el dueño, mix y "ofrecer primero" con argumentos base.
- La IA solo extrae evidencia; NSE (`lib/nse.ts`), mix (`lib/mix.ts`) y recategorización (`lib/ficha.ts`) los decide el código.
  Una segunda llamada corta redacta los argumentos de los 3 productos ya elegidos.
- `FichaComercio` suma `punto_id`, `fotos_analizadas`, `formato.sucursales`, `zona`, `mix`, `recategorizacion`; ítems del mix y de
  ofrecer primero traen `nombre` legible. Se quitaron `pedido_sugerido` y `surtido.falta` (lo que falta es `mix.productos[].estado = "le_falta"`).
- Rutas: `GET /api/puntos`, `GET /api/puntos/:id`, `GET /api/comercios/:id`, `GET /api/precios[?similares_a=<fichaId>]`
  (cada producto trae `criterio: "similares" | "todos"`). `POST /api/chat` sin clave responde con datos de la ficha (`lib/asistente-demo.ts`).
- Datos de ejemplo: `data/puntos-demo.json` (12 puntos) y `data/fichas-demo.json` (5 visitas guardadas como **insumos**, se arman con la misma lógica).
- Pruebas de reglas: `npx tsx scripts/probar-logica.ts`.
