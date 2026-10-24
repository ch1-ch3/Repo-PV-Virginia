"use client"

import { useSyncExternalStore } from "react"
import type { ProductoClave, RespuestasDueno, TipoFoto, Zona } from "./tipos"

// Borrador de la visita en memoria del navegador: si el vendedor vuelve atrás (al detalle o al paso anterior)
// no pierde las fotos ni las respuestas. Se borra al analizar.

export type FotoBorrador = { id: string; tipo: TipoFoto; archivo: File; url: string }

export type Borrador = {
  fotos: FotoBorrador[]
  noVende: ProductoClave[]
  respuestas: RespuestasDueno
  zona: Zona | null
  nombre: string
  inicio: number // para el reloj de la visita
}

const vacio = (): Borrador => ({ fotos: [], noVende: [], respuestas: {}, zona: null, nombre: "", inicio: Date.now() })

const borradores = new Map<string, Borrador>()
const oyentes = new Set<() => void>()

function avisar() {
  oyentes.forEach((o) => o())
}

export function useBorrador(clave: string) {
  const borrador = useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente)
      return () => oyentes.delete(oyente)
    },
    () => {
      if (!borradores.has(clave)) borradores.set(clave, vacio())
      return borradores.get(clave)!
    },
    () => SERVIDOR,
  )

  function actualizar(cambio: Partial<Borrador> | ((b: Borrador) => Partial<Borrador>)) {
    const actual = borradores.get(clave) ?? vacio()
    borradores.set(clave, { ...actual, ...(typeof cambio === "function" ? cambio(actual) : cambio) })
    avisar()
  }

  function descartar() {
    borradores.get(clave)?.fotos.forEach((f) => URL.revokeObjectURL(f.url))
    borradores.delete(clave)
    avisar()
  }

  return { borrador, actualizar, descartar }
}

const SERVIDOR = vacio()
