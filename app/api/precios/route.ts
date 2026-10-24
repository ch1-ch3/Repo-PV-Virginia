import { listarFichas } from "@/lib/db"
import { compararPrecios } from "@/lib/precios"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/precios[?similares_a=<fichaId>] → ComparadorPrecios
// Con similares_a compara contra comercios del mismo tipo y nivel NSE (si hay al menos 2 por producto).
export async function GET(req: Request) {
  const fichas = await listarFichas()
  const id = new URL(req.url).searchParams.get("similares_a")
  const referencia = id ? fichas.find((f) => f.id === id) ?? null : null
  if (id && !referencia) return Response.json({ error: "No encontramos esa ficha" }, { status: 404 })
  return Response.json(compararPrecios(fichas, referencia))
}
