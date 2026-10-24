"use client"

import useSWR, { mutate } from "swr"
import type {
  ComparadorPrecios,
  FichaComercio,
  MensajeChat,
  ProductoClave,
  PuntoDeVenta,
  RespuestasDueno,
  TipoFoto,
  Zona,
} from "./tipos"

// Las rutas devuelven { error } con status 4xx/5xx: lo mostramos tal cual, sin caer a datos inventados.
async function pedir<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } })
  if (!res.ok) {
    const cuerpo = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(cuerpo?.error ?? `Error ${res.status}`)
  }
  return res.json() as Promise<T>
}

const opciones = { revalidateOnFocus: false }

export function usePuntos() {
  return useSWR<PuntoDeVenta[]>("/api/puntos", pedir, opciones)
}

export function usePunto(id: string | null) {
  return useSWR<PuntoDeVenta>(id ? `/api/puntos/${encodeURIComponent(id)}` : null, pedir, opciones)
}

// Fichas recién analizadas en este dispositivo: el servidor puede no tenerlas en memoria (otra instancia).
const fichasLocales = new Map<string, FichaComercio>()

export function useFicha(id: string) {
  return useSWR<FichaComercio>(
    `/api/comercios/${encodeURIComponent(id)}`,
    async (url: string) => fichasLocales.get(id) ?? pedir<FichaComercio>(url),
    { ...opciones, fallbackData: fichasLocales.get(id) },
  )
}

export function useComercios() {
  return useSWR<FichaComercio[]>("/api/comercios", pedir, opciones)
}

// Precios de comercios similares a esta ficha; si el servidor no la conoce, contra todos.
export function usePrecios(similaresA?: string) {
  return useSWR<ComparadorPrecios>(
    similaresA ? `/api/precios?similares_a=${encodeURIComponent(similaresA)}` : "/api/precios",
    async (url: string) => {
      try {
        return await pedir<ComparadorPrecios>(url)
      } catch (e) {
        if (similaresA) return pedir<ComparadorPrecios>("/api/precios")
        throw e
      }
    },
    opciones,
  )
}

export type DatosVisita = {
  puntoId: string | null
  nombre: string | null
  fotos: { tipo: TipoFoto; archivo: File }[]
  noVende: ProductoClave[]
  respuestas: RespuestasDueno
  zona: Zona | null
  ubicacion: { lat: number; lng: number } | null
}

export async function analizarVisita(datos: DatosVisita): Promise<FichaComercio> {
  const formulario = new FormData()
  // Vercel limita el cuerpo a ~4,5 MB: comprimimos cada foto (máx. 1280 px, JPEG 0,75).
  const comprimidas = await Promise.all(datos.fotos.map((f) => comprimirFoto(f.archivo)))
  comprimidas.forEach((foto, i) => formulario.append("fotos", foto, `foto-${i + 1}.jpg`))
  formulario.append("tipos_fotos", JSON.stringify(datos.fotos.map((f) => f.tipo)))
  formulario.append("no_vende", JSON.stringify(datos.noVende))
  formulario.append("respuestas_dueno", JSON.stringify(datos.respuestas))
  if (datos.zona) formulario.append("zona_confirmada", datos.zona)
  if (datos.puntoId) formulario.append("punto_id", datos.puntoId)
  if (datos.nombre) formulario.append("nombre", datos.nombre)
  if (datos.ubicacion) {
    formulario.append("lat", String(datos.ubicacion.lat))
    formulario.append("lng", String(datos.ubicacion.lng))
  }

  const res = await fetch("/api/analizar", { method: "POST", body: formulario })
  const cuerpo = (await res.json().catch(() => null)) as (FichaComercio & { error?: string }) | null
  if (!res.ok || !cuerpo || cuerpo.error) throw new Error(cuerpo?.error ?? `No se pudo analizar (error ${res.status})`)

  fichasLocales.set(cuerpo.id, cuerpo)
  void mutate("/api/puntos")
  void mutate("/api/comercios")
  if (datos.puntoId) void mutate(`/api/puntos/${encodeURIComponent(datos.puntoId)}`)
  return cuerpo
}

export async function preguntarAlAsistente(
  ficha: FichaComercio,
  mensajes: MensajeChat[],
  alRecibir: (textoParcial: string) => void,
): Promise<void> {
  try {
    const respuesta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ficha, mensajes }),
    })
    if (!respuesta.ok || !respuesta.body) {
      const cuerpo = (await respuesta.json().catch(() => null)) as { error?: string } | null
      throw new Error(cuerpo?.error ?? `Error ${respuesta.status}`)
    }

    const lector = respuesta.body.getReader()
    const decodificador = new TextDecoder()
    let acumulado = ""
    while (true) {
      const { done, value } = await lector.read()
      if (done) break
      acumulado += decodificador.decode(value, { stream: true })
      alRecibir(acumulado)
    }
    if (!acumulado.trim()) throw new Error("Respuesta vacía")
  } catch (e) {
    alRecibir(
      `No pude responder: ${e instanceof Error ? e.message : "error de conexión"}. La categoría y el mix de arriba ya tienen la recomendación para esta visita.`,
    )
  }
}

async function comprimirFoto(archivo: File, ladoMax = 1280, calidad = 0.75): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    const ctx = canvas.getContext("2d")
    if (!ctx) return archivo
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/jpeg", calidad))
    return blob ?? archivo
  } catch {
    return archivo
  }
}
