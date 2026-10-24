"use client"

import Link from "next/link"
import { ChevronRight, MessageCircle } from "lucide-react"
import { useComercios } from "@/components/datos/cliente"
import { ETIQUETA_FORMATO, ETIQUETA_NSE, formatearFecha, haceCuanto, nombreComercio } from "@/components/datos/formato"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export function ListaAsistente() {
  const { data: fichas, error, isLoading } = useComercios()
  const hoy = new Date().toDateString()
  const deHoy = (fichas ?? []).filter((f) => new Date(f.creado).toDateString() === hoy)
  const anteriores = (fichas ?? []).filter((f) => new Date(f.creado).toDateString() !== hoy)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Asistente</h1>
        <p className="text-sm text-muted-foreground">
          Elegí un comercio y preguntá: el asistente conoce su categoría, el mix recomendado y los precios relevados.
        </p>
      </div>

      <Card className="bg-secondary">
        <p className="flex gap-2 text-sm text-secondary-foreground">
          <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ejemplos: “¿Con qué arranco?”, “¿Por qué quedó en nivel bajo?”, “¿Qué le digo si no tiene lugar?”
        </p>
      </Card>

      {error ? (
        <p className="rounded-xl bg-card p-6 text-center text-destructive">{error.message}</p>
      ) : isLoading ? (
        <div className="h-48 animate-pulse rounded-xl bg-card" />
      ) : (
        <>
          <Grupo titulo="Visitas de hoy" fichas={deHoy} vacio="Todavía no visitaste comercios hoy. Arrancá desde Mis puntos." />
          <Grupo titulo="Visitas anteriores" fichas={anteriores} vacio="Sin visitas anteriores." />
        </>
      )}
    </div>
  )
}

function Grupo({ titulo, fichas, vacio }: { titulo: string; fichas: NonNullable<ReturnType<typeof useComercios>["data"]>; vacio: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{titulo}</h2>
      {fichas.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-4 text-center text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {fichas.map((f) => (
            <li key={f.id}>
              <Link
                href={`/comercio/${encodeURIComponent(f.id)}?tab=asistente`}
                className="flex items-center gap-3 rounded-xl border bg-card p-3.5 hover:border-primary/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{nombreComercio(f)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatearFecha(f.creado, true)} · {haceCuanto(f.creado)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge>
                      {ETIQUETA_FORMATO[f.formato.formato]} · NSE {ETIQUETA_NSE[f.nse.nivel].toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
