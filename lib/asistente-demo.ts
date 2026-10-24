// Respuestas del asistente cuando no hay clave del modelo: se arman con los datos de la ficha
// (mix, ofrecer primero, criterios NSE, competencia, precios). No inventan nada que no esté en la ficha.

import { ETIQUETA_ESTADO_PRECIO, ETIQUETA_FORMATO, ETIQUETA_GAMA, ETIQUETA_NSE, ETIQUETA_PRODUCTO_CLAVE, nombreLinea } from "./etiquetas"
import { formatearPuntaje } from "./nse"
import type { FichaComercio, Gama } from "./types"

const GAMAS: Gama[] = ["economica", "media", "premium"]

function sinTildes(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function lider(f: FichaComercio): Gama {
  return [...GAMAS].sort((a, b) => f.mix.porcentajes[b] - f.mix.porcentajes[a])[0]
}

function faltantes(f: FichaComercio, gama?: Gama) {
  return f.mix.productos.filter((p) => p.estado === "le_falta" && (!gama || p.gama === gama))
}

function arranque(f: FichaComercio): string {
  if (!f.ofrecer_primero.length) return "Ya tiene todo el mix sugerido en góndola: aprovechá la visita para mejorar la exhibición y reponer."
  const lineas = f.ofrecer_primero.map((o, i) => `${i + 1}. ${o.nombre} (${ETIQUETA_GAMA[o.gama].toLowerCase()}): “${o.argumento}”`)
  return [`Arrancá por estos ${f.ofrecer_primero.length}, en este orden:`, ...lineas, `Si acepta el primero, sumá el segundo en la misma compra.`].join("\n")
}

function nivel(f: FichaComercio): string {
  const n = f.nse
  const fuertes = n.criterios.filter((c) => c.valor !== null && c.valor !== 0).slice(0, 3)
  const partes = [
    `Quedó en NSE ${ETIQUETA_NSE[n.nivel].toLowerCase()}${n.puntaje !== null ? ` con puntaje ${formatearPuntaje(n.puntaje)}` : ""}. ${n.explicacion}`,
  ]
  if (fuertes.length)
    partes.push(`Lo que más pesó: ${fuertes.map((c) => `${c.etiqueta.replace(/^¿|\?$/g, "").toLowerCase()} → ${c.evidencia} (${c.valor! > 0 ? "+1" : "−1"})`).join("; ")}.`)
  if (n.pedir_otra_foto) partes.push("Hay pocos datos: con una foto más de góndola el nivel se afina.")
  if (n.conflicto_foto_dueno) partes.push("Ojo: lo que se ve en góndola no coincide con lo que dijo el dueño, por eso queda en medio.")
  return partes.join("\n")
}

function sinLugar(f: FichaComercio): string {
  const chicos = faltantes(f, lider(f)).slice(0, 2)
  return [
    "Proponele empezar chico, sin pedirle góndola nueva:",
    chicos.length
      ? `• Solo ${chicos.map((p) => p.nombre).join(" y ")}, que son de alta rotación en la gama que más vende su público (${ETIQUETA_GAMA[lider(f)].toLowerCase()}).`
      : "• Reponer y ordenar lo que ya tiene de La Virginia.",
    "• Que ocupen el lugar de algo que hoy rota poco, a la altura de la vista.",
    "• Volvés en la próxima visita y, si giró, ampliás.",
  ].join("\n")
}

function competencia(f: FichaComercio): string {
  if (!f.competencia.length) return "En las fotos no se vio competencia directa en café, té o mate cocido. Es una buena oportunidad para entrar con " + (f.ofrecer_primero[0]?.nombre ?? "el mix sugerido") + "."
  const contra = f.competencia.map((c) => {
    const alternativa = f.mix.productos.find((p) => p.estado === "le_falta" && sinTildes(c.categoria).includes(sinTildes(nombreLinea(p.linea)).split(" ")[0]))
    return `• ${c.marca} (${c.categoria}): ${c.observacion}.${alternativa ? ` Para competirle: ${alternativa.nombre}.` : ""}`
  })
  return ["Esto es lo que se vio de la competencia:", ...contra].join("\n")
}

function precios(f: FichaComercio): string {
  const lineas = f.precios_clave.map(
    (p) => `• ${ETIQUETA_PRODUCTO_CLAVE[p.producto]}: ${p.precio !== null ? `$${p.precio.toLocaleString("es-AR")}${p.descripcion ? ` (${p.descripcion})` : ""}` : ETIQUETA_ESTADO_PRECIO[p.estado].toLowerCase()}`,
  )
  const econ = faltantes(f, "economica")[0]
  return [
    "Precios relevados en esta visita:",
    ...lineas,
    econ && f.nse.nivel !== "alto" ? `Si el dueño dice que La Virginia es cara, ofrecé ${econ.nombre}: es la opción económica del mix.` : "En la pestaña Categoría ves cómo se ubica cada precio frente a comercios similares.",
  ].join("\n")
}

function mix(f: FichaComercio): string {
  const porGama = GAMAS.filter((g) => f.mix.porcentajes[g] > 0).map((g) => {
    const prods = f.mix.productos.filter((p) => p.gama === g)
    return `• ${ETIQUETA_GAMA[g]} ${f.mix.porcentajes[g]} % (${prods.length}): ${prods.slice(0, 3).map((p) => p.nombre).join(", ")}${prods.length > 3 ? "…" : ""}`
  })
  return [
    `El mix tiene ${f.mix.total_productos} productos para ${ETIQUETA_FORMATO[f.formato.formato].toLowerCase()}, calculado con puntaje ${formatearPuntaje(f.mix.puntaje_usado)}:`,
    ...porGama,
    `Ya tiene ${f.mix.productos.filter((p) => p.estado === "ya_tiene").length} y le faltan ${faltantes(f).length}.`,
  ].join("\n")
}

function tieneFalta(f: FichaComercio): string {
  const tiene = f.mix.productos.filter((p) => p.estado === "ya_tiene")
  const falta = faltantes(f)
  return [
    tiene.length ? `Ya tiene: ${tiene.map((p) => p.nombre).join(", ")}.` : "No se vio ningún producto La Virginia del mix en góndola.",
    falta.length ? `Le faltan ${falta.length}. Los más importantes: ${falta.slice(0, 4).map((p) => p.nombre).join(", ")}.` : "No le falta nada del mix sugerido.",
  ].join("\n")
}

function general(f: FichaComercio): string {
  return [
    f.resumen,
    f.ofrecer_primero[0] ? `Para abrir la charla: “${f.ofrecer_primero[0].argumento}”` : "",
    "Podés preguntarme con qué arrancar, por qué quedó en este nivel, qué decir si no tiene lugar, la competencia, los precios o el mix.",
  ]
    .filter(Boolean)
    .join("\n")
}

const INTENCIONES: [RegExp, (f: FichaComercio) => string][] = [
  [/lugar|espacio|no entra|no tengo sitio|gondola llena/, sinLugar],
  [/competencia|competidor|otra marca|cabrales|nescafe|taragui/, competencia],
  [/nivel|nse|socioeco|por que (quedo|es)|puntaje|bajo|alto/, nivel],
  [/precio|caro|barato|cuesta|mediana/, precios],
  [/arranc|empiez|primero|ofrec|que le vendo|recomend/, arranque],
  [/falta|tiene|ya vende/, tieneFalta],
  [/mix|gama|premium|economic|surtido|productos/, mix],
]

export function responderSinModelo(ficha: FichaComercio, pregunta: string): string {
  const t = sinTildes(pregunta)
  const r = INTENCIONES.find(([re]) => re.test(t))
  return (r ? r[1] : general)(ficha)
}
