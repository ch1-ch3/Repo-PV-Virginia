import { listarPuntos } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Puntos de venta asignados al vendedor, en orden de visita (DATOS DE EJEMPLO).
export async function GET() {
  return Response.json(await listarPuntos())
}
