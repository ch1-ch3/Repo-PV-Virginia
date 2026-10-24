"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Navigation, X } from "lucide-react"
import { usePuntos } from "@/components/datos/cliente"
import { ETIQUETA_FORMATO, ETIQUETA_NSE } from "@/components/datos/formato"
import type { PuntoDeVenta } from "@/components/datos/tipos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"

// Mapa sin dependencias: mosaicos de OpenStreetMap posicionados a mano (proyección Web Mercator).
const TILE = 256
const ALTO = 420

function aMundo(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom
  const rad = (lat * Math.PI) / 180
  return {
    x: ((lng + 180) / 360) * n * TILE,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n * TILE,
  }
}

function colorPin(p: PuntoDeVenta) {
  if (p.visitado_hoy) return "bg-success"
  return p.estado === "cliente" ? "bg-gama-premium" : "bg-gama-economica"
}

export function MapaRuta() {
  const { data: puntos, error, isLoading } = usePuntos()
  const caja = useRef<HTMLDivElement>(null)
  const [ancho, setAncho] = useState(360)
  const [elegido, setElegido] = useState<PuntoDeVenta | null>(null)

  useEffect(() => {
    if (!caja.current) return
    const obs = new ResizeObserver(([e]) => setAncho(Math.round(e.contentRect.width)))
    obs.observe(caja.current)
    return () => obs.disconnect()
  }, [puntos])

  if (error) return <p className="rounded-xl bg-card p-6 text-center text-destructive">{error.message}</p>
  if (isLoading || !puntos) return <div className="animate-pulse rounded-xl bg-card" style={{ height: ALTO }} />

  const ordenados = [...puntos].sort((a, b) => a.orden - b.orden)
  const lats = puntos.map((p) => p.lat)
  const lngs = puntos.map((p) => p.lng)
  const margen = 48
  // El zoom más cercano que muestra todos los puntos.
  let zoom = 17
  for (; zoom > 10; zoom--) {
    const a = aMundo(Math.max(...lats), Math.min(...lngs), zoom)
    const b = aMundo(Math.min(...lats), Math.max(...lngs), zoom)
    if (b.x - a.x <= ancho - margen * 2 && b.y - a.y <= ALTO - margen * 2) break
  }
  const centro = aMundo((Math.max(...lats) + Math.min(...lats)) / 2, (Math.max(...lngs) + Math.min(...lngs)) / 2, zoom)
  const origen = { x: centro.x - ancho / 2, y: centro.y - ALTO / 2 }

  const tiles: { x: number; y: number }[] = []
  for (let tx = Math.floor(origen.x / TILE); tx * TILE < origen.x + ancho; tx++)
    for (let ty = Math.floor(origen.y / TILE); ty * TILE < origen.y + ALTO; ty++) tiles.push({ x: tx, y: ty })

  const visitados = puntos.filter((p) => p.visitado_hoy).length
  const proximo = ordenados.find((p) => !p.visitado_hoy)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Mapa de ruta</h1>
        <p className="text-sm text-muted-foreground">
          {puntos.length} puntos en orden de visita · {visitados} visitados hoy. El orden lo define la ruta; el mapa es de referencia.
        </p>
      </div>

      <div ref={caja} className="relative overflow-hidden rounded-xl border bg-muted" style={{ height: ALTO }}>
        {tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element -- mosaicos de OpenStreetMap
          <img
            key={`${t.x}-${t.y}`}
            src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
            alt=""
            width={TILE}
            height={TILE}
            draggable={false}
            className="absolute max-w-none select-none"
            style={{ left: t.x * TILE - origen.x, top: t.y * TILE - origen.y }}
          />
        ))}
        {ordenados.map((p) => {
          const m = aMundo(p.lat, p.lng, zoom)
          const activo = elegido?.id === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setElegido(activo ? null : p)}
              aria-label={`${p.orden}. ${p.nombre}`}
              className={cn(
                "absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md",
                colorPin(p),
                activo && "z-10 size-10 ring-4 ring-amarillo",
                proximo?.id === p.id && !activo && "ring-2 ring-amarillo",
              )}
              style={{ left: m.x - origen.x, top: m.y - origen.y }}
            >
              {p.visitado_hoy ? <CheckCircle2 className="size-4" aria-hidden="true" /> : p.orden}
            </button>
          )
        })}
        <ul className="absolute top-2 left-2 flex flex-col gap-1 rounded-lg bg-card/95 px-2.5 py-2 text-xs shadow">
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gama-premium" /> Cliente</li>
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-gama-economica" /> Nuevo</li>
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-success" /> Visitado hoy</li>
        </ul>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="absolute right-1 bottom-1 rounded bg-card/90 px-1.5 text-[10px] text-muted-foreground"
        >
          © OpenStreetMap
        </a>

        {elegido && (
          <div className="absolute inset-x-2 bottom-6 z-20 flex flex-col gap-2 rounded-xl bg-card p-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground">Parada {elegido.orden}</p>
                <p className="truncate font-semibold">{elegido.nombre}</p>
                <p className="truncate text-sm text-muted-foreground">{elegido.direccion}</p>
              </div>
              <button type="button" onClick={() => setElegido(null)} className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted" aria-label="Cerrar">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {elegido.visitado_hoy && <Badge variant="success">Visitado hoy</Badge>}
              {elegido.categoria_actual ? (
                <Badge>
                  {ETIQUETA_FORMATO[elegido.categoria_actual.formato]} · NSE {ETIQUETA_NSE[elegido.categoria_actual.nse].toLowerCase()}
                </Badge>
              ) : (
                <Badge variant="outline">Nuevo · sin caracterizar</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="px-3">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${elegido.lat},${elegido.lng}`} target="_blank" rel="noreferrer">
                  <Navigation aria-hidden="true" /> Cómo llegar
                </a>
              </Button>
              <Button asChild className="flex-1">
                <Link href={`/puntos/${elegido.id}`}>Ver punto de venta</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <ol className="flex flex-col divide-y rounded-xl border bg-card">
        {ordenados.map((p) => (
          <li key={p.id}>
            <Link href={`/puntos/${p.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary">
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", colorPin(p))}>
                {p.visitado_hoy ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : p.orden}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{p.nombre}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.direccion}</span>
              </span>
              {proximo?.id === p.id && <Badge variant="oro">Próxima</Badge>}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
