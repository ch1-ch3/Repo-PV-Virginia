import type { Metadata } from "next"
import { Encabezado } from "@/components/encabezado"
import { MapaRuta } from "@/components/mapa/mapa-ruta"

export const metadata: Metadata = { title: "Mapa de ruta · Visita con Plan" }

export default function MapaPage() {
  return (
    <>
      <Encabezado titulo="Mapa de ruta" volverA="/" textoVolver="Mis puntos" />
      <main className="mx-auto max-w-2xl px-4 pt-5 pb-12">
        <MapaRuta />
      </main>
    </>
  )
}
