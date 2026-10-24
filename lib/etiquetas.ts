// Textos para mostrar. Los usa el back (resumen, prompt) y el front (pantallas).

import type { EstadoPrecio, FormatoNegocio, Gama, NivelNSE, ProductoClave, TipoFoto, TipoNegocio, Zona } from "./types"

export const ETIQUETA_FORMATO: Record<FormatoNegocio, string> = {
  kiosco: "Kiosco",
  almacen: "Almacén",
  autoservicio: "Autoservicio",
  autoservicio_a4: "Autoservicio amarillo (A4)",
  supermercado: "Supermercado",
  hipermercado: "Hipermercado",
  mayorista: "Mayorista",
  bar_cafeteria: "Bar y cafetería",
  restaurante_hotel: "Restaurante y hotel",
  oficina_catering: "Oficina y catering",
  vending: "Vending",
  dietetica: "Dietética",
  estacion_servicio: "Estación de servicio",
  ecommerce: "E-commerce",
}

export const TIPO_DE_FORMATO: Record<FormatoNegocio, TipoNegocio> = {
  kiosco: "almacen_kiosco",
  almacen: "almacen_kiosco",
  autoservicio: "autoservicio",
  autoservicio_a4: "autoservicio",
  supermercado: "supermercado",
  hipermercado: "supermercado",
  mayorista: "mayorista",
  bar_cafeteria: "gastronomia_hoteleria",
  restaurante_hotel: "gastronomia_hoteleria",
  oficina_catering: "institucional",
  vending: "institucional",
  dietetica: "especializado",
  estacion_servicio: "especializado",
  ecommerce: "especializado",
}

export const ETIQUETA_TIPO: Record<TipoNegocio, string> = {
  almacen_kiosco: "Almacén y kiosco",
  autoservicio: "Autoservicio",
  supermercado: "Supermercado",
  mayorista: "Mayorista",
  gastronomia_hoteleria: "Gastronomía y hotelería",
  institucional: "Institucional",
  especializado: "Especializado",
}

export const ETIQUETA_NSE: Record<NivelNSE, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto" }
export const ETIQUETA_GAMA: Record<Gama, string> = { economica: "Económica", media: "Media", premium: "Premium" }
export const ETIQUETA_ZONA: Record<Zona, string> = { vulnerable: "Vulnerable", media: "Media", acomodada: "Acomodada" }

export const ETIQUETA_PRODUCTO_CLAVE: Record<ProductoClave, string> = {
  leche: "Leche",
  aceite: "Aceite",
  papel_higienico: "Papel higiénico",
  yerba: "Yerba",
  cafe: "Café",
  azucar: "Azúcar",
  otro: "Otro",
}

export const ETIQUETA_ESTADO_PRECIO: Record<EstadoPrecio, string> = {
  relevado: "Relevado",
  ilegible: "No se lee el precio",
  sin_foto: "Sin foto",
  no_vende: "No lo vende",
}

// Casilleros de fotos de la visita. Ninguno es obligatorio.
export const FOTOS_VISITA: {
  tipo: TipoFoto
  titulo: string
  ayuda: string
  sugerida: boolean
  producto?: ProductoClave // si es foto de precio de un producto clave
}[] = [
  { tipo: "fachada", titulo: "Fachada y cuadra", ayuda: "Entrada, cartel y la vereda de enfrente", sugerida: true },
  { tipo: "almacen", titulo: "Góndola de almacén", ayuda: "Yerba, café, té, mate cocido", sugerida: true },
  { tipo: "bebidas", titulo: "Góndola de bebidas", ayuda: "Gaseosas, aguas, cervezas, vinos", sugerida: true },
  { tipo: "limpieza", titulo: "Limpieza y papel", ayuda: "Papel higiénico, lavandina, jabones", sugerida: false },
  { tipo: "cajas", titulo: "Cajas", ayuda: "Línea de cobro y medios de pago", sugerida: false },
  { tipo: "leche", titulo: "Leche con precio", ayuda: "Que se lea la etiqueta", sugerida: false, producto: "leche" },
  { tipo: "aceite", titulo: "Aceite con precio", ayuda: "Que se lea la etiqueta", sugerida: false, producto: "aceite" },
  { tipo: "papel_higienico", titulo: "Papel higiénico con precio", ayuda: "Que se lea la etiqueta", sugerida: false, producto: "papel_higienico" },
]

export const PRODUCTOS_CON_PRECIO: ProductoClave[] = ["leche", "aceite", "papel_higienico"]

export function nombreLinea(linea: string): string {
  if (linea.startsWith("CAFÉ")) return "café"
  if (linea === "TES") return "té"
  if (linea === "YERBA") return "mate cocido"
  if (linea.startsWith("ESPECIAS")) return "especias"
  if (linea === "HERBORISTERIA") return "hierbas"
  if (linea === "PREPARADOS") return "caldos y sopas"
  if (linea === "EDULCORANTES") return "edulcorante"
  if (linea.startsWith("PRODUCTOS FUERA")) return "línea gastronómica"
  return linea.toLowerCase()
}
