import { generar, parsearJSON, type Imagen } from "@/lib/llm"
import { PROMPT_SISTEMA, FORMATO_JSON } from "@/lib/prompt"
import { guardarFicha } from "@/lib/db"
import type { FichaComercio } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FOTOS = 6
const MAX_BYTES = 4 * 1024 * 1024 // por foto; el cliente debería comprimir antes

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const archivos = form.getAll("fotos").filter((f): f is File => typeof f !== "string")
    if (archivos.length === 0) return Response.json({ error: "Subí al menos una foto" }, { status: 400 })

    const imagenes: Imagen[] = []
    for (const f of archivos.slice(0, MAX_FOTOS)) {
      if (f.size > MAX_BYTES) return Response.json({ error: `La foto ${f.name} supera 4 MB` }, { status: 413 })
      const buf = Buffer.from(await f.arrayBuffer())
      imagenes.push({ mime: f.type || "image/jpeg", base64: buf.toString("base64") })
    }

    const nombre = (form.get("nombre") as string | null)?.trim() || null
    const nota = (form.get("nota") as string | null)?.trim() || ""
    const lat = Number(form.get("lat"))
    const lng = Number(form.get("lng"))
    const ubicacion = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? { lat, lng } : null

    const texto = await generar({
      sistema: PROMPT_SISTEMA,
      imagenes,
      json: true,
      turnos: [
        {
          rol: "user",
          texto: `Fotos del comercio${nombre ? ` "${nombre}"` : ""}.${nota ? ` Nota del vendedor: ${nota}.` : ""}\n\n${FORMATO_JSON}`,
        },
      ],
    })

    const parcial = parsearJSON<Omit<FichaComercio, "id" | "creado" | "nombre" | "ubicacion">>(texto)
    const ficha: FichaComercio = {
      ...normalizar(parcial),
      id: crypto.randomUUID(),
      creado: new Date().toISOString(),
      nombre,
      ubicacion,
    }

    await guardarFicha(ficha)
    return Response.json(ficha)
  } catch (e) {
    console.error("analizar", e)
    return Response.json({ error: e instanceof Error ? e.message : "Error al analizar" }, { status: 500 })
  }
}

// Completa campos faltantes para que la interfaz nunca reciba undefined.
function normalizar(p: Partial<FichaComercio>): Omit<FichaComercio, "id" | "creado" | "nombre" | "ubicacion"> {
  return {
    formato: {
      tipo: p.formato?.tipo ?? "otro",
      tamano: p.formato?.tamano ?? "chico",
      cajas_estimadas: p.formato?.cajas_estimadas ?? null,
      metros_gondola_estimados: p.formato?.metros_gondola_estimados ?? null,
      justificacion: p.formato?.justificacion ?? "",
    },
    nse: {
      nivel: p.nse?.nivel ?? "medio",
      senales: p.nse?.senales ?? [],
      confianza: typeof p.nse?.confianza === "number" ? p.nse.confianza : 0.5,
    },
    gondola: { estado: p.gondola?.estado ?? "regular", observaciones: p.gondola?.observaciones ?? [] },
    surtido: { tiene: p.surtido?.tiene ?? [], falta: p.surtido?.falta ?? [] },
    ofrecer_primero: (p.ofrecer_primero ?? []).slice(0, 3),
    pedido_sugerido: p.pedido_sugerido ?? [],
    competencia: p.competencia ?? [],
    precios_clave: p.precios_clave ?? [],
    resumen: p.resumen ?? "",
  }
}
