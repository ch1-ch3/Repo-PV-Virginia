"use client"

import Link from "next/link"
import { Check, MapPin, Plus } from "lucide-react"
import { AvisoEjemplo } from "@/components/aviso-ejemplo"
import { useFicha } from "@/components/datos/cliente"
import {
  ETIQUETA_GONDOLA,
  ETIQUETA_NSE,
  ETIQUETA_PRECIO,
  ETIQUETA_TAMANO,
  ETIQUETA_TIPO,
  formatearFecha,
  formatearPrecio,
  nombreComercio,
} from "@/components/datos/formato"
import type { FichaComercio } from "@/components/datos/tipos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatFicha } from "./chat-ficha"
import { PedidoSugerido } from "./pedido-sugerido"

export function VistaFicha({ id, esEjemplo }: { id: string; esEjemplo: boolean }) {
  const { ficha, isLoading } = useFicha(id)

  if (isLoading && !ficha) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!ficha) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">No encontramos este comercio</p>
        <Button asChild variant="outline">
          <Link href="/">Volver a la lista</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {esEjemplo && <AvisoEjemplo texto="No se pudo conectar con el análisis: esta es una ficha de ejemplo." />}

      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-balance">{nombreComercio(ficha)}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={ficha.creado}>{formatearFecha(ficha.creado, true)}</time>
            {ficha.ubicacion && (
              <a
                className="inline-flex items-center gap-1 underline underline-offset-2"
                href={`https://www.google.com/maps?q=${ficha.ubicacion.lat},${ficha.ubicacion.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin className="size-3.5" aria-hidden="true" />
                Ver en mapa
              </a>
            )}
          </p>
        </div>
        <p className="rounded-xl bg-primary p-4 text-base leading-relaxed text-primary-foreground text-pretty">
          {ficha.resumen}
        </p>
      </header>

      <OfrecerPrimero items={ficha.ofrecer_primero} />
      <PedidoSugerido ficha={ficha} />
      <Surtido surtido={ficha.surtido} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Formato formato={ficha.formato} />
        <Nse nse={ficha.nse} />
      </div>

      <Gondola gondola={ficha.gondola} />
      <PreciosClave precios={ficha.precios_clave} />
      <Competencia competencia={ficha.competencia} />

      <ChatFicha ficha={ficha} />
    </div>
  )
}

function OfrecerPrimero({ items }: { items: FichaComercio["ofrecer_primero"] }) {
  return (
    <Card className="border-primary/30">
      <CardTitle className="text-primary">Ofrecer primero</CardTitle>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={item.producto} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">{item.producto}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.argumento}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function Surtido({ surtido }: { surtido: FichaComercio["surtido"] }) {
  return (
    <Card>
      <CardTitle>Surtido La Virginia</CardTitle>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Le falta ({surtido.falta.length})</h3>
          {surtido.falta.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tiene el surtido completo.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {surtido.falta.map((item) => (
                <li key={item.producto} className="flex gap-2 rounded-lg bg-warning/60 p-3">
                  <Plus className="mt-0.5 size-4 shrink-0 text-warning-foreground" aria-hidden="true" />
                  <div className="flex flex-col gap-0.5">
                    <p className="font-medium">{item.producto}</p>
                    <p className="text-sm text-muted-foreground">{item.motivo}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">Tiene ({surtido.tiene.length})</h3>
          {surtido.tiene.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se vieron productos La Virginia.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {surtido.tiene.map((item) => (
                <li key={item.producto} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  <div className="flex flex-col">
                    <p>{item.producto}</p>
                    {item.observacion && <p className="text-sm text-muted-foreground">{item.observacion}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  )
}

function Formato({ formato }: { formato: FichaComercio["formato"] }) {
  return (
    <Card>
      <CardTitle>Formato y tamaño</CardTitle>
      <p className="text-xl font-semibold">
        {ETIQUETA_TIPO[formato.tipo]} {ETIQUETA_TAMANO[formato.tamano].toLowerCase()}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-muted p-2">
          <dt className="text-muted-foreground">Cajas</dt>
          <dd className="font-semibold">{formato.cajas_estimadas ?? "Sin dato"}</dd>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <dt className="text-muted-foreground">Góndola</dt>
          <dd className="font-semibold">
            {formato.metros_gondola_estimados !== null ? `${formato.metros_gondola_estimados} m` : "Sin dato"}
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-relaxed text-muted-foreground">{formato.justificacion}</p>
    </Card>
  )
}

function Nse({ nse }: { nse: FichaComercio["nse"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nivel socioeconómico</CardTitle>
        <span className="text-sm text-muted-foreground">Confianza {Math.round(nse.confianza * 100)}%</span>
      </CardHeader>
      <p className="text-xl font-semibold">{ETIQUETA_NSE[nse.nivel]}</p>
      <ul className="flex flex-col gap-1.5 text-sm leading-relaxed">
        {nse.senales.map((senal) => (
          <li key={senal} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
            {senal}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Gondola({ gondola }: { gondola: FichaComercio["gondola"] }) {
  const variante = gondola.estado === "buena" ? "success" : gondola.estado === "regular" ? "warning" : "primary"
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de góndola</CardTitle>
        <Badge variant={variante}>{ETIQUETA_GONDOLA[gondola.estado]}</Badge>
      </CardHeader>
      <ul className="flex flex-col gap-1.5 text-sm leading-relaxed">
        {gondola.observaciones.map((obs) => (
          <li key={obs} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
            {obs}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function PreciosClave({ precios }: { precios: FichaComercio["precios_clave"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precios clave</CardTitle>
        <Link href="/precios" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          Comparar
        </Link>
      </CardHeader>
      <ul className="flex flex-col divide-y">
        {precios.map((p, i) => (
          <li key={`${p.producto}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{ETIQUETA_PRECIO[p.producto]}</span>
              <span className="truncate text-sm text-muted-foreground">{p.descripcion}</span>
            </div>
            {p.precio === null ? (
              <span className="shrink-0 text-sm text-muted-foreground">No se ve</span>
            ) : (
              <span className="shrink-0 font-mono text-base font-semibold">{formatearPrecio(p.precio)}</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Competencia({ competencia }: { competencia: FichaComercio["competencia"] }) {
  return (
    <Card>
      <CardTitle>Competencia</CardTitle>
      {competencia.length === 0 ? (
        <p className="text-sm text-muted-foreground">No se vio competencia directa.</p>
      ) : (
        <ul className="flex flex-col divide-y">
          {competencia.map((c) => (
            <li key={`${c.marca}-${c.categoria}`} className="flex flex-col gap-0.5 py-2.5">
              <p>
                <span className="font-semibold">{c.marca}</span>{" "}
                <span className="text-sm text-muted-foreground">· {c.categoria}</span>
              </p>
              <p className="text-sm text-muted-foreground">{c.observacion}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
