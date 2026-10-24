// Nivel socioeconómico según la Guía del punto de venta (data/guia-pdv.txt).
// El modelo solo extrae evidencia de las fotos; el nivel lo decide este código.

import type { CriterioFoto, CriterioNSE, NivelNSE, PreguntaDueno, RespuestasDueno, ResultadoNSE, ValorNSE } from "./types"

export const UMBRAL = 0.3
export const MINIMO_RESPUESTAS = 4
const DIFERENCIA_CONFLICTO = 0.6

export const CRITERIOS_FOTO: { id: CriterioFoto; etiqueta: string; bajo: string; medio: string; alto: string }[] = [
  { id: "gaseosas_cerveza", etiqueta: "Gaseosas y cerveza", bajo: "Solo segundas marcas", medio: "Primeras y segundas", alto: "Primeras, importadas, artesanales" },
  { id: "vinos", etiqueta: "Vinos", bajo: "Tetra, damajuana", medio: "Botellas de gama media", alto: "Gama alta, espumantes, importados" },
  { id: "papel_limpieza", etiqueta: "Papel higiénico y limpieza", bajo: "Hoja simple, lavandina suelta", medio: "De los dos tipos", alto: "Doble/triple hoja, limpiadores de marca" },
  { id: "premium_saludable", etiqueta: "Premium y saludable", bajo: "Nada", medio: "Una o dos cosas", alto: "Oliva extra virgen, sin TACC, orgánico" },
  { id: "marcas_basicos", etiqueta: "Galletitas, yerba, fideos y aceite", bajo: "Mayoría segundas marcas", medio: "Mezcla", alto: "Mayoría primeras marcas" },
  { id: "forma_venta", etiqueta: "Cómo se vende", bajo: "Fraccionado y suelto", medio: "Nada de eso", alto: "Multipacks y familiares" },
  { id: "surtido", etiqueta: "Cuánto surtido tiene", bajo: "Pocos productos, huecos", medio: "Varias marcas", alto: "Muchas marcas, góndolas llenas" },
  { id: "orden_carteles", etiqueta: "Orden y carteles", bajo: "En caja, precios a mano", medio: "Ordenada, precios impresos", alto: "Exhibidores, góndola de ofertas" },
]

// Preguntas al dueño, con las tres respuestas en orden −1 / 0 / +1.
export const PREGUNTAS_DUENO: { id: PreguntaDueno; pregunta: string; opciones: [string, string, string] }[] = [
  { id: "cajas", pregunta: "¿Cuántas cajas tenés?", opciones: ["Una", "Dos", "Tres o más"] },
  { id: "repositor", pregunta: "¿Quién te repone la mercadería?", opciones: ["El dueño", "Un empleado", "Repositores"] },
  { id: "empleados", pregunta: "¿Cuántos trabajan acá?", opciones: ["Dueño o familia", "2 a 4", "5 o más"] },
  { id: "delivery", pregunta: "¿Hacés delivery o vendés por apps?", opciones: ["No", "Propio", "Apps / online"] },
  { id: "pedidos_faltantes", pregunta: "¿Qué te pide la gente que no tenés?", opciones: ["Más barato", "De todo", "Premium"] },
  { id: "ticket", pregunta: "¿Cuánto se lleva cada cliente?", opciones: ["Poco", "Compra del día", "Compra grande"] },
  { id: "otros_locales", pregunta: "¿Tenés otros locales?", opciones: ["No", "1 más", "2 o más"] },
]

export type EvidenciaFoto = { id: CriterioFoto; valor: ValorNSE; evidencia: string }

function valorValido(v: unknown): ValorNSE {
  return v === -1 || v === 0 || v === 1 ? v : null
}

function promedio(valores: number[]): number | null {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null
}

export function nivelDePuntaje(puntaje: number | null): NivelNSE {
  if (puntaje === null) return "medio"
  if (puntaje >= UMBRAL) return "alto"
  if (puntaje <= -UMBRAL) return "bajo"
  return "medio"
}

export function formatearPuntaje(p: number): string {
  const r = Math.round(p * 100) / 100
  return `${r > 0 ? "+" : r < 0 ? "−" : ""}${Math.abs(r).toLocaleString("es-AR", { maximumFractionDigits: 2 })}`
}

export function calcularNSE(fotos: EvidenciaFoto[], dueno: RespuestasDueno): ResultadoNSE {
  const criterios: CriterioNSE[] = []

  for (const c of CRITERIOS_FOTO) {
    const e = fotos.find((f) => f.id === c.id)
    criterios.push({
      id: c.id,
      etiqueta: c.etiqueta,
      fuente: "foto",
      valor: valorValido(e?.valor),
      evidencia: e?.evidencia?.trim() || "No se vio en las fotos",
    })
  }
  for (const p of PREGUNTAS_DUENO) {
    const v = valorValido(dueno[p.id])
    criterios.push({
      id: p.id,
      etiqueta: p.pregunta,
      fuente: "dueno",
      valor: v,
      evidencia: v === null ? "Sin respuesta" : p.opciones[v + 1],
    })
  }

  const respondidos = criterios.filter((c) => c.valor !== null)
  const puntaje = promedio(respondidos.map((c) => c.valor as number))
  const deFoto = promedio(respondidos.filter((c) => c.fuente === "foto").map((c) => c.valor as number))
  const deDueno = promedio(respondidos.filter((c) => c.fuente === "dueno").map((c) => c.valor as number))

  const pocas = respondidos.length < MINIMO_RESPUESTAS
  // "Si la foto y el dueño dicen cosas distintas, también se queda en medio."
  const conflicto =
    deFoto !== null && deDueno !== null && deFoto * deDueno < 0 && Math.abs(deFoto - deDueno) >= DIFERENCIA_CONFLICTO

  const nivel: NivelNSE = pocas || conflicto ? "medio" : nivelDePuntaje(puntaje)

  let explicacion: string
  if (puntaje === null) explicacion = "Sin respuestas: queda en medio hasta tener al menos 4 datos."
  else if (pocas)
    explicacion = `Solo ${respondidos.length} de ${MINIMO_RESPUESTAS} datos mínimos (promedio ${formatearPuntaje(puntaje)}): queda en medio.`
  else if (conflicto)
    explicacion = `Las fotos (${formatearPuntaje(deFoto!)}) y el dueño (${formatearPuntaje(deDueno!)}) no coinciden: queda en medio.`
  else
    explicacion = `Promedio ${formatearPuntaje(puntaje)} en ${respondidos.length} criterios (umbral ±${UMBRAL.toLocaleString("es-AR")}): ${nivel}.`

  return {
    nivel,
    puntaje: puntaje === null ? null : Math.round(puntaje * 100) / 100,
    respondidas: respondidos.length,
    criterios,
    pedir_otra_foto: pocas,
    conflicto_foto_dueno: conflicto,
    explicacion,
  }
}
