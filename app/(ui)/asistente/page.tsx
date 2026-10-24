import type { Metadata } from "next"
import { ListaAsistente } from "@/components/asistente/lista-asistente"
import { Encabezado } from "@/components/encabezado"

export const metadata: Metadata = { title: "Asistente · Visita con Plan" }

export default function AsistentePage() {
  return (
    <>
      <Encabezado titulo="Asistente" volverA="/" textoVolver="Mis puntos" />
      <main className="mx-auto max-w-2xl px-4 pt-5 pb-12">
        <ListaAsistente />
      </main>
    </>
  )
}
