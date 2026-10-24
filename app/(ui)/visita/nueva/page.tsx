import type { Metadata } from "next"
import { obtenerPunto } from "@/lib/db"
import { Encabezado } from "@/components/encabezado"
import { Visita } from "@/components/visita/visita"

export const metadata: Metadata = { title: "Visita · Visita con Plan" }

export default async function VisitaPage({ searchParams }: { searchParams: Promise<{ punto?: string; paso?: string }> }) {
  const { punto: puntoId, paso: pasoCrudo } = await searchParams
  const punto = puntoId ? await obtenerPunto(puntoId) : null
  const paso = pasoCrudo === "2" ? 2 : 1
  const base = `/visita/nueva${punto ? `?punto=${encodeURIComponent(punto.id)}&` : "?"}`
  const volverA = paso === 2 ? `${base}paso=1` : punto ? `/puntos/${encodeURIComponent(punto.id)}` : "/"

  return (
    <>
      <Encabezado
        titulo={punto?.nombre ?? "Comercio fuera de ruta"}
        subtitulo={`Paso ${paso} de 3 · ${paso === 1 ? "Fotos" : "Entrevista al dueño"}`}
        volverA={volverA}
        textoVolver={paso === 2 ? "Fotos" : punto ? "Detalle" : "Mis puntos"}
      />
      <main className="mx-auto max-w-2xl px-4 pt-4">
        <Visita puntoId={punto?.id ?? null} paso={paso} />
      </main>
    </>
  )
}
