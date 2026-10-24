import { obtenerPunto } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const punto = await obtenerPunto(decodeURIComponent(id))
  if (!punto) return Response.json({ error: "No encontramos ese punto de venta" }, { status: 404 })
  return Response.json(punto)
}
