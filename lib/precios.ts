// Comparador de precios clave entre comercios.
// "Similares" = mismo tipo de negocio y mismo nivel NSE (SUPUESTO de la entrevista); si hay menos de 2, se usan todos.

import type { ComparadorPrecios, FichaComercio, ProductoClave } from "./types"

function mediana(valores: number[]): number {
  const v = [...valores].sort((a, b) => a - b)
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2)
}

function agrupar(fichas: FichaComercio[]): Map<ProductoClave, ComparadorPrecios[number]["comercios"]> {
  const grupos = new Map<ProductoClave, ComparadorPrecios[number]["comercios"]>()
  const vistos = new Set<string>()
  for (const f of fichas) {
    for (const p of f.precios_clave) {
      if (p.precio === null || p.estado !== "relevado") continue
      // Un precio por comercio y producto: el de la visita más reciente (las fichas vienen ordenadas).
      const clave = `${f.punto_id ?? f.id}|${p.producto}`
      if (vistos.has(clave)) continue
      vistos.add(clave)
      const lista = grupos.get(p.producto) ?? []
      lista.push({ fichaId: f.id, nombre: f.nombre, descripcion: p.descripcion, precio: p.precio, fecha: f.creado })
      grupos.set(p.producto, lista)
    }
  }
  return grupos
}

export function compararPrecios(fichas: FichaComercio[], similaresA?: FichaComercio | null): ComparadorPrecios {
  const todos = agrupar(fichas)
  const similares = similaresA
    ? agrupar(fichas.filter((f) => f.formato.tipo === similaresA.formato.tipo && f.nse.nivel === similaresA.nse.nivel))
    : null

  const salida: ComparadorPrecios = []
  for (const [producto, comerciosTodos] of todos) {
    const comerciosSimilares = similares?.get(producto) ?? []
    const usarSimilares = comerciosSimilares.length >= 2
    const comercios = usarSimilares ? comerciosSimilares : comerciosTodos
    const precios = comercios.map((c) => c.precio)
    salida.push({
      producto,
      comercios,
      minimo: Math.min(...precios),
      mediana: mediana(precios),
      maximo: Math.max(...precios),
      criterio: usarSimilares ? "similares" : "todos",
    })
  }
  const orden: ProductoClave[] = ["leche", "aceite", "papel_higienico", "yerba", "cafe", "azucar", "otro"]
  return salida.sort((a, b) => orden.indexOf(a.producto) - orden.indexOf(b.producto))
}
