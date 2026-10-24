// Arma la FichaComercio con lo que haya: evidencia del modelo (si hubo fotos y clave), respuestas del dueño
// e historial del punto de venta. Todo lo que decide la categoría y el mix es código, no modelo.

import { buscarMaterial } from "./catalogo"
import { ETIQUETA_FORMATO, ETIQUETA_GAMA, ETIQUETA_NSE, FOTOS_VISITA, PRODUCTOS_CON_PRECIO, TIPO_DE_FORMATO } from "./etiquetas"
import { calcularMix, elegirOfrecerPrimero } from "./mix"
import { calcularNSE, formatearPuntaje, type EvidenciaFoto } from "./nse"
import type {
  FichaComercio,
  FormatoNegocio,
  Gama,
  PrecioClave,
  ProductoClave,
  PuntoDeVenta,
  RespuestasDueno,
  TipoFoto,
  Zona,
} from "./types"

// Lo que el modelo extrae de las fotos (ver FORMATO_EXTRACCION en lib/prompt.ts). Todo puede faltar.
export type Extraccion = {
  formato?: { formato?: string | null; cajas?: number | null; gondolas?: number | null; justificacion?: string } | null
  criterios_foto?: { id: string; valor: number | null; evidencia?: string }[]
  gondola?: { estado?: string | null; variedad?: string | null; observaciones?: string[] } | null
  tiene?: { material: string; observacion?: string }[]
  competencia?: { marca: string; categoria: string; observacion: string }[]
  precios_clave?: { producto: string; descripcion?: string; precio: number | null }[]
  zona?: { sugerida?: string | null; evidencia?: string } | null
  checklist_fotos_faltantes?: string[]
}

export type EntradaFicha = {
  id: string
  creado: string
  nombre: string | null
  punto: PuntoDeVenta | null
  ubicacion: { lat: number; lng: number } | null
  tipos_fotos: TipoFoto[]
  no_vende: ProductoClave[]
  respuestas: RespuestasDueno
  zona_confirmada: Zona | null
  extraccion: Extraccion | null // null = no se llamó al modelo
  origen: "ia" | "demo"
}

const FORMATOS = Object.keys(ETIQUETA_FORMATO) as FormatoNegocio[]
const ZONAS: Zona[] = ["vulnerable", "media", "acomodada"]
const PRODUCTOS: ProductoClave[] = ["papel_higienico", "aceite", "leche", "yerba", "cafe", "azucar", "otro"]

function enLista<T extends string>(valor: unknown, lista: readonly T[]): T | null {
  return typeof valor === "string" && (lista as readonly string[]).includes(valor) ? (valor as T) : null
}

function numeroOnull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : null
}

function decidirFormato(e: EntradaFicha): { formato: FormatoNegocio; justificacion: string } {
  const cajas = e.respuestas.cajas
  const visto = enLista(e.extraccion?.formato?.formato, FORMATOS)
  let formato: FormatoNegocio
  let justificacion: string
  if (visto) {
    formato = visto
    justificacion = e.extraccion?.formato?.justificacion?.trim() || "Según las fotos."
  } else if (e.punto?.categoria_actual) {
    formato = e.punto.categoria_actual.formato as FormatoNegocio
    justificacion = "Sin fotos del salón: se mantiene el formato de la categoría anterior."
  } else if (cajas === 1) {
    formato = "supermercado"
    justificacion = "Sin fotos del salón: el dueño dice que tiene tres cajas o más."
  } else if (cajas === 0) {
    formato = "autoservicio"
    justificacion = "Sin fotos del salón: el dueño dice que tiene dos cajas."
  } else {
    formato = "almacen"
    justificacion = "Sin fotos del salón: se toma almacén por defecto. Sacá una foto del salón para confirmarlo."
  }
  // Guía: "un almacén con tres góndolas y dos cajas ya es un autoservicio".
  if ((formato === "almacen" || formato === "kiosco") && (cajas === 0 || cajas === 1)) {
    formato = "autoservicio"
    justificacion += " Con dos cajas o más pasa a autoservicio (regla de la guía)."
  }
  return { formato, justificacion }
}

