"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Camera, Check, ClipboardCopy, Lightbulb, MapPin, MessageCircle, Star, TriangleAlert, User } from "lucide-react"
import { nombreLinea } from "@/lib/etiquetas"
import { AvisoEjemplo } from "@/components/aviso-ejemplo"
import { usePrecios, useFicha } from "@/components/datos/cliente"
import {
  ETIQUETA_ESTADO_PRECIO,
  ETIQUETA_FORMATO,
  ETIQUETA_GAMA,
  ETIQUETA_NSE,
  ETIQUETA_PRODUCTO_CLAVE,
  ETIQUETA_TIPO,
  ETIQUETA_ZONA,
  formatearFecha,
  formatearPrecio,
  formatearPuntaje,
  nombreComercio,
} from "@/components/datos/formato"
import type { FichaComercio, Gama } from "@/components/datos/tipos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"
import { BarraMix, COLOR_GAMA } from "./barra-mix"
import { ChatFicha } from "./chat-ficha"
import { MedidorNSE } from "./medidor-nse"

export type Pestana = "categoria" | "mix" | "asistente"

export function VistaFicha({ id, pestanaInicial = "categoria" }: { id: string; pestanaInicial?: Pestana }) {
  const { data: ficha, error, isLoading } = useFicha(id)
  const [pestana, setPestana] = useState<Pestana>(pestanaInicial)

  if (isLoading && !ficha) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
        ))}
      </div>
    )
  }
  if (!ficha) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <p className="font-semibold">{error?.message ?? "No encontramos esta ficha"}</p>
        <Button asChild variant="outline">
          <Link href="/">Volver a mis puntos</Link>
        </Button>
      </div>
    )
  }

  function ir(p: Pestana) {
    setPestana(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col gap-4 pb-28">
      {ficha.origen === "demo" && (
        <AvisoEjemplo
          texto={
            // Las visitas precargadas (data/fichas-demo.json) tienen id "demo-…".
            ficha.id.startsWith("demo-")
              ? "Visita de ejemplo precargada para la demo."
              : "Análisis sin IA (no hay clave del modelo o falló): la categoría sale de las respuestas del dueño y las reglas."
          }
        />
      )}

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-balance">{nombreComercio(ficha)}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={ficha.creado}>{formatearFecha(ficha.creado, true)}</time>
          <span>
            {ficha.fotos_analizadas} {ficha.fotos_analizadas === 1 ? "foto" : "fotos"} · {ficha.nse.respondidas} datos de NSE
          </span>
          {ficha.ubicacion && (
            <a
              className="inline-flex items-center gap-1 underline underline-offset-2"
              href={`https://www.google.com/maps?q=${ficha.ubicacion.lat},${ficha.ubicacion.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin className="size-3.5" aria-hidden="true" /> Mapa
            </a>
          )}
        </p>
      </header>

      <div className="flex gap-3 rounded-xl bg-primary p-4 text-primary-foreground">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-amarillo" aria-hidden="true" />
        <p className="text-base leading-relaxed font-medium text-pretty">{ficha.resumen}</p>
      </div>

      <Recategorizacion ficha={ficha} />

      <div className="sticky top-14 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-card p-1 shadow-sm" role="tablist">
          {(
            [
              ["categoria", "Categoría"],
              ["mix", "Mix"],
              ["asistente", "Asistente"],
            ] as [Pestana, string][]
          ).map(([p, texto]) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={pestana === p}
              onClick={() => ir(p)}
              className={cn(
                "h-10 rounded-lg text-sm font-semibold",
                pestana === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      {pestana === "categoria" && (
        <>
          <Formato ficha={ficha} />
          <Nse nse={ficha.nse} />
          <Gondola gondola={ficha.gondola} />
          <PreciosClave ficha={ficha} />
          {ficha.competencia.length > 0 && <Competencia competencia={ficha.competencia} />}
          {ficha.checklist_fotos_faltantes.length > 0 && <ParaLaProxima items={ficha.checklist_fotos_faltantes} />}
        </>
      )}
      {pestana === "mix" && <MixRecomendado ficha={ficha} />}
      {pestana === "asistente" && <ChatFicha ficha={ficha} />}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2 px-4">
          <Button asChild variant="outline" size="lg" className="flex-1 px-3">
            <Link href="/">Terminar visita</Link>
          </Button>
          {pestana === "categoria" && (
            <Button size="lg" className="flex-1 px-3" onClick={() => ir("mix")}>
              Ver mix <ArrowRight aria-hidden="true" />
            </Button>
          )}
          {pestana === "mix" && (
            <Button size="lg" className="flex-1 px-3" onClick={() => ir("asistente")}>
              <MessageCircle aria-hidden="true" /> Preguntar
            </Button>
          )}
          {pestana === "asistente" && (
            <Button size="lg" className="flex-1 px-3" onClick={() => ir("mix")}>
              Volver al mix
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Recategorizacion({ ficha }: { ficha: FichaComercio }) {
  const r = ficha.recategorizacion
  if (!r) return null
  if (!r.antes)
    return <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">Primera caracterización de este comercio.</p>
  const texto = (c: NonNullable<typeof r.antes>) =>
    `${ETIQUETA_FORMATO[c.formato]} · NSE ${ETIQUETA_NSE[c.nse].toLowerCase()}${c.puntaje !== null ? ` (${formatearPuntaje(c.puntaje)})` : ""}`
  return (
    <div className={cn("flex flex-col gap-2 rounded-xl border bg-card p-3", r.cambio && "border-oro")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Actualización de perfil</p>
        <Badge variant={r.cambio ? "oro" : "success"}>{r.cambio ? "Cambio sugerido" : "Se mantiene"}</Badge>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">Antes: {texto(r.antes)}</span>
        <ArrowRight className="mx-1.5 inline size-4 text-muted-foreground" aria-label="pasa a" />
        <strong>Ahora: {texto(r.ahora)}</strong>
      </p>
    </div>
  )
}

function Formato({ ficha }: { ficha: FichaComercio }) {
  const f = ficha.formato
  const z = ficha.zona
  const datos: [string, string][] = [
    ["Cajas", f.cajas_estimadas === null ? "Sin dato" : String(f.cajas_estimadas)],
    ["Góndolas", f.gondolas_estimadas === null ? "Sin dato" : String(f.gondolas_estimadas)],
    ["Otros locales", f.sucursales === null ? "Sin dato" : f.sucursales === 0 ? "No" : f.sucursales >= 2 ? "2 o más" : "1"],
    ["Zona", z.confirmada ? ETIQUETA_ZONA[z.confirmada] : z.sugerida ? `${ETIQUETA_ZONA[z.sugerida]} (sugerida)` : "Sin dato"],
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formato</CardTitle>
        <span className="text-xs text-muted-foreground">{ETIQUETA_TIPO[f.tipo]}</span>
      </CardHeader>
      <p className="text-xl font-semibold">{ETIQUETA_FORMATO[f.formato]}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {datos.map(([dt, dd]) => (
          <div key={dt} className="rounded-lg bg-muted p-2">
            <dt className="text-muted-foreground">{dt}</dt>
            <dd className="font-semibold">{dd}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm leading-relaxed text-muted-foreground">{f.justificacion}</p>
      {z.sugerida && z.confirmada && z.sugerida !== z.confirmada && (
        <p className="text-sm text-muted-foreground">
          La IA sugería zona {ETIQUETA_ZONA[z.sugerida].toLowerCase()}; quedó la que marcaste vos. {z.evidencia}
        </p>
      )}
    </Card>
  )
}

function Nse({ nse }: { nse: FichaComercio["nse"] }) {
  const respondidos = nse.criterios.filter((c) => c.valor !== null)
  const sinDato = nse.criterios.filter((c) => c.valor === null)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nivel socioeconómico</CardTitle>
        <span className="text-xs text-muted-foreground">Regla de la guía · umbral ±0,3</span>
      </CardHeader>
      <MedidorNSE puntaje={nse.puntaje} nivel={nse.nivel} />
      <p className="text-sm">{nse.explicacion}</p>
      {(nse.pedir_otra_foto || nse.conflicto_foto_dueno) && (
        <p className="flex gap-2 rounded-lg bg-warning px-3 py-2 text-sm text-warning-foreground">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {nse.conflicto_foto_dueno
            ? "Lo que se ve en góndola no coincide con lo que dice el dueño: queda en medio. Revisalo en la próxima visita."
            : "Hay pocos datos: sacá una foto más de góndola o completá preguntas para afinar el nivel."}
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {respondidos.map((c) => (
          <Criterio key={c.id} c={c} />
        ))}
      </ul>
      {sinDato.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer py-1 font-medium text-primary">{sinDato.length} criterios sin dato (no cuentan)</summary>
          <ul className="flex flex-col gap-1.5 pt-1.5">
            {sinDato.map((c) => (
              <Criterio key={c.id} c={c} />
            ))}
          </ul>
        </details>
      )}
    </Card>
  )
}

function Criterio({ c }: { c: FichaComercio["nse"]["criterios"][number] }) {
  const Icono = c.fuente === "foto" ? Camera : User
  return (
    <li className="flex items-center gap-2.5 rounded-lg bg-muted px-2.5 py-2">
      <Icono className="size-4 shrink-0 text-muted-foreground" aria-label={c.fuente === "foto" ? "Foto" : "Dueño"} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{c.etiqueta}</p>
        <p className="text-xs text-muted-foreground">{c.evidencia}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold",
          c.valor === null && "bg-background text-muted-foreground",
          c.valor === -1 && "bg-gama-economica text-white",
          c.valor === 0 && "bg-gama-media text-white",
          c.valor === 1 && "bg-gama-premium text-white",
        )}
      >
        {c.valor === null ? "—" : c.valor > 0 ? "+1" : c.valor === 0 ? "0" : "−1"}
      </span>
    </li>
  )
}

function Gondola({ gondola }: { gondola: FichaComercio["gondola"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de góndola</CardTitle>
        {gondola.estado && (
          <Badge variant={gondola.estado === "buena" ? "success" : gondola.estado === "regular" ? "warning" : "alerta"}>
            {gondola.estado === "buena" ? "Buena" : gondola.estado === "regular" ? "Regular" : "Mala"}
          </Badge>
        )}
      </CardHeader>
      {gondola.estado === null && gondola.observaciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin fotos de góndola: no se evaluó.</p>
      ) : (
        <>
          {gondola.variedad && <p className="text-sm">Variedad de surtido: <strong>{gondola.variedad}</strong></p>}
          <ul className="flex flex-col gap-1.5 text-sm leading-relaxed">
            {gondola.observaciones.map((obs) => (
              <li key={obs} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                {obs}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

function PreciosClave({ ficha }: { ficha: FichaComercio }) {
  const { data: comparador } = usePrecios(ficha.id)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Precios clave</CardTitle>
        <Link href="/precios" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <ul className="flex flex-col gap-4">
        {ficha.precios_clave.map((p, i) => {
          const ref = comparador?.find((c) => c.producto === p.producto)
          const otros = ref && ref.comercios.filter((c) => c.fichaId !== ficha.id).length
          const dif = ref && p.precio !== null && ref.mediana ? Math.round(((p.precio - ref.mediana) / ref.mediana) * 100) : null
          return (
            <li key={`${p.producto}-${i}`} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{ETIQUETA_PRODUCTO_CLAVE[p.producto]}</p>
                  {p.descripcion && p.estado !== "no_vende" && <p className="truncate text-xs text-muted-foreground">{p.descripcion}</p>}
                </div>
                {p.precio !== null ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("font-mono text-lg font-semibold", dif !== null && dif > 5 && "text-destructive")}>
                      {formatearPrecio(p.precio)}
                    </span>
                    {dif !== null && otros ? (
                      <Badge variant={dif > 5 ? "alerta" : dif < -5 ? "success" : "default"}>
                        {Math.abs(dif) <= 5 ? "En la mediana" : `${dif > 0 ? "+" : "−"}${Math.abs(dif)} % vs mediana`}
                      </Badge>
                    ) : null}
                  </div>
                ) : (
                  <span className="shrink-0 text-sm text-muted-foreground">{ETIQUETA_ESTADO_PRECIO[p.estado]}</span>
                )}
              </div>
              {p.precio !== null && ref && otros ? <Rango precio={p.precio} min={ref.minimo} med={ref.mediana} max={ref.maximo} criterio={ref.criterio} n={ref.comercios.length} /> : null}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function Rango({ precio, min, med, max, criterio, n }: { precio: number; min: number; med: number; max: number; criterio: string; n: number }) {
  const lo = Math.min(min, precio)
  const hi = Math.max(max, precio)
  const pos = (v: number) => (hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100)
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-2 rounded-full bg-muted">
        <span className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-muted-foreground" style={{ left: `${pos(med)}%` }} aria-hidden="true" />
        <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white" style={{ left: `${pos(precio)}%` }} aria-hidden="true" />
      </div>
      <p className="flex justify-between text-[11px] text-muted-foreground">
        <span>Mín {formatearPrecio(min)}</span>
        <span>Mediana {formatearPrecio(med)} · {n} comercios {criterio === "similares" ? "similares" : ""}</span>
        <span>Máx {formatearPrecio(max)}</span>
      </p>
    </div>
  )
}

function Competencia({ competencia }: { competencia: FichaComercio["competencia"] }) {
  return (
    <Card>
      <CardTitle>Competencia en góndola</CardTitle>
      <ul className="flex flex-col divide-y">
        {competencia.map((c) => (
          <li key={`${c.marca}-${c.categoria}`} className="flex flex-col gap-0.5 py-2">
            <p>
              <span className="font-semibold">{c.marca}</span> <span className="text-sm text-muted-foreground">· {c.categoria}</span>
            </p>
            <p className="text-sm text-muted-foreground">{c.observacion}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ParaLaProxima({ items }: { items: string[] }) {
  return (
    <Card className="bg-secondary">
      <CardTitle className="text-secondary-foreground">Para afinar en la próxima visita</CardTitle>
      <ul className="flex flex-col gap-1 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <Camera className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {i}
          </li>
        ))}
      </ul>
    </Card>
  )
}

const GAMAS: Gama[] = ["economica", "media", "premium"]

function MixRecomendado({ ficha }: { ficha: FichaComercio }) {
  const [copiado, setCopiado] = useState(false)
  const mix = ficha.mix

  async function copiar() {
    const lineas = GAMAS.flatMap((g) => {
      const prods = mix.productos.filter((p) => p.gama === g)
      return prods.length
        ? [`${ETIQUETA_GAMA[g]} (${mix.porcentajes[g]} %):`, ...prods.map((p) => `- ${p.nombre}${p.estado === "le_falta" ? " (le falta)" : ""}`)]
        : []
    })
    try {
      await navigator.clipboard.writeText([`Mix recomendado · ${nombreComercio(ficha)}`, ...lineas].join("\n"))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Mix recomendado</CardTitle>
        <BarraMix porcentajes={mix.porcentajes} grande />
        <p className="text-sm text-muted-foreground">
          Calculado con puntaje {formatearPuntaje(mix.puntaje_usado)} · {mix.total_productos} productos para{" "}
          {ETIQUETA_FORMATO[ficha.formato.formato].toLowerCase()}
          {ficha.gondola.variedad === "baja" ? " (achicado por poca variedad en góndola)" : ""}.
        </p>
      </Card>

      {ficha.ofrecer_primero.length > 0 && (
        <section aria-labelledby="titulo-ofrecer" className="flex flex-col gap-2.5">
          <h2 id="titulo-ofrecer" className="flex items-center gap-1.5 text-lg font-semibold">
            <Star className="size-5 text-oro" aria-hidden="true" /> Ofrecer primero
          </h2>
          <ol className="flex flex-col gap-2.5">
            {ficha.ofrecer_primero.map((o, i) => (
              <li key={o.material} className="flex flex-col gap-2 rounded-xl border-t-4 border-oro bg-card p-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{i + 1}</span>
                  <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-bold text-white uppercase", COLOR_GAMA[o.gama])}>
                    {ETIQUETA_GAMA[o.gama]}
                  </span>
                </div>
                <p className="text-lg leading-snug font-semibold text-primary">{o.nombre}</p>
                <p className="rounded-lg bg-muted px-3 py-2 text-base leading-relaxed italic">“{o.argumento}”</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalle por gama</CardTitle>
          <span className="text-xs text-muted-foreground">
            {mix.productos.filter((p) => p.estado === "ya_tiene").length} ya tiene · {mix.productos.filter((p) => p.estado === "le_falta").length} le faltan
          </span>
        </CardHeader>
        {GAMAS.map((g) => {
          const prods = mix.productos.filter((p) => p.gama === g)
          if (!prods.length) return null
          return (
            <details key={g} open className="group">
              <summary className="flex cursor-pointer items-center gap-2 py-1.5 font-semibold">
                <span className={cn("size-3 rounded-sm", COLOR_GAMA[g])} aria-hidden="true" />
                {ETIQUETA_GAMA[g]} · {mix.porcentajes[g]} %
                <span className="text-sm font-normal text-muted-foreground">({prods.length})</span>
              </summary>
              <ul className="flex flex-col divide-y pb-2">
                {prods.map((p) => (
                  <li key={p.material} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground capitalize">{nombreLinea(p.linea)}</p>
                    </div>
                    {p.estado === "ya_tiene" ? (
                      <Badge variant="success">
                        <Check aria-hidden="true" /> Ya tiene
                      </Badge>
                    ) : (
                      <Badge variant="warning">Le falta</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          )
        })}
        <Button variant="outline" onClick={copiar}>
          <ClipboardCopy aria-hidden="true" />
          {copiado ? "Copiado" : "Copiar mix"}
        </Button>
      </Card>
    </>
  )
}
