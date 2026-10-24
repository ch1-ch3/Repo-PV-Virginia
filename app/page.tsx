import { Encabezado } from "@/components/encabezado"
import { ListaPuntos } from "@/components/puntos/lista-puntos"

export default function InicioPage() {
  return (
    <>
      <Encabezado />
      <main className="mx-auto max-w-2xl px-4 pt-5 pb-12">
        <ListaPuntos />
      </main>
    </>
  )
}
