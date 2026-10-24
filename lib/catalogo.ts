// PROVISORIO: reemplazar por el catálogo real de 15 productos y la guía de formatos que entrega La Virginia.
// Los productos de abajo salen de los ejemplos del enunciado del desafío.

export type ProductoCatalogo = {
  nombre: string
  categoria: "cafe" | "te" | "mate_cocido" | "otro"
  formatos_objetivo: string[] // tipos de comercio a los que apunta
  nota?: string
}

export const CATALOGO: ProductoCatalogo[] = [
  { nombre: "Café molido 500 g", categoria: "cafe", formatos_objetivo: ["autoservicio", "supermercado", "despensa"] },
  { nombre: "Café molido 250 g", categoria: "cafe", formatos_objetivo: ["almacen", "autoservicio", "despensa", "kiosco"], nota: "Rota más en público medio y medio-bajo" },
  { nombre: "Café instantáneo 100 g", categoria: "cafe", formatos_objetivo: ["almacen", "autoservicio", "kiosco"] },
  { nombre: "Mate cocido x 50", categoria: "mate_cocido", formatos_objetivo: ["almacen", "autoservicio", "despensa"] },
  { nombre: "Té en saquitos x 25", categoria: "te", formatos_objetivo: ["almacen", "autoservicio", "kiosco", "cafeteria"] },
]

// Guía de formatos y surtido mínimo (PROVISORIO, reemplazar por la guía real).
export const GUIA_FORMATOS = `
- Kiosco: 1 caja, < 15 m2, sin góndolas centrales. Surtido mínimo: café instantáneo, té x25.
- Almacén / despensa: 1 caja, 20-50 m2, mostrador o 1-2 góndolas. Surtido mínimo: café molido 250 g, mate cocido x50, té x25.
- Autoservicio: 2-4 cajas, 50-200 m2, góndolas centrales. Surtido mínimo: café molido 250 g y 500 g, mate cocido x50, té x25, café instantáneo.
- Supermercado: 5+ cajas. Surtido completo.
- Cafetería: consumo en local. Café en grano / molido gastronómico, té.
`
