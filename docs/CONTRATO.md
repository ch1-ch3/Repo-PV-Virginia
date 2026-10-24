# Contrato interfaz ↔ API

## POST /api/analizar
Request: `multipart/form-data`
- `fotos`: 1–6 imágenes (jpg/png)
- `nombre` (opcional), `lat`, `lng` (opcionales), `nota` (opcional, texto libre del vendedor)

Response 200: `FichaComercio`

```ts
type FichaComercio = {
  id: string
  creado: string                       // ISO
  nombre: string | null
  ubicacion: { lat: number; lng: number } | null
  formato: {
    tipo: "almacen" | "autoservicio" | "kiosco" | "despensa" | "cafeteria" | "supermercado" | "otro"
    tamano: "chico" | "mediano" | "grande"
    cajas_estimadas: number | null
    metros_gondola_estimados: number | null
    justificacion: string
  }
  nse: {
    nivel: "bajo" | "medio-bajo" | "medio" | "medio-alto" | "alto"
    senales: string[]                  // evidencias vistas en las fotos
    confianza: number                  // 0..1
  }
  gondola: {
    estado: "buena" | "regular" | "mala"
    observaciones: string[]            // orden, faltantes, limpieza, exhibición
  }
  surtido: {
    tiene: { producto: string; observacion?: string }[]       // productos La Virginia ya presentes
    falta: { producto: string; motivo: string }[]             // del catálogo que corresponden y no están
  }
  ofrecer_primero: { producto: string; argumento: string }[]  // máx. 3
  pedido_sugerido: { producto: string; cantidad: number; unidad: string }[]
  competencia: { marca: string; categoria: string; observacion: string }[]   // frentes, promos
  precios_clave: { producto: "papel_higienico" | "aceite" | "leche" | "cafe" | "yerba" | "otro"; descripcion: string; precio: number | null }[]
  resumen: string                      // 2–3 líneas para leer en 10 segundos
}
```

## POST /api/chat
Request JSON: `{ ficha: FichaComercio, mensajes: { rol: "vendedor" | "asistente"; texto: string }[] }`
(también acepta `fichaId` en lugar de `ficha`)
Response JSON: `{ texto: string }` (sin streaming, para simplificar).

## Errores
Todas las rutas devuelven `{ error: string }` con status 4xx/5xx. La interfaz muestra el mensaje.

## Fotos
Comprimir en el navegador antes de subir (máx. ~1600 px de lado, JPEG calidad 0.8). Límite: 6 fotos, 4 MB c/u.

## GET /api/comercios
Response: `FichaComercio[]` (resumen para la lista y el comparador de precios).

## Mientras la API no exista
La interfaz usa `data/mock-ficha.json` con este mismo formato.
