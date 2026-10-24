import { listarFichas } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const fichas = await listarFichas()
  return Response.json(fichas)
}
