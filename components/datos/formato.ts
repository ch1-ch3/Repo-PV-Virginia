import type { FichaComercio } from "./tipos"

export const ETIQUETA_TIPO: Record<FichaComercio["formato"]["tipo"], string> = {
  almacen: "Almacén",
  autoservicio: "Autoservicio",
  kiosco: "Kiosco",
  despensa: "Despensa",
  cafeteria: "Cafetería",
  supermercado: "Supermercado",
  otro: "Otro",
}

export const ETIQUETA_TAMANO: Record<FichaComercio["formato"]["tamano"], string> = {
  chico: "Chico",
  mediano: "Mediano",
  grande: "Grande",
}

export const ETIQUETA_NSE: Record<FichaComercio["nse"]["nivel"], string> = {
  bajo: "Bajo",
  "medio-bajo": "Medio-bajo",
  medio: "Medio",
  "medio-alto": "Medio-alto",
  alto: "Alto",
}

export const ETIQUETA_GONDOLA: Record<FichaComercio["gondola"]["estado"], string> = {
  buena: "Buena",
  regular: "Regular",
  mala: "Mala",
}

export const ETIQUETA_PRECIO: Record<FichaComercio["precios_clave"][number]["producto"], string> = {
  papel_higienico: "Papel higiénico",
  aceite: "Aceite",
  leche: "Leche",
  cafe: "Café",
  yerba: "Yerba",
  otro: "Otro",
}

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatearPrecio(precio: number | null) {
  return precio === null ? null : formatoMoneda.format(precio)
}

const formatoFecha = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short" })
const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatearFecha(iso: string, conHora = false) {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ""
  return (conHora ? formatoFechaHora : formatoFecha).format(fecha)
}

export function nombreComercio(ficha: FichaComercio) {
  return ficha.nombre?.trim() || `${ETIQUETA_TIPO[ficha.formato.tipo]} sin nombre`
}

export function textoPedido(ficha: FichaComercio) {
  const lineas = ficha.pedido_sugerido.map((item) => `- ${item.cantidad} ${item.unidad} · ${item.producto}`)
  return [`Pedido sugerido · ${nombreComercio(ficha)}`, ...lineas].join("\n")
}
