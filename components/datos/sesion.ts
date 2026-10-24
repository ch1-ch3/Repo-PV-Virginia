"use client"

import { useSyncExternalStore } from "react"

// Login solo visual (docs/ENTREVISTA.md): no hay backend de autenticación, la sesión vive en este navegador.

export type Sesion = { nombre: string; zona: string }

const CLAVE = "vcp-sesion"
const oyentes = new Set<() => void>()
let cache: { crudo: string | null; sesion: Sesion | null } = { crudo: null, sesion: null }

function leer(): Sesion | null {
  let crudo: string | null = null
  try {
    crudo = localStorage.getItem(CLAVE)
  } catch {
    // almacenamiento bloqueado: se trata como sesión de demo en memoria
    return cache.sesion
  }
  if (crudo !== cache.crudo) {
    try {
      cache = { crudo, sesion: crudo ? (JSON.parse(crudo) as Sesion) : null }
    } catch {
      cache = { crudo, sesion: null }
    }
  }
  return cache.sesion
}

function guardar(sesion: Sesion | null) {
  cache = { crudo: sesion ? JSON.stringify(sesion) : null, sesion }
  try {
    if (sesion) localStorage.setItem(CLAVE, cache.crudo!)
    else localStorage.removeItem(CLAVE)
  } catch {
    // sin almacenamiento: queda solo en memoria
  }
  oyentes.forEach((o) => o())
}

// undefined = todavía no se leyó (render del servidor)
export function useSesion() {
  const sesion = useSyncExternalStore<Sesion | null | undefined>(
    (o) => {
      oyentes.add(o)
      return () => oyentes.delete(o)
    },
    leer,
    () => undefined,
  )
  return {
    sesion,
    iniciar: (nombre: string) => guardar({ nombre, zona: "Rosario Sur" }),
    cerrar: () => guardar(null),
  }
}
