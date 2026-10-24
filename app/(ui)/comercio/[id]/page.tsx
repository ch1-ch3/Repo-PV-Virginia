import type { Metadata } from "next"
import { obtenerFicha } from "@/lib/db"
import { Encabezado } from "@/components/encabezado"
import { VistaFicha } from "@/components/ficha/vista-ficha"

export const metadata: Metadata = { title: "Resultado de la visita · Visita con Plan" }

export default async function ComercioPage({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id)
  // Si la ficha es de un punto de la ruta, "volver" lleva a su detalle.
  const ficha = await obtenerFicha(id)
  const volverA = ficha?.punto_id ? `/puntos/${encodeURIComponent(ficha.punto_id)}` : "/"

  return (
    <>
      <Encabezado
        titulo="Resultado de la visita"
        subtitulo="Categoría · Mix · Asistente"
        volverA={volverA}
        textoVolver={ficha?.punto_id ? "Punto de venta" : "Mis puntos"}
      />
      <main className="mx-auto max-w-2xl px-4 pt-5">
        <VistaFicha id={id} />
      </main>
    </>
  )
}