function armarPrecios(e: EntradaFicha): PrecioClave[] {
  const extraidos = (e.extraccion?.precios_clave ?? []).filter((p) => enLista(p.producto, PRODUCTOS))
  const valido = (n: unknown) => (typeof n === "number" && n > 0 && n < 10_000_000 ? Math.round(n) : null)
  const salida: PrecioClave[] = []

  for (const producto of PRODUCTOS_CON_PRECIO) {
    const visto = extraidos.find((p) => p.producto === producto)
    const precio = valido(visto?.precio)
    if (e.no_vende.includes(producto)) salida.push({ producto, descripcion: "No lo vende", precio: null, estado: "no_vende" })
    else if (precio !== null) salida.push({ producto, descripcion: visto?.descripcion?.trim() || "", precio, estado: "relevado" })
    else {
      const huboFoto = e.tipos_fotos.includes(producto as TipoFoto)
      salida.push({
        producto,
        descripcion: visto?.descripcion?.trim() || "",
        precio: null,
        estado: huboFoto || visto ? "ilegible" : "sin_foto",
      })
    }
  }
  // Otros precios que se hayan leído de paso (yerba, café, azúcar): solo si el número es legible.
  for (const p of extraidos) {
    const producto = p.producto as ProductoClave
    if (PRODUCTOS_CON_PRECIO.includes(producto)) continue
    const precio = valido(p.precio)
    if (precio !== null) salida.push({ producto, descripcion: p.descripcion?.trim() || "", precio, estado: "relevado" })
  }
  return salida
}

// Argumento de base (sin IA): qué tiene de bueno la línea + por qué esa gama le sirve a este público.
const POR_LINEA: [RegExp, (n: string) => string][] = [
  [/^CAFÉ|FUERA DEL/, (n) => `El café sale todos los días: ${n} te asegura rotación sin ocupar más góndola.`],
  [/^TES|HERBORISTERIA/, (n) => `Las infusiones van en la compra del día y ocupan poco lugar: ${n} te suma variedad.`],
  [/^YERBA/, (n) => `El mate cocido en saquitos se vende todo el año, sobre todo a la mañana: ${n} es venta segura.`],
  [/^ESPECIAS|REPOSTERIA/, (n) => `Los sobres son compra de impulso y casi no ocupan lugar: ${n} te deja margen.`],
  [/^PREPARADOS/, (n) => `Caldos y sopas acompañan la compra de todos los días, más en invierno: sumá ${n}.`],
]
const POR_GAMA: Record<Gama, string> = {
  economica: "Tiene el precio que busca tu cliente.",
  media: "Es el clásico que la gente ya conoce.",
  premium: "Te sube el ticket con los clientes que pagan por calidad.",
}

export function argumentoBase(p: { nombre: string; linea: string; gama: Gama }): string {
  const frase = POR_LINEA.find(([re]) => re.test(p.linea))?.[1](p.nombre) ?? `${p.nombre} completa tu góndola con algo que hoy tu cliente busca en otro lado.`
  return `${frase} ${POR_GAMA[p.gama]}`
}

