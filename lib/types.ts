// Contrato compartido interfaz <-> API. Ver docs/CONTRATO_V2.md (incluye los cambios post-entrevista).

// −1 apunta a público bajo, 0 medio, +1 alto. null = "no sé / no aplica" (no cuenta).
export type ValorNSE = -1 | 0 | 1 | null

export type PreguntaDueno =
  | "cajas"
  | "repositor"
  | "empleados"
  | "delivery"
  | "pedidos_faltantes"
  | "ticket"
  | "otros_locales"

export type RespuestasDueno = Partial<Record<PreguntaDueno, ValorNSE>>

export type CriterioFoto =
  | "gaseosas_cerveza"
  | "vinos"
  | "papel_limpieza"
  | "premium_saludable"
  | "marcas_basicos"
  | "forma_venta"
  | "surtido"
  | "orden_carteles"

export type NivelNSE = "bajo" | "medio" | "alto"
export type Gama = "economica" | "media" | "premium"
export type Zona = "vulnerable" | "media" | "acomodada"

export type TipoNegocio =
  | "almacen_kiosco"
  | "autoservicio"
  | "supermercado"
  | "mayorista"
  | "gastronomia_hoteleria"
  | "institucional"
  | "especializado"

export type FormatoNegocio =
  | "kiosco"
  | "almacen"
  | "autoservicio"
  | "autoservicio_a4"
  | "supermercado"
  | "hipermercado"
  | "mayorista"
  | "bar_cafeteria"
  | "restaurante_hotel"
  | "oficina_catering"
  | "vending"
  | "dietetica"
  | "estacion_servicio"
  | "ecommerce"

// Qué muestra cada foto. El vendedor elige el casillero; ninguna es obligatoria.
export type TipoFoto =
  | "fachada"
  | "bebidas"
  | "almacen"
  | "limpieza"
  | "cajas"
  | "leche"
  | "aceite"
  | "papel_higienico"
  | "otra"

export type ProductoClave = "papel_higienico" | "aceite" | "leche" | "yerba" | "cafe" | "azucar" | "otro"

// relevado: se leyó el precio · ilegible: hay foto pero no se lee · sin_foto: no se fotografió · no_vende: el comercio no lo vende
export type EstadoPrecio = "relevado" | "ilegible" | "sin_foto" | "no_vende"

export type PrecioClave = {
  producto: ProductoClave
  descripcion: string // marca + presentación
  precio: number | null // null si no se lee, no se fotografió o no lo vende
  estado: EstadoPrecio
}

export type CriterioNSE = {
  id: CriterioFoto | PreguntaDueno
  etiqueta: string
  fuente: "foto" | "dueno"
  valor: ValorNSE
  evidencia: string
}

export type ResultadoNSE = {
  nivel: NivelNSE // calculado por CÓDIGO, no por el modelo
  puntaje: number | null // promedio de criterios respondidos (−1..+1)
  respondidas: number
  criterios: CriterioNSE[]
  pedir_otra_foto: boolean // true si hubo < 4 respuestas
  conflicto_foto_dueno: boolean // true si foto y dueño apuntan a niveles opuestos
  explicacion: string
}

export type ProductoMix = {
  material: string // código exacto de data/catalogo.json
  nombre: string // nombre legible para mostrar
  rubro: string
  linea: string
  gama: Gama
  estado: "ya_tiene" | "le_falta"
}

export type Mix = {
  puntaje_usado: number
  porcentajes: Record<Gama, number> // suman 100
  total_productos: number
  productos: ProductoMix[]
}

export type Categoria = { formato: FormatoNegocio; nse: NivelNSE; puntaje: number | null }

export type FichaComercio = {
  id: string
  creado: string // ISO
  nombre: string | null
  punto_id: string | null
  ubicacion: { lat: number; lng: number } | null
  fotos_analizadas: number

  formato: {
    tipo: TipoNegocio
    formato: FormatoNegocio
    cajas_estimadas: number | null
    gondolas_estimadas: number | null
    sucursales: number | null // otros locales además de este
    justificacion: string
  }
  zona: { sugerida: Zona | null; confirmada: Zona | null; evidencia: string }
  nse: ResultadoNSE
  gondola: {
    estado: "buena" | "regular" | "mala" | null
    variedad: "baja" | "media" | "alta" | null // cuánto surtido tiene (define cuántos SKUs ofrecer)
    observaciones: string[]
  }
  surtido: {
    tiene: { material: string; nombre: string; rubro: string; observacion?: string }[]
  }
  mix: Mix
  ofrecer_primero: { material: string; nombre: string; rubro: string; gama: Gama; argumento: string }[] // máx. 3
  competencia: { marca: string; categoria: string; observacion: string }[]
  precios_clave: PrecioClave[]
  checklist_fotos_faltantes: string[]
  recategorizacion: {
    antes: Categoria | null
    ahora: Categoria
    cambio: boolean
    motivo: string
  } | null
  resumen: string // 2–3 líneas, se lee en 10 segundos
  origen: "ia" | "demo" // "demo" si no hay clave de modelo
}

export type PuntoDeVenta = {
  id: string
  nombre: string
  direccion: string
  lat: number
  lng: number
  orden: number
  estado: "nuevo" | "cliente"
  categoria_actual: (Categoria & { fecha: string; zona: Zona | null }) | null
  observaciones: string | null
  ultimas_ventas: { fecha: string; items: { material: string; nombre: string; unidades: number }[] }[] // EJEMPLO
  mix_actual: Record<Gama, number> | null
  ultima_ficha_id: string | null // visita más reciente registrada en la app
  visitado_hoy: boolean
}

export type ComparadorPrecios = {
  producto: ProductoClave
  comercios: { fichaId: string; nombre: string | null; descripcion: string; precio: number; fecha: string }[]
  minimo: number
  mediana: number
  maximo: number
  criterio: "similares" | "todos" // similares = mismo tipo de negocio y nivel NSE (si hay al menos 2)
}[]

export type MensajeChat = { rol: "vendedor" | "asistente"; texto: string }
