"use client"

import useSWR, { mutate } from "swr"
import { FICHAS_EJEMPLO, fichaDeEjemplo } from "./ejemplo"
import type { FichaComercio, MensajeChat } from "./tipos"

type ResultadoComercios = { fichas: FichaComercio[]; origen: "api" | "ejemplo" }

const CLAVE_COMERCIOS = "/api/comercios"
const CLAVE_LOCALES = "fichas-locales"

function esFicha(valor: unknown): valor is FichaComercio {
  return typeof valor === "object" && valor !== null && "id" in valor && "formato" in valor && "resumen" in valor
}

async function cargarComercios(): Promise<ResultadoComercios> {
  try {
    const respuesta = await fetch(CLAVE_COMERCIOS, { headers: { Accept: "application/json" } })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    const datos: unknown = await respuesta.json()
    if (!Array.isArray(datos) || !datos.every(esFicha)) throw new Error("Formato inesperado")
    return { fichas: datos, origen: "api" }
  } catch {
    return { fichas: FICHAS_EJEMPLO, origen: "ejemplo" }
  }
}

export function useComercios() {
  const { data, isLoading } = useSWR(CLAVE_COMERCIOS, cargarComercios, { revalidateOnFocus: false })
  const { data: locales = [] } = useSWR<FichaComercio[]>(CLAVE_LOCALES, null, { fallbackData: [] })

  const idsLocales = new Set(locales.map((f) => f.id))
  const remotas = (data?.fichas ?? []).filter((f) => !idsLocales.has(f.id))
  const fichas = [...locales, ...remotas].sort((a, b) => b.creado.localeCompare(a.creado))

  return { fichas, origen: data?.origen ?? null, isLoading }
}

export function useFicha(id: string) {
  const { fichas, isLoading } = useComercios()
  return { ficha: fichas.find((f) => f.id === id) ?? null, isLoading }
}

export async function analizarVisita(datos: {
  fotos: File[]
  nombre: string | null
  ubicacion: FichaComercio["ubicacion"]
}): Promise<{ ficha: FichaComercio; origen: "api" | "ejemplo" }> {
  const formulario = new FormData()
  datos.fotos.forEach((foto) => formulario.append("fotos", foto))
  if (datos.nombre) formulario.append("nombre", datos.nombre)
  if (datos.ubicacion) {
    formulario.append("lat", String(datos.ubicacion.lat))
    formulario.append("lng", String(datos.ubicacion.lng))
  }

  let resultado: { ficha: FichaComercio; origen: "api" | "ejemplo" }
  try {
    const respuesta = await fetch("/api/analizar", { method: "POST", body: formulario })
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`)
    const ficha: unknown = await respuesta.json()
    if (!esFicha(ficha)) throw new Error("Formato inesperado")
    resultado = { ficha, origen: "api" }
  } catch {
    resultado = { ficha: fichaDeEjemplo({ nombre: datos.nombre, ubicacion: datos.ubicacion }), origen: "ejemplo" }
  }

  await mutate<FichaComercio[]>(CLAVE_LOCALES, (previas = []) => [resultado.ficha, ...previas], {
    revalidate: false,
  })
  if (resultado.origen === "api") void mutate(CLAVE_COMERCIOS)
  return resultado
}

export async function preguntarAlAsistente(
  fichaId: string,
  mensajes: MensajeChat[],
  alRecibir: (textoParcial: string) => void,
): Promise<"api" | "ejemplo"> {
  try {
    const respuesta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fichaId, mensajes }),
    })
    if (!respuesta.ok || !respuesta.body) throw new Error(`HTTP ${respuesta.status}`)

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
    return "api"
  } catch {
    alRecibir(
      "No pude conectarme con el asistente en este momento. Revisá la ficha de arriba: el surtido, “Ofrecer primero” y el pedido sugerido ya tienen la recomendación para esta visita.",
    )
    return "ejemplo"
  }
}
