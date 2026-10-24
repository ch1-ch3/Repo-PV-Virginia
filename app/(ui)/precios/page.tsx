import type { Metadata } from "next"
import { Encabezado } from "@/components/encabezado"
import { TablaPrecios } from "@/components/precios/tabla-precios"

export const metadata: Metadata = { title: "Comparador de precios · Visita con Plan" }

export default function PreciosPage() {
  return (
    <>
      <Encabezado titulo="Precios" volverA="/" />
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-12">
        <TablaPrecios />
      </main>
    </>
  )
}
