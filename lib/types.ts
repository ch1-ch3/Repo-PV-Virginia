// Contrato compartido interfaz <-> API. Ver docs/CONTRATO.md

export type TipoComercio =
  | "almacen"
  | "autoservicio"
  | "kiosco"
  | "despensa"
  | "cafeteria"
  | "supermercado"
  | "otro"

export type NivelNSE = "bajo" | "medio-bajo" | "medio" | "medio-alto" | "alto"

export type ProductoClave = "papel_higienico" | "aceite" | "leche" | "cafe" | "yerba" | "otro"

export type FichaComercio = {
  id: string
  creado: string
  nombre: string | null
  ubicacion: { lat: number; lng: number } | null
  formato: {
    tipo: TipoComercio
    tamano: "chico" | "mediano" | "grande"
    cajas_estimadas: number | null
    metros_gondola_estimados: number | null
    justificacion: string
  }
  nse: {
    nivel: NivelNSE
    senales: string[]
    confianza: number
  }
  gondola: {
    estado: "buena" | "regular" | "mala"
    observaciones: string[]
  }
  surtido: {
    tiene: { producto: string; observacion?: string }[]
    falta: { producto: string; motivo: string }[]
  }
  ofrecer_primero: { producto: string; argumento: string }[]
  pedido_sugerido: { producto: string; cantidad: number; unidad: string }[]
  competencia: { marca: string; categoria: string; observacion: string }[]
  precios_clave: { producto: ProductoClave; descripcion: string; precio: number | null }[]
  resumen: string
}

export type MensajeChat = { rol: "vendedor" | "asistente"; texto: string }
