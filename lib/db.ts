// Persistencia de fichas.
// Si hay SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY usa Supabase (REST, sin dependencias).
// Si no, guarda en memoria (se pierde al reiniciar) y siempre suma las fichas de demo.
// Tabla: ver supabase/schema.sql

import type { FichaComercio } from "./types"
import demo from "../data/fichas-demo.json"

const URL_SB = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY_SB = process.env.SUPABASE_SERVICE_ROLE_KEY

const memoria: FichaComercio[] = []
const fichasDemo = demo as unknown as FichaComercio[]

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
      guardadas = filas.map((f) => f.data)
    } else {
      console.error("Supabase select", res.status, await res.text())
    }
  }
  return [...guardadas, ...fichasDemo]
}

export async function obtenerFicha(id: string): Promise<FichaComercio | null> {
  const todas = await listarFichas()
  return todas.find((f) => f.id === id) ?? null
}
