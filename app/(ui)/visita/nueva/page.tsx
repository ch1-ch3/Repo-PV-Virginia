import type { Metadata } from "next"
import { Encabezado } from "@/components/encabezado"
import { FormularioVisita } from "@/components/visita/formulario-visita"

export const metadata: Metadata = { title: "Nueva visita · Visita con Plan" }

export default function NuevaVisitaPage() {
  return (
    <>
      <Encabezado titulo="Nueva visita" volverA="/" />
      <main className="mx-auto max-w-2xl px-4 pt-6">
        <FormularioVisita />
      </main>
    </>
  )
}
