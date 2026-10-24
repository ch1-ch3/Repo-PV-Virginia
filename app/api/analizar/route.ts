import { generar, hayModelo, parsearJSON, type Imagen } from "@/lib/llm"
import { PROMPT_SISTEMA, pedidoArgumentos, pedidoExtraccion } from "@/lib/prompt"
import { armarFicha, type Extraccion } from "@/lib/ficha"
import { guardarFicha, obtenerPunto } from "@/lib/db"
import { FOTOS_VISITA, PRODUCTOS_CON_PRECIO } from "@/lib/etiquetas"
import { PREGUNTAS_DUENO } from "@/lib/nse"
import type { ProductoClave, RespuestasDueno, TipoFoto, Zona } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FOTOS = 10
const MAX_BYTES = 4 * 1024 * 1024 // por foto; el cliente comprime antes
const TIPOS_FOTO = [...FOTOS_VISITA.map((f) => f.tipo), "otra"] as TipoFoto[]

function leerJSON<T>(valor: FormDataEntryValue | null, porDefecto: T): T {
  if (typeof valor !== "string" || !valor.trim()) return porDefecto
  try {
    return JSON.parse(valor) as T
  } catch {
    return porDefecto
  }
}

// multipart/form-data. Todo es opcional, pero tiene que haber al menos una foto o una respuesta del dueño.
// fotos[] · tipos_fotos (JSON TipoFoto[], mismo orden que fotos) · no_vende (JSON ProductoClave[])
// respuestas_dueno (JSON RespuestasDueno) · zona_confirmada · punto_id · nombre · lat · lng
export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const archivos = form.getAll("fotos").filter((f): f is File => typeof f !== "string")
    if (archivos.length > MAX_FOTOS) return Response.json({ error: `Máximo ${MAX_FOTOS} fotos por visita` }, { status: 400 })

    const tiposCrudos = leerJSON<unknown[]>(form.get("tipos_fotos"), [])
    const tipos_fotos = archivos.map((_, i) =>
      TIPOS_FOTO.includes(tiposCrudos[i] as TipoFoto) ? (tiposCrudos[i] as TipoFoto) : "otra",
    )
    const no_vende = leerJSON<unknown[]>(form.get("no_vende"), []).filter((p): p is ProductoClave =>
      PRODUCTOS_CON_PRECIO.includes(p as ProductoClave),
    )

    const crudas = leerJSON<Record<string, unknown>>(form.get("respuestas_dueno"), {})
    const respuestas: RespuestasDueno = {}
    for (const p of PREGUNTAS_DUENO) {
      const v = crudas[p.id]
      if (v === -1 || v === 0 || v === 1) respuestas[p.id] = v
    }
    const respondidas = Object.keys(respuestas).length
    if (archivos.length === 0 && respondidas === 0)
      return Response.json({ error: "Sacá al menos una foto o respondé alguna pregunta del dueño" }, { status: 400 })

    const zonaCruda = form.get("zona_confirmada")
    const zona_confirmada = (["vulnerable", "media", "acomodada"] as Zona[]).find((z) => z === zonaCruda) ?? null

    const puntoId = (form.get("punto_id") as string | null)?.trim() || null
    const punto = puntoId ? await obtenerPunto(puntoId) : null
    if (puntoId && !punto) return Response.json({ error: `No existe el punto de venta ${puntoId}` }, { status: 404 })

    const nombre = (form.get("nombre") as string | null)?.trim() || null
    const lat = Number(form.get("lat"))
    const lng = Number(form.get("lng"))
    const ubicacion =
      form.get("lat") !== null && Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? { lat, lng } : null

    const imagenes: Imagen[] = []
    for (const f of archivos) {
      if (f.size > MAX_BYTES) return Response.json({ error: `La foto ${f.name} supera 4 MB` }, { status: 413 })
      imagenes.push({ mime: f.type || "image/jpeg", base64: Buffer.from(await f.arrayBuffer()).toString("base64") })
    }

    // 1) El modelo extrae evidencia de las fotos (si hay fotos y clave). Si falla, seguimos solo con el dueño.
    const conModelo = hayModelo()
    let extraccion: Extraccion | null = null
    let fallaModelo = false
    if (conModelo && imagenes.length > 0) {
      try {
        const texto = await generar({
          sistema: PROMPT_SISTEMA,
          imagenes,
          json: true,
          turnos: [{ rol: "user", texto: pedidoExtraccion({ nombre: nombre ?? punto?.nombre ?? null, tipos_fotos, no_vende }) }],
        })
        extraccion = parsearJSON<Extraccion>(texto)
      } catch (e) {
        console.error("analizar: extracción", e)
        fallaModelo = true
      }
    }

    // 2) El código decide categoría, NSE y mix.
    const ficha = armarFicha({
      id: crypto.randomUUID(),
      creado: new Date().toISOString(),
      nombre,
      punto,
      ubicacion,
      tipos_fotos,
      no_vende,
      respuestas,
      zona_confirmada,
      extraccion,
      origen: conModelo && !fallaModelo ? "ia" : "demo",
    })

    // 3) El modelo redacta los argumentos de los productos que eligió el código. Si falla, quedan los de base.
    if (conModelo && !fallaModelo && ficha.ofrecer_primero.length > 0) {
      try {
        const texto = await generar({ sistema: PROMPT_SISTEMA, json: true, turnos: [{ rol: "user", texto: pedidoArgumentos(ficha) }] })
        const r = parsearJSON<{ argumentos?: { material: string; argumento: string }[]; resumen?: string }>(texto)
        for (const o of ficha.ofrecer_primero) {
          const a = r.argumentos?.find((x) => x.material === o.material)?.argumento?.trim()
          if (a) o.argumento = a
        }
        if (r.resumen?.trim()) ficha.resumen = r.resumen.trim()
      } catch (e) {
        console.error("analizar: argumentos", e)
      }
    }

    await guardarFicha(ficha)
    return Response.json(ficha)
  } catch (e) {
    console.error("analizar", e)
    return Response.json({ error: e instanceof Error ? e.message : "Error al analizar" }, { status: 500 })
  }
}
