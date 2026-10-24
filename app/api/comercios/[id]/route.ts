import { obtenerFicha } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ficha = await obtenerFicha(decodeURIComponent(id))
  if (!ficha) return Response.json({ error: "No encontramos esa ficha" }, { status: 404 })
  return Response.json(ficha)
}
