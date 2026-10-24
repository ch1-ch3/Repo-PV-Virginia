// Persistencia de fichas y puntos de venta.
// Si hay SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY usa Supabase (REST, sin dependencias).
// Si no, guarda en memoria (se pierde al reiniciar) y siempre suma las visitas de demo.
// Tabla: ver supabase/schema.sql

import puntosDemo from "../data/puntos-demo.json"
import semillas from "../data/fichas-demo.json"
import { buscarMaterial } from "./catalogo"
import { armarFicha, type EntradaFicha } from "./ficha"
import type { FichaComercio, PuntoDeVenta } from "./types"

const URL_SB = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY_SB = process.env.SUPABASE_SERVICE_ROLE_KEY

const memoria: FichaComercio[] = []

type PuntoSemilla = Omit<PuntoDeVenta, "ultimas_ventas" | "ultima_ficha_id" | "visitado_hoy"> & {
  ultimas_ventas: { fecha: string; items: { material: string; unidades: number }[] }[]
}

// Puntos asignados al vendedor (DATOS DE EJEMPLO: categoría del cuestionario 2022 y ventas simuladas).
const PUNTOS_BASE: PuntoDeVenta[] = (puntosDemo as PuntoSemilla[]).map((p) => ({
  ...p,
  ultimas_ventas: p.ultimas_ventas.map((v) => ({
    fecha: v.fecha,
    items: v.items.map((i) => ({ ...i, nombre: buscarMaterial(i.material)?.nombre ?? i.material })),
  })),
  ultima_ficha_id: null,
  visitado_hoy: false,
}))

type Semilla = Omit<EntradaFicha, "punto" | "ubicacion" | "origen"> & { punto_id: string | null }

// Las visitas de demo pasan por el mismo armado que una visita real, así NSE y mix son coherentes.
let fichasDemo: FichaComercio[] | null = null
function demo(): FichaComercio[] {
  fichasDemo ??= (semillas as unknown as Semilla[]).map((s) =>
    armarFicha({ ...s, punto: PUNTOS_BASE.find((p) => p.id === s.punto_id) ?? null, ubicacion: null, origen: "demo" }),
  )
  return fichasDemo
}

function headers() {
  return {
    apikey: KEY_SB ?? "",
    authorization: `Bearer ${KEY_SB}`,
    "content-type": "application/json",
  }
}

export async function guardarFicha(ficha: FichaComercio): Promise<void> {
  if (!URL_SB || !KEY_SB) {
    memoria.unshift(ficha)
    return
  }
  const res = await fetch(`${URL_SB}/rest/v1/fichas`, {
    method: "POST",
    headers: { ...headers(), prefer: "return=minimal" },
    body: JSON.stringify({ id: ficha.id, creado: ficha.creado, nombre: ficha.nombre, data: ficha }),
  })
  if (!res.ok) {
    console.error("Supabase insert", res.status, await res.text())
    memoria.unshift(ficha)
  }
}

export async function listarFichas(): Promise<FichaComercio[]> {
  let guardadas: FichaComercio[] = memoria
  if (URL_SB && KEY_SB) {
    const res = await fetch(`${URL_SB}/rest/v1/fichas?select=data&order=creado.desc&limit=200`, {
      headers: headers(),
      cache: "no-store",
    })
    if (res.ok) {
      const filas = (await res.json()) as { data: FichaComercio }[]
      // Descarta fichas del contrato v1 que hayan quedado en la tabla.
      guardadas = [...memoria, ...filas.map((f) => f.data).filter((f) => f?.mix && f?.nse?.criterios)]
    } else {
      console.error("Supabase select", res.status, await res.text())
    }
  }
  const ids = new Set<string>()
  return [...guardadas, ...demo()]
    .filter((f) => (ids.has(f.id) ? false : (ids.add(f.id), true)))
    .sort((a, b) => b.creado.localeCompare(a.creado))
}

export async function obtenerFicha(id: string): Promise<FichaComercio | null> {
  const todas = await listarFichas()
  return todas.find((f) => f.id === id) ?? null
}

function diaArgentina(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

// La categoría actual de un punto es la de su visita más reciente en la app; si nunca se visitó, la del cuestionario.
export async function listarPuntos(): Promise<PuntoDeVenta[]> {
  const fichas = await listarFichas()
  const hoy = diaArgentina(new Date())
  return PUNTOS_BASE.map((p) => {
    const ultima = fichas.find((f) => f.punto_id === p.id)
    if (!ultima) return p
    return {
      ...p,
      categoria_actual: {
        formato: ultima.formato.formato,
        nse: ultima.nse.nivel,
        puntaje: ultima.nse.puntaje,
        fecha: ultima.creado,
        zona: ultima.zona.confirmada ?? ultima.zona.sugerida,
      },
      mix_actual: ultima.mix.porcentajes,
      ultima_ficha_id: ultima.id,
      visitado_hoy: diaArgentina(ultima.creado) === hoy,
    }
  })
}

export async function obtenerPunto(id: string): Promise<PuntoDeVenta | null> {
  return (await listarPuntos()).find((p) => p.id === id) ?? null
}
