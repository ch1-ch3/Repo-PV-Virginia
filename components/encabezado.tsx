import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
  titulo?: string
  volverA?: string
}

export function Encabezado({ titulo, volverA }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
        {volverA ? (
          <Link
            href={volverA}
            className="-ml-2 flex size-11 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="Volver"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden="true"
          >
            LV
          </span>
        )}
        <p className="flex-1 truncate text-base font-semibold">{titulo ?? "Visita con Plan"}</p>
        <nav aria-label="Principal" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-muted">
            Comercios
          </Link>
          <Link href="/precios" className="rounded-lg px-3 py-2 hover:bg-muted">
            Precios
          </Link>
        </nav>
      </div>
    </header>
  )
}
