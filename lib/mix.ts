// Mix recomendado por gamas (docs/CONTRATO_V2.md, cambios post-entrevista 2 y 3).
// Porcentajes interpolados linealmente según el puntaje NSE; los productos salen SOLO del catálogo real.

import { CATALOGO, aptoParaFormato, prioridadPara, type ProductoCatalogo } from "./catalogo"
import type { FormatoNegocio, Gama, Mix, ProductoMix } from "./types"

export const GAMAS: Gama[] = ["economica", "media", "premium"]

// SUPUESTO ajustable: % de SKUs por gama en los puntajes −1, 0 y +1.
const ANCLAS: Record<-1 | 0 | 1, Record<Gama, number>> = {
  [-1]: { economica: 80, media: 20, premium: 0 },
  0: { economica: 20, media: 60, premium: 20 },
  1: { economica: 0, media: 30, premium: 70 },
}

// Tamaño del mix por formato (entrevista: kiosco ≈ 5, almacén ≈ 10, autoservicio 15–20).
export const TAMANO_MIX: Record<FormatoNegocio, number> = {
  kiosco: 5,
  almacen: 10,
  autoservicio: 16,
  autoservicio_a4: 16,
  supermercado: 20,
  hipermercado: 20,
  mayorista: 20,
  bar_cafeteria: 8,
  restaurante_hotel: 8,
  oficina_catering: 8,
  vending: 5,
  dietetica: 8,
  estacion_servicio: 5,
  ecommerce: 10,
}

// Reparte `total` en enteros proporcionales a `pesos` (método del mayor resto).
function repartir(total: number, pesos: Record<Gama, number>): Record<Gama, number> {
  const suma = GAMAS.reduce((a, g) => a + pesos[g], 0) || 1
  const exactos = GAMAS.map((g) => (total * pesos[g]) / suma)
  const base = exactos.map(Math.floor)
  let resto = total - base.reduce((a, b) => a + b, 0)
  const orden = exactos.map((x, i) => ({ i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac)
  for (const { i } of orden) {
    if (resto <= 0) break
    base[i]++
    resto--
  }
  return { economica: base[0], media: base[1], premium: base[2] }
}

export function porcentajesPorPuntaje(puntaje: number): Record<Gama, number> {
  const p = Math.max(-1, Math.min(1, puntaje))
  const [desde, hasta, t] = p < 0 ? [ANCLAS[-1], ANCLAS[0], p + 1] : [ANCLAS[0], ANCLAS[1], p]
  const crudos = Object.fromEntries(GAMAS.map((g) => [g, desde[g] + (hasta[g] - desde[g]) * t])) as Record<Gama, number>
  return repartir(100, crudos)
}

function gramos(material: string): number {
  const m = material.match(/(\d+)\s?(KG|G|CC)\b/)
  if (!m) return 0
  return Number(m[1]) * (m[2] === "KG" ? 1000 : 1)
}

// Elige `cantidad` productos alternando sublíneas (de mayor a menor rotación) para que el mix no sean 10 especias.
function elegirVariado(candidatos: ProductoCatalogo[], cantidad: number, formato: FormatoNegocio, chicos: boolean) {
  const grupos = new Map<string, ProductoCatalogo[]>()
  for (const p of candidatos) grupos.set(p.sublinea, [...(grupos.get(p.sublinea) ?? []), p])
  const ordenados = [...grupos.values()]
    .map((g) => (chicos ? [...g].sort((a, b) => gramos(a.material) - gramos(b.material)) : g))
    .sort((a, b) => prioridadPara(b[0], formato) - prioridadPara(a[0], formato))
  const elegidos: ProductoCatalogo[] = []
  for (let ronda = 0; elegidos.length < cantidad; ronda++) {
    let agrego = false
    for (const g of ordenados) {
      if (g[ronda] && elegidos.length < cantidad) {
        elegidos.push(g[ronda])
        agrego = true
      }
    }
    if (!agrego) break
  }
  return elegidos
}

export function calcularMix(opciones: {
  puntaje: number | null
  formato: FormatoNegocio
  tiene: string[] // materiales La Virginia que ya están en góndola
  variedad: "baja" | "media" | "alta" | null
}): Mix {
  const puntaje = opciones.puntaje ?? 0
  const porcentajes = porcentajesPorPuntaje(puntaje)
  // "Si el surtido es bajo, se empieza por pocas presentaciones, las de más rotación." SUPUESTO: 70 % del tamaño.
  const chicos = opciones.variedad === "baja"
  const total = Math.max(3, Math.round(TAMANO_MIX[opciones.formato] * (chicos ? 0.7 : 1)))

  const aptos = CATALOGO.filter((p) => aptoParaFormato(p, opciones.formato))
  const porGama = Object.fromEntries(GAMAS.map((g) => [g, aptos.filter((p) => p.gama === g)])) as Record<Gama, ProductoCatalogo[]>

  // Si una gama no tiene suficientes productos aptos, el sobrante pasa a la gama vecina (media primero).
  const cupos = repartir(total, porcentajes)
  for (const g of GAMAS) {
    const sobra = cupos[g] - porGama[g].length
    if (sobra > 0) {
      cupos[g] -= sobra
      const vecinas: Gama[] = g === "media" ? (puntaje < 0 ? ["economica", "premium"] : ["premium", "economica"]) : ["media", g === "economica" ? "premium" : "economica"]
      let pendiente = sobra
      for (const v of vecinas) {
        const lugar = porGama[v].length - cupos[v]
        const pasa = Math.min(lugar, pendiente)
        cupos[v] += pasa
        pendiente -= pasa
      }
    }
  }

  const tiene = new Set(opciones.tiene)
  const productos: ProductoMix[] = []
  for (const g of GAMAS) {
    // Lo que ya tiene en góndola se mantiene (hasta la mitad del cupo); el resto son faltantes de alta rotación.
    const yaTiene = porGama[g].filter((p) => tiene.has(p.material)).slice(0, Math.ceil(cupos[g] / 2))
    const faltan = elegirVariado(
      porGama[g].filter((p) => !tiene.has(p.material)),
      cupos[g] - yaTiene.length,
      opciones.formato,
      chicos,
    )
    for (const p of [...yaTiene, ...faltan])
      productos.push({
        material: p.material,
        nombre: p.nombre,
        rubro: p.rubro,
        linea: p.linea,
        gama: g,
        estado: tiene.has(p.material) ? "ya_tiene" : "le_falta",
      })
  }

  return {
    puntaje_usado: Math.round(puntaje * 100) / 100,
    porcentajes,
    total_productos: productos.length,
    productos,
  }
}

// Los 3 faltantes para abrir la conversación: uno por línea, de la gama con más peso primero.
export function elegirOfrecerPrimero(mix: Mix, formato: FormatoNegocio): ProductoMix[] {
  const pesoGama = (g: Gama) => mix.porcentajes[g]
  const candidatos = mix.productos
    .filter((p) => p.estado === "le_falta")
    .map((p) => ({ p, prio: prioridadPara(CATALOGO.find((c) => c.material === p.material)!, formato) }))
    .sort((a, b) => pesoGama(b.p.gama) - pesoGama(a.p.gama) || b.prio - a.prio)
  const elegidos: ProductoMix[] = []
  const lineas = new Set<string>()
  for (const { p } of candidatos) {
    if (elegidos.length === 3) break
    if (lineas.has(p.linea)) continue
    lineas.add(p.linea)
    elegidos.push(p)
  }
  for (const { p } of candidatos) if (elegidos.length < 3 && !elegidos.includes(p)) elegidos.push(p)
  return elegidos
}
