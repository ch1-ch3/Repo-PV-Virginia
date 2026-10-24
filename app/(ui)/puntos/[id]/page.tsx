import type { Metadata } from "next"
import { Encabezado } from "@/components/encabezado"
import { DetallePunto } from "@/components/puntos/detalle-punto"

export const metadata: Metadata = { title: "Punto de venta · Visita con Plan" }

export default async function PuntoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <>
      <Encabezado titulo="Punto de venta" volverA="/" textoVolver="Mis puntos" />
      <main className="mx-auto max-w-2xl px-4 pt-5">
        <DetallePunto id={decodeURIComponent(id)} />
      </main>
    </>
  )
}
