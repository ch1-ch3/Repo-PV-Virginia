// Cliente mínimo de modelos multimodales vía fetch (sin dependencias extra).
// Elige proveedor según la variable de entorno disponible:
//   GEMINI_API_KEY (o GOOGLE_GENERATIVE_AI_API_KEY) · OPENAI_API_KEY · ANTHROPIC_API_KEY
// Modelo configurable con LLM_MODEL.

export type Imagen = { mime: string; base64: string }
export type Turno = { rol: "user" | "assistant"; texto: string }

type Opciones = { sistema: string; turnos: Turno[]; imagenes?: Imagen[]; json?: boolean }

export function hayModelo(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
}

function proveedor(): "gemini" | "openai" | "anthropic" {
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) return "gemini"
  if (process.env.OPENAI_API_KEY) return "openai"
  if (process.env.ANTHROPIC_API_KEY) return "anthropic"
  throw new Error("Falta la clave del modelo: configurá GEMINI_API_KEY, OPENAI_API_KEY o ANTHROPIC_API_KEY en Vercel")
}

export async function generar({ sistema, turnos, imagenes = [], json = false }: Opciones): Promise<string> {
  const p = proveedor()
  if (p === "gemini") return gemini(sistema, turnos, imagenes, json)
  if (p === "openai") return openai(sistema, turnos, imagenes, json)
  return anthropic(sistema, turnos, imagenes)
}

async function gemini(sistema: string, turnos: Turno[], imagenes: Imagen[], json: boolean) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const modelo = process.env.LLM_MODEL || "gemini-2.5-flash"
  const contents = turnos.map((t, i) => ({
    role: t.rol === "user" ? "user" : "model",
    parts: [
      // las imágenes van en el primer turno del usuario
      ...(i === 0 ? imagenes.map((im) => ({ inline_data: { mime_type: im.mime, data: im.base64 } })) : []),
      { text: t.texto },
    ],
  }))
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sistema }] },
        contents,
        generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: "application/json" } : {}) },
      }),
    },
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return (data?.candidates?.[0]?.content?.parts ?? []).map((x: { text?: string }) => x.text ?? "").join("")
}

async function openai(sistema: string, turnos: Turno[], imagenes: Imagen[], json: boolean) {
  const modelo = process.env.LLM_MODEL || "gpt-4o"
  const messages = [
    { role: "system", content: sistema },
    ...turnos.map((t, i) => ({
      role: t.rol,
      content: [
        ...(i === 0
          ? imagenes.map((im) => ({ type: "image_url", image_url: { url: `data:${im.mime};base64,${im.base64}` } }))
          : []),
        { type: "text", text: t.texto },
      ],
    })),
  ]
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.2,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ""
}

async function anthropic(sistema: string, turnos: Turno[], imagenes: Imagen[]) {
  const modelo = process.env.LLM_MODEL || "claude-sonnet-4-5"
  const messages = turnos.map((t, i) => ({
    role: t.rol,
    content: [
      ...(i === 0
        ? imagenes.map((im) => ({ type: "image", source: { type: "base64", media_type: im.mime, data: im.base64 } }))
        : []),
      { type: "text", text: t.texto },
    ],
  }))
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: modelo, max_tokens: 4000, system: sistema, messages }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  return (data?.content ?? []).map((x: { text?: string }) => x.text ?? "").join("")
}

// Extrae el primer objeto JSON de una respuesta (por si el modelo agrega texto o ```json).
export function parsearJSON<T>(texto: string): T {
  const limpio = texto.replace(/```json|```/g, "").trim()
  const ini = limpio.indexOf("{")
  const fin = limpio.lastIndexOf("}")
  if (ini === -1 || fin === -1) throw new Error("El modelo no devolvió JSON")
  return JSON.parse(limpio.slice(ini, fin + 1)) as T
}
