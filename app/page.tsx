import { Encabezado } from "@/components/encabezado"
import { ListaComercios } from "@/components/inicio/lista-comercios"

export default function InicioPage() {
  return (
    <>
      <Encabezado />
      <main className="mx-auto max-w-2xl px-4 pt-6 pb-32">
        <ListaComercios />
      </main>
    </>
  )
}
