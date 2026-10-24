// Copia exacta de FichaComercio en docs/CONTRATO.md.
// Cuando exista lib/types.ts, reemplazar este archivo por: export type { FichaComercio } from "@/lib/types"

export type FichaComercio = {
  id: string
  creado: string
  nombre: string | null
  ubicacion: { lat: number; lng: number } | null
  formato: {
    tipo: "almacen" | "autoservicio" | "kiosco" | "despensa" | "cafeteria" | "supermercado" | "otro"
    tamano: "chico" | "mediano" | "grande"
    cajas_estimadas: number | null
    metros_gondola_estimados: number | null
    justificacion: string
  }
  nse: {
    nivel: "bajo" | "medio-bajo" | "medio" | "medio-alto" | "alto"
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
  precios_clave: {
    producto: "papel_higienico" | "aceite" | "leche" | "cafe" | "yerba" | "otro"
    descripcion: string
    precio: number | null
  }[]
  resumen: string
}

export type MensajeChat = { rol: "vendedor" | "asistente"; texto: string }
