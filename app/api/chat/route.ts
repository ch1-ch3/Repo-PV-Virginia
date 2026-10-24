import { generar, hayModelo } from "@/lib/llm"
import { PROMPT_SISTEMA } from "@/lib/prompt"
import { obtenerFicha } from "@/lib/db"
import { ETIQUETA_ESTADO_PRECIO, ETIQUETA_FORMATO, ETIQUETA_GAMA, ETIQUETA_PRODUCTO_CLAVE } from "@/lib/etiquetas"
import type { FichaComercio, MensajeChat } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

// Contexto compacto de la ficha: lo que el vendedor ve en pantalla, sin ruido.
function contextoFicha(f: FichaComercio): string {
  const criterios = f.nse.criterios
    .filter((c) => c.valor !== null)
    .map((c) => `${c.etiqueta} (${c.fuente === "foto" ? "foto" : "dueño"}): ${c.evidencia} → ${c.valor! > 0 ? "+1" : c.valor}`)
  const mix = f.mix.productos.map((p) => `${p.nombre} [${ETIQUETA_GAMA[p.gama]}, ${p.estado === "ya_tiene" ? "ya tiene" : "le falta"}]`)
  const precios = f.precios_clave.map(
    (p) => `${ETIQUETA_PRODUCTO_CLAVE[p.producto]}: ${p.precio !== null ? `$${p.precio} (${p.descripcion})` : ETIQUETA_ESTADO_PRECIO[p.estado]}`,
  )
  return [
    `Comercio: ${f.nombre ?? "sin nombre"} · ${ETIQUETA_FORMATO[f.formato.formato]} · cajas ${f.formato.cajas_estimadas ?? "?"} · góndolas ${f.formato.gondolas_estimadas ?? "?"}`,
    `NSE ${f.nse.nivel} · ${f.nse.explicacion}`,
    `Criterios: ${criterios.join("; ") || "sin datos"}`,
    `Zona: ${f.zona.confirmada ?? f.zona.sugerida ?? "sin dato"} · Góndola: ${f.gondola.estado ?? "sin dato"}, variedad ${f.gondola.variedad ?? "sin dato"}. ${f.gondola.observaciones.join("; ")}`,
    `Mix (${f.mix.porcentajes.economica}% económica / ${f.mix.porcentajes.media}% media / ${f.mix.porcentajes.premium}% premium): ${mix.join("; ")}`,
    `Ofrecer primero: ${f.ofrecer_primero.map((o) => `${o.nombre} — ${o.argumento}`).join(" | ")}`,
    `Competencia: ${f.competencia.map((c) => `${c.marca} (${c.categoria}): ${c.observacion}`).join("; ") || "no se vio"}`,
    `Precios clave: ${precios.join("; ")}`,
    f.recategorizacion?.cambio ? `Recategorización: ${f.recategorizacion.motivo}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

// Body: { fichaId?: string, ficha?: FichaComercio, mensajes: MensajeChat[] }
// Respuesta: texto plano
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { fichaId?: string; ficha?: FichaComercio; mensajes?: MensajeChat[] }
    const ficha = body.ficha?.mix ? body.ficha : body.fichaId ? await obtenerFicha(body.fichaId) : null
    const mensajes = (body.mensajes ?? []).filter((m) => m.texto?.trim())
    if (!ficha) return Response.json({ error: "Falta la ficha del comercio" }, { status: 400 })
    if (mensajes.length === 0) return Response.json({ error: "Falta la pregunta" }, { status: 400 })
    if (!hayModelo())
      return Response.json(
        { error: "El asistente necesita la clave del modelo (GEMINI_API_KEY u otra). La ficha y el mix funcionan igual." },
        { status: 503 },
      )

    const contexto = `Ficha del comercio armada en esta visita:\n${contextoFicha(ficha)}\n
Respondé la pregunta del vendedor en 2 a 5 líneas, con algo que pueda decir o hacer ya. Recomendá solo productos del
catálogo, preferentemente del mix. Si la ficha no tiene el dato, decilo.`

    const turnos = mensajes.map((m) => ({
      rol: m.rol === "vendedor" ? ("user" as const) : ("assistant" as const),
      texto: m.texto,
    }))
    // Los proveedores exigen que la conversación arranque con el usuario.
    while (turnos.length && turnos[0].rol !== "user") turnos.shift()
    if (turnos.length === 0) return Response.json({ error: "Falta la pregunta" }, { status: 400 })
    turnos[0] = { ...turnos[0], texto: `${contexto}\n\nPregunta: ${turnos[0].texto}` }

    const texto = await generar({ sistema: PROMPT_SISTEMA, turnos })
    // Texto plano: la interfaz lo lee como stream y lo va mostrando.
    return new Response(texto, { headers: { "content-type": "text/plain; charset=utf-8" } })
  } catch (e) {
    console.error("chat", e)
    return Response.json({ error: e instanceof Error ? e.message : "Error en el chat" }, { status: 500 })
  }
}