export function armarFicha(e: EntradaFicha): FichaComercio {
  const x = e.extraccion
  const { formato, justificacion } = decidirFormato(e)

  const evidencias: EvidenciaFoto[] = (x?.criterios_foto ?? []).map((c) => ({
    id: c.id as EvidenciaFoto["id"],
    valor: c.valor === -1 || c.valor === 0 || c.valor === 1 ? c.valor : null,
    evidencia: c.evidencia ?? "",
  }))
  const nse = calcularNSE(evidencias, e.respuestas)

  const tiene = (x?.tiene ?? [])
    .map((t) => ({ prod: buscarMaterial(t.material), observacion: t.observacion }))
    .filter((t): t is { prod: NonNullable<typeof t.prod>; observacion: string | undefined } => t.prod !== null)
    .filter((t, i, arr) => arr.findIndex((o) => o.prod.material === t.prod.material) === i)
    .map((t) => ({ material: t.prod.material, nombre: t.prod.nombre, rubro: t.prod.rubro, ...(t.observacion ? { observacion: t.observacion } : {}) }))

  const surtidoCriterio = nse.criterios.find((c) => c.id === "surtido")?.valor
  const variedad =
    enLista(x?.gondola?.variedad, ["baja", "media", "alta"] as const) ??
    (surtidoCriterio === -1 ? "baja" : surtidoCriterio === 0 ? "media" : surtidoCriterio === 1 ? "alta" : null)

  const mix = calcularMix({ puntaje: nse.puntaje, formato, tiene: tiene.map((t) => t.material), variedad })
  const ofrecer_primero = elegirOfrecerPrimero(mix, formato).map((p) => ({
    material: p.material,
    nombre: p.nombre,
    rubro: p.rubro,
    gama: p.gama,
    argumento: argumentoBase(p),
  }))

  const sugeridaIA = enLista(x?.zona?.sugerida, ZONAS)
  // Sin foto de fachada la zona se estima por el puntaje y se marca como estimación.
  const sugerida: Zona | null =
    sugeridaIA ?? (nse.puntaje === null ? null : nse.nivel === "bajo" ? "vulnerable" : nse.nivel === "alto" ? "acomodada" : "media")
  const zona = {
    sugerida,
    confirmada: e.zona_confirmada,
    evidencia: sugeridaIA ? x?.zona?.evidencia?.trim() || "Según la foto de fachada." : sugerida ? "Estimada por el puntaje NSE (no hubo foto de fachada legible)." : "Sin datos para sugerir.",
  }

  // Qué foto sacar la próxima vez: las sugeridas que faltaron, más lo que pida el modelo.
  const faltantes = FOTOS_VISITA.filter(
    (f) => !e.tipos_fotos.includes(f.tipo) && (f.sugerida || (f.producto && !e.no_vende.includes(f.producto))),
  ).map((f) => f.titulo)
  if (nse.pedir_otra_foto) faltantes.unshift("Una góndola más (bebidas o almacén) para sumar señales de NSE")
  const checklist = [...new Set([...faltantes, ...(x?.checklist_fotos_faltantes ?? []).filter((s) => typeof s === "string")])].slice(0, 6)

  const otros = e.respuestas.otros_locales
  const ahora = { formato, nse: nse.nivel, puntaje: nse.puntaje }
  const antes = e.punto?.categoria_actual ?? null
  const recategorizacion = e.punto
    ? {
        antes: antes ? { formato: antes.formato, nse: antes.nse, puntaje: antes.puntaje } : null,
        ahora,
        cambio: !!antes && (antes.formato !== formato || antes.nse !== nse.nivel),
        motivo: !antes
          ? "Primera caracterización del comercio."
          : antes.formato !== formato || antes.nse !== nse.nivel
            ? `Pasa de ${ETIQUETA_FORMATO[antes.formato]} · NSE ${ETIQUETA_NSE[antes.nse].toLowerCase()} a ${ETIQUETA_FORMATO[formato]} · NSE ${ETIQUETA_NSE[nse.nivel].toLowerCase()}. ${nse.explicacion}`
            : "Se mantiene la categoría anterior.",
      }
    : null

  const ficha: FichaComercio = {
    id: e.id,
    creado: e.creado,
    nombre: e.nombre ?? e.punto?.nombre ?? null,
    punto_id: e.punto?.id ?? null,
    ubicacion: e.ubicacion ?? (e.punto ? { lat: e.punto.lat, lng: e.punto.lng } : null),
    fotos_analizadas: e.tipos_fotos.length,
    formato: {
      tipo: TIPO_DE_FORMATO[formato],
      formato,
      cajas_estimadas: numeroOnull(x?.formato?.cajas) ?? (e.respuestas.cajas == null ? null : e.respuestas.cajas + 2),
      gondolas_estimadas: numeroOnull(x?.formato?.gondolas),
      sucursales: otros == null ? null : otros + 1,
      justificacion,
    },
    zona,
    nse,
    gondola: {
      estado: enLista(x?.gondola?.estado, ["buena", "regular", "mala"] as const),
      variedad,
      observaciones: (x?.gondola?.observaciones ?? []).filter((o) => typeof o === "string").slice(0, 4),
    },
    surtido: { tiene },
    mix,
    ofrecer_primero,
    competencia: (x?.competencia ?? []).filter((c) => c && typeof c.marca === "string").slice(0, 5),
    precios_clave: armarPrecios(e),
    checklist_fotos_faltantes: checklist,
    recategorizacion,
    resumen: "",
    origen: e.origen,
  }
  ficha.resumen = resumenBase(ficha)
  return ficha
}

export function resumenBase(f: FichaComercio): string {
  const puntaje = f.nse.puntaje === null ? "sin puntaje" : `puntaje ${formatearPuntaje(f.nse.puntaje)}`
  const arranque = f.ofrecer_primero.slice(0, 2).map((p) => p.nombre)
  const partes = [
    `${ETIQUETA_FORMATO[f.formato.formato]} de público ${ETIQUETA_NSE[f.nse.nivel].toLowerCase()} (${puntaje}).`,
    arranque.length ? `Arrancá por ${arranque.join(" y ")}.` : "Ya tiene todo el mix sugerido: reforzá exhibición.",
  ]
  const lider = (Object.keys(f.mix.porcentajes) as Gama[]).sort((a, b) => f.mix.porcentajes[b] - f.mix.porcentajes[a])[0]
  partes.push(`Mix con foco en gama ${ETIQUETA_GAMA[lider].toLowerCase()} (${f.mix.porcentajes[lider]} %).`)
  if (f.nse.pedir_otra_foto) partes.push("Faltan datos: respondé más preguntas o sacá otra foto.")
  return partes.join(" ")
}

