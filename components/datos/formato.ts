import type { FichaComercio } from "./tipos"

export {
  ETIQUETA_ESTADO_PRECIO,
  ETIQUETA_FORMATO,
  ETIQUETA_GAMA,
  ETIQUETA_NSE,
  ETIQUETA_PRODUCTO_CLAVE,
  ETIQUETA_TIPO,
  ETIQUETA_ZONA,
  FOTOS_VISITA,
  PRODUCTOS_CON_PRECIO,
} from "@/lib/etiquetas"
export { formatearPuntaje } from "@/lib/nse"

const formatoMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatearPrecio(precio: number | null) {
  return precio === null ? null : formatoMoneda.format(precio)
}

const formatoFecha = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" })
const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatearFecha(iso: string, conHora = false) {
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso)
  if (Number.isNaN(fecha.getTime())) return ""
  return (conHora ? formatoFechaHora : formatoFecha).format(fecha)
}

export function haceCuanto(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso.length === 10 ? `${iso}T12:00:00-03:00` : iso).getTime()) / 86_400_000)
  if (dias <= 0) return "hoy"
  if (dias === 1) return "ayer"
  if (dias < 60) return `hace ${dias} días`
  if (dias < 730) return `hace ${Math.round(dias / 30)} meses`
  return `hace ${Math.round(dias / 365)} años`
}

export function nombreComercio(ficha: Pick<FichaComercio, "nombre">) {
  return ficha.nombre?.trim() || "Comercio sin nombre"
}
