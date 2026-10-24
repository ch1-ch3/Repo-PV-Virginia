"use client"

import Link from "next/link"
import { ArrowRight, Camera, ClipboardList, FileText, MapPin, MessageSquareQuote, Play, Receipt } from "lucide-react"
import { usePunto } from "@/components/datos/cliente"
import { ETIQUETA_FORMATO, ETIQUETA_NSE, ETIQUETA_ZONA, formatearFecha, formatearPuntaje, haceCuanto } from "@/components/datos/formato"
import { BarraMix } from "@/components/ficha/barra-mix"
import { MedidorNSE } from "@/components/ficha/medidor-nse"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export function DetallePunto({ id }: { id: string }) {
  const { data: p, error, isLoading } = usePunto(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    )
  }
  if (error || !p) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <p className="font-semibold">{error?.message ?? "No encontramos este punto de venta"}</p>
        <Button asChild variant="outline">
          <Link href="/">Volver a mis puntos</Link>
        </Button>
      </div>
    )
  }

  const cat = p.categoria_actual
  const desdeApp = !!p.ultima_ficha_id

  return (
    <div className="flex flex-col gap-4 pb-28">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={p.estado === "cliente" ? "primary" : "outline"}>{p.estado === "cliente" ? "Cliente" : "Nuevo"}</Badge>
          <span className="text-sm text-muted-foreground">Parada {p.orden} de la ruta</span>
          {cat?.zona && <Badge variant="oro">Zona {ETIQUETA_ZONA[cat.zona].toLowerCase()}</Badge>}
        </div>
        <h1 className="text-2xl font-semibold text-balance">{p.nombre}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <a
            className="inline-flex items-center gap-1 underline underline-offset-2"
            href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            {p.direccion}
          </a>
          {cat && <span>Última caracterización: {haceCuanto(cat.fecha)}</span>}
        </p>
      </header>

      {cat ? (
        <Card>
          <CardHeader>
            <CardTitle>Categoría actual</CardTitle>
            <span className="text-xs text-muted-foreground">
              {desdeApp ? `Visita del ${formatearFecha(cat.fecha)}` : `Cuestionario ${formatearFecha(cat.fecha)}`}
            </span>
          </CardHeader>
          <p className="text-lg font-semibold">{ETIQUETA_FORMATO[cat.formato]}</p>
          <MedidorNSE puntaje={cat.puntaje} nivel={cat.nse} />
          {!desdeApp && (
            <p className="rounded-lg bg-warning px-3 py-2 text-sm text-warning-foreground">
              Este dato tiene {haceCuanto(cat.fecha).replace("hace ", "")}. La visita de hoy lo actualiza.
            </p>
          )}
          {p.ultima_ficha_id && (
            <Link href={`/comercio/${p.ultima_ficha_id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <FileText className="size-4" aria-hidden="true" /> Ver ficha de la última visita
            </Link>
          )}
        </Card>
      ) : (
        <Card className="items-center border-dashed text-center">
          <ClipboardList className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold">Sin caracterización previa</p>
          <p className="text-sm text-muted-foreground">Con la visita de hoy queda categorizado y con su mix recomendado.</p>
        </Card>
      )}

      {p.mix_actual && (
        <Card>
          <CardTitle>Mix actual</CardTitle>
          <BarraMix porcentajes={p.mix_actual} grande />
        </Card>
      )}

      {p.observaciones && (
        <Card>
          <CardTitle className="flex items-center gap-1.5">
            <MessageSquareQuote className="size-4" aria-hidden="true" /> Observaciones
          </CardTitle>
          <p className="text-base leading-relaxed">“{p.observaciones}”</p>
        </Card>
      )}

      {p.ultimas_ventas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Receipt className="size-4" aria-hidden="true" /> Últimas ventas
            </CardTitle>
            <span className="text-xs text-muted-foreground">Datos de ejemplo</span>
          </CardHeader>
          <ul className="flex flex-col gap-3">
            {p.ultimas_ventas.map((v) => (
              <li key={v.fecha} className="rounded-lg bg-muted p-3">
                <p className="pb-1 text-sm font-semibold">{formatearFecha(v.fecha)}</p>
                <ul className="flex flex-col gap-0.5 text-sm">
                  {v.items.map((i) => (
                    <li key={i.material} className="flex justify-between gap-3">
                      <span className="truncate">{i.nombre}</span>
                      <span className="shrink-0 font-mono">{i.unidades} u</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="bg-secondary">
        <CardTitle className="text-secondary-foreground">Cómo sigue la visita (≈ 3 min)</CardTitle>
        <ol className="flex flex-col gap-2 text-sm">
          <li className="flex gap-2">
            <Camera className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>Fotos:</strong> las que puedas. Ninguna es obligatoria.
            </span>
          </li>
          <li className="flex gap-2">
            <ClipboardList className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>7 preguntas al dueño</strong> con un toque cada una.
            </span>
          </li>
          <li className="flex gap-2">
            <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <strong>Resultado:</strong> categoría
              {cat ? ` (comparada con ${ETIQUETA_FORMATO[cat.formato]} · NSE ${ETIQUETA_NSE[cat.nse].toLowerCase()} ${cat.puntaje !== null ? formatearPuntaje(cat.puntaje) : ""})` : ""}, mix
              y qué ofrecer primero.
            </span>
          </li>
        </ol>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2 px-4">
          <Button asChild variant="outline" size="lg" className="px-4">
            <Link href="/">Volver</Link>
          </Button>
          <Button asChild size="lg" className="flex-1">
            <Link href={`/visita/nueva?punto=${encodeURIComponent(p.id)}`}>
              <Play aria-hidden="true" />
              {cat ? "Iniciar visita" : "Caracterizar comercio"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
