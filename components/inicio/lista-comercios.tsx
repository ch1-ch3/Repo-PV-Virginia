"use client"

import Link from "next/link"
import { Camera, ChevronRight } from "lucide-react"
import { AvisoEjemplo } from "@/components/aviso-ejemplo"
import { useComercios } from "@/components/datos/cliente"
import { ETIQUETA_NSE, ETIQUETA_TAMANO, ETIQUETA_TIPO, formatearFecha, nombreComercio } from "@/components/datos/formato"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ListaComercios() {
  const { fichas, origen, isLoading } = useComercios()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-balance">Comercios visitados</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando…" : `${fichas.length} ${fichas.length === 1 ? "comercio" : "comercios"}`}
          </p>
        </div>
      </div>

      {origen === "ejemplo" && <AvisoEjemplo />}

      {isLoading ? (
        <ul className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </ul>
      ) : fichas.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center">
          <p className="font-semibold">Todavía no hay visitas</p>
          <p className="text-sm text-muted-foreground">Tocá “Nueva visita” y sacá fotos del comercio.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {fichas.map((ficha) => (
            <li key={ficha.id}>
              <Link
                href={`/comercio/${encodeURIComponent(ficha.id)}`}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="truncate text-lg font-semibold">{nombreComercio(ficha)}</h2>
                    <time dateTime={ficha.creado} className="shrink-0 text-sm text-muted-foreground">
                      {formatearFecha(ficha.creado)}
                    </time>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>
                      {ETIQUETA_TIPO[ficha.formato.tipo]} · {ETIQUETA_TAMANO[ficha.formato.tamano].toLowerCase()}
                    </Badge>
                    <Badge variant="outline">NSE {ETIQUETA_NSE[ficha.nse.nivel].toLowerCase()}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{ficha.resumen}</p>
                </div>
                <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto max-w-2xl px-4">
          <Button asChild size="lg" className="w-full shadow-lg">
            <Link href="/visita/nueva">
              <Camera aria-hidden="true" />
              Nueva visita
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
