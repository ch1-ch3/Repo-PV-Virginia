// Catálogo real La Virginia (100 SKUs, desde Input/Shippear3_Catalogo_Productos.xlsx → data/catalogo.json)
// con la gama de cada SKU, en qué formatos tiene sentido y cuánto rota.

import datos from "../data/catalogo.json"
import type { FormatoNegocio, Gama } from "./types"

export type ProductoCatalogo = {
  material: string
  nombre: string
  linea: string
  sublinea: string
  rubro: string
  gama: Gama
  prioridad: number // 1..10, más alto = más rotación en canal tradicional
}

// Gamas confirmadas en la entrevista (docs/ENTREVISTA.md, punto 6). La regla premium va primero:
// un tostado de origen de La Morenita es premium aunque la marca sea económica.
function gamaDe(p: { material: string; linea: string; sublinea: string }): Gama {
  const m = p.material
  if (
    /\bLVE\b|PURO AROMA|CAPS|COLOM|BRASIL|ITAL/.test(m) ||
    p.sublinea === "TES ESPECIALES" ||
    p.sublinea === "TES SABORIZADOS" ||
    /TUY (STEVIA|SUCRA|SWEET)/.test(m) ||
    /^MIX CAPP LV/.test(m)
  )
    return "premium"
  if (/\b(MO|MOR|MORE|MOREN)\b|M INTENSO|LITORAL/.test(m) || p.linea.startsWith("ESPECIAS") || p.linea === "REPOSTERIA")
    return "economica"
  return "media"
}

// SUPUESTO: rotación relativa por sublínea en almacenes y autoservicios de barrio.
const PRIORIDAD_SUBLINEA: Record<string, number> = {
  TORRADOS: 10,
  "TES COMUNES": 10,
  "YERBA CON SOBREENVOL": 9,
  "YERBA SIN SOBREENVOL": 8,
  "INST. COMUNES": 8,
  CALDOS: 8,
  SAQUITOS: 7,
  "ESPECIAS Y HIERBAS": 7,
  "HERBO CON SOBREENVOL": 6,
  "HERBO SIN SOBREENVOL": 6,
  SOPAS: 6,
  TOSTADOS: 6,
  "INST. MIXES": 5,
  "CONDIM. PARA": 5,
  "EDULC. LÍQ.": 5,
  "CACAO GRANULADO": 5,
  "INST. TOSTADOS": 4,
  "TES SABORIZADOS": 4,
  "TES ESPECIALES": 4,
  TRADICIONAL: 4,
  SALSAS: 4,
  "CAPSULAS NC": 3,
  CEREALES: 3,
  CAPELETTIS: 3,
}

export const CATALOGO: ProductoCatalogo[] = (datos as Omit<ProductoCatalogo, "gama" | "prioridad">[]).map((p) => ({
  ...p,
  gama: gamaDe(p),
  prioridad: PRIORIDAD_SUBLINEA[p.sublinea] ?? 2,
}))

const POR_MATERIAL = new Map(CATALOGO.map((p) => [p.material, p]))

export function buscarMaterial(codigo: string | null | undefined): ProductoCatalogo | null {
  if (!codigo) return null
  return POR_MATERIAL.get(codigo.trim().toUpperCase()) ?? null
}

const GASTRONOMIA: FormatoNegocio[] = ["bar_cafeteria", "restaurante_hotel", "oficina_catering", "vending"]
const CON_HELADERA: FormatoNegocio[] = ["autoservicio", "autoservicio_a4", "supermercado", "hipermercado"]
const KIOSCO_SUBLINEAS = ["INST. COMUNES", "INST. MIXES", "SAQUITOS", "TES COMUNES", "EDULC. LÍQ.", "CACAO GRANULADO", "YERBA CON SOBREENVOL"]

// SUPUESTO (docs/PROMPT_BACKEND.md, Fase 1): afinidad de cada línea con el formato del comercio.
export function aptoParaFormato(p: ProductoCatalogo, formato: FormatoNegocio): boolean {
  const fueraDelHogar = p.linea.startsWith("PRODUCTOS FUERA")
  if (GASTRONOMIA.includes(formato)) {
    // Consumo en el lugar: café para máquina, infusiones, azúcar y edulcorante en sobres.
    return fueraDelHogar || ["TES", "HERBORISTERIA", "EDULCORANTES"].includes(p.linea) || p.sublinea === "SAQUITOS"
  }
  if (fueraDelHogar) return formato === "mayorista"
  if (p.linea === "GIACOMO") return CON_HELADERA.includes(formato) // necesita heladera o exhibidor
  if (p.sublinea === "CAPSULAS NC") return [...CON_HELADERA, "dietetica", "ecommerce"].includes(formato)
  if (formato === "kiosco" || formato === "estacion_servicio") return KIOSCO_SUBLINEAS.includes(p.sublinea)
  if (formato === "dietetica") return ["TES", "HERBORISTERIA", "EDULCORANTES"].includes(p.linea) || p.gama === "premium"
  return true
}

// Prioriza dentro de una gastronomía lo que se usa por taza.
export function prioridadPara(p: ProductoCatalogo, formato: FormatoNegocio): number {
  if (GASTRONOMIA.includes(formato) && p.linea.startsWith("PRODUCTOS FUERA")) return 10
  return p.prioridad
}

// Texto compacto para el prompt: una línea por SKU con el código exacto.
export function catalogoParaPrompt(): string {
  let lineaActual = ""
  const salida: string[] = []
  for (const p of CATALOGO) {
    if (p.linea !== lineaActual) {
      lineaActual = p.linea
      salida.push(`# ${p.linea}`)
    }
    salida.push(`${p.material} = ${p.nombre}`)
  }
  return salida.join("\n")
}
