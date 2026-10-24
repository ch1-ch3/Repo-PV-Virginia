import type { Metadata } from "next"
import { Encabezado } from "@/components/encabezado"
import { VistaFicha } from "@/components/ficha/vista-ficha"

export const metadata: Metadata = { title: "Ficha del comercio · Visita con Plan" }

export default async function ComercioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ origen?: string }>
}) {
  const { id } = await params
  const { origen } = await searchParams

  return (
    <>
      <Encabezado titulo="Ficha del comercio" volverA="/" />
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-12">
        <VistaFicha id={decodeURIComponent(id)} esEjemplo={origen === "ejemplo"} />
      </main>
    </>
  )
}
