import { generar } from "@/lib/llm"
import { PROMPT_SISTEMA } from "@/lib/prompt"
import { obtenerFicha } from "@/lib/db"
import type { FichaComercio, MensajeChat } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

// Body: { fichaId?: string, ficha?: FichaComercio, mensajes: MensajeChat[] }
// Respuesta: { texto: string }
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { fichaId?: string; ficha?: FichaComercio; mensajes?: MensajeChat[] }
    const ficha = body.ficha ?? (body.fichaId ? await obtenerFicha(body.fichaId) : null)
    const mensajes = (body.mensajes ?? []).filter((m) => m.texto?.trim())
    if (!ficha) return Response.json({ error: "Falta la ficha del comercio" }, { status: 400 })
    if (mensajes.length === 0) return Response.json({ error: "Falta la pregunta" }, { status: 400 })

    const contexto = `Ficha del comercio generada a partir de las fotos de la visita:\n${JSON.stringify(ficha)}\n
Respondé la pregunta del vendedor en 2 a 5 líneas, con algo que pueda decir o hacer ya. Si la ficha no tiene el dato, decilo.`

    const turnos = mensajes.map((m, i) => ({
      rol: m.rol === "vendedor" ? ("user" as const) : ("assistant" as const),
      texto: i === 0 ? `${contexto}\n\nPregunta: ${m.texto}` : m.texto,
    }))
    // Los proveedores exigen que la conversación arranque con el usuario.
    while (turnos.length && turnos[0].rol !== "user") turnos.shift()

    const texto = await generar({ sistema: PROMPT_SISTEMA, turnos })
    return Response.json({ texto })
  } catch (e) {
    console.error("chat", e)
    return Response.json({ error: e instanceof Error ? e.message : "Error en el chat" }, { status: 500 })
  }
}
