import Link from "next/link"
import { ArrowLeft, ListChecks, Tags } from "lucide-react"

type Props = {
  titulo?: string
  subtitulo?: string
  volverA?: string // si está, muestra el botón de volver (siempre a una ruta fija, no al historial)
  textoVolver?: string
}

export function Encabezado({ titulo, subtitulo, volverA, textoVolver = "Volver" }: Props) {
  return (
    <header className="sticky top-0 z-20 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3">
        {volverA ? (
          <Link
            href={volverA}
            className="flex h-11 shrink-0 items-center gap-1 rounded-lg pr-2 pl-1 text-sm font-medium hover:bg-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarillo"
            aria-label={textoVolver}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">{textoVolver}</span>
          </Link>
        ) : (
          <Link href="/" className="flex shrink-0 items-center gap-2 pr-1" aria-label="Inicio">
            <span className="flex size-8 items-center justify-center rounded-md bg-amarillo text-sm font-black text-primary">LV</span>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base leading-tight font-semibold">{titulo ?? "Visita con Plan"}</p>
          {subtitulo && <p className="truncate text-xs leading-tight text-primary-foreground/75">{subtitulo}</p>}
        </div>
        <nav aria-label="Principal" className="flex items-center gap-0.5 text-sm font-medium">
          <Link href="/" className="flex h-11 items-center gap-1.5 rounded-lg px-2.5 hover:bg-primary-pressed">
            <ListChecks className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Puntos</span>
          </Link>
          <Link href="/precios" className="flex h-11 items-center gap-1.5 rounded-lg px-2.5 hover:bg-primary-pressed">
            <Tags className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Precios</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}
