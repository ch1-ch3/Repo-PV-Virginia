"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronRight, MapPin, Plus, Search } from "lucide-react"
import { usePuntos } from "@/components/datos/cliente"
import { ETIQUETA_FORMATO, ETIQUETA_NSE, haceCuanto } from "@/components/datos/formato"
import type { PuntoDeVenta } from "@/components/datos/tipos"
import { BarraMix } from "@/components/ficha/barra-mix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"

const FILTROS = [
  { id: "todos", texto: "Todos", filtra: () => true },
  { id: "pendientes", texto: "Por visitar", filtra: (p: PuntoDeVenta) => !p.visitado_hoy },
  { id: "nuevos", texto: "Nuevos", filtra: (p: PuntoDeVenta) => p.estado === "nuevo" },
  { id: "clientes", texto: "Clientes", filtra: (p: PuntoDeVenta) => p.estado === "cliente" },
] as const

export function ListaPuntos() {
  const { data: puntos, error, isLoading, mutate } = usePuntos()
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todos")
  const [busqueda, setBusqueda] = useState("")

  const lista = (puntos ?? [])
    .filter(FILTROS.find((f) => f.id === filtro)!.filtra)
    .filter((p) => `${p.nombre} ${p.direccion}`.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => a.orden - b.orden)
  const visitados = (puntos ?? []).filter((p) => p.visitado_hoy).length
  const proximo = (puntos ?? []).filter((p) => !p.visitado_hoy).sort((a, b) => a.orden - b.orden)[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-success uppercase">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" /> Jornada activa · Rosario Sur
        </p>
        <h1 className="text-2xl font-semibold text-balance">Mis puntos de venta</h1>
        {puntos && (
          <p className="text-sm text-muted-foreground">
            {puntos.length} asignados hoy · {visitados} visitados · {puntos.length - visitados} por visitar
          </p>
        )}
      </div>

      {proximo && filtro !== "clientes" && !busqueda && (
        <Link
          href={`/puntos/${proximo.id}`}
          className="flex items-center gap-3 rounded-xl bg-primary p-4 text-primary-foreground shadow-sm hover:bg-primary-pressed"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wide text-amarillo uppercase">Próxima parada · #{proximo.orden}</p>
            <p className="truncate text-lg font-semibold">{proximo.nombre}</p>
            <p className="truncate text-sm text-primary-foreground/80">{proximo.direccion}</p>
          </div>
          <span className="rounded-lg bg-amarillo px-3 py-2 text-sm font-bold text-primary">Ver</span>
        </Link>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="buscar" className="sr-only">
          Buscar comercio
        </label>
        <input
          id="buscar"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o dirección"
          className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filtrar puntos">
        {FILTROS.map((f) => {
          const cantidad = (puntos ?? []).filter(f.filtra).length
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium",
                filtro === f.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
              )}
            >
              {f.texto}
              <span className={cn("rounded-full px-1.5 text-xs", filtro === f.id ? "bg-white/20" : "bg-muted")}>{cantidad}</span>
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-card p-6 text-center">
          <p className="font-semibold text-destructive">No se pudo cargar la ruta</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button variant="outline" onClick={() => mutate()}>
            Reintentar
          </Button>
        </div>
      ) : isLoading ? (
        <ul className="flex flex-col gap-3" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-24 animate-pulse rounded-xl bg-card" />
          ))}
        </ul>
      ) : lista.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          No hay puntos con ese filtro.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {lista.map((p) => (
            <li key={p.id}>
              <TarjetaPunto punto={p} />
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/visita/nueva"
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-card p-4 text-sm font-medium text-primary hover:bg-secondary"
      >
        <Plus className="size-4" aria-hidden="true" />
        Caracterizar un comercio que no está en la ruta
      </Link>
    </div>
  )
}

function TarjetaPunto({ punto: p }: { punto: PuntoDeVenta }) {
  const cat = p.categoria_actual
  return (
    <Link
      href={`/puntos/${p.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          p.visitado_hoy ? "bg-success text-white" : p.estado === "cliente" ? "bg-primary text-white" : "bg-gama-economica text-white",
        )}
        aria-label={p.visitado_hoy ? "Visitado hoy" : `Parada ${p.orden}`}
      >
        {p.visitado_hoy ? <CheckCircle2 className="size-4" aria-hidden="true" /> : p.orden}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate font-semibold">{p.nombre}</h2>
        </div>
        <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {p.direccion}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {p.visitado_hoy ? (
            <Badge variant="success">Caracterizado hoy</Badge>
          ) : p.estado === "nuevo" && !cat ? (
            <Badge variant="outline">Nuevo · sin caracterizar</Badge>
          ) : null}
          {cat && (
            <Badge>
              {ETIQUETA_FORMATO[cat.formato]} · NSE {ETIQUETA_NSE[cat.nse].toLowerCase()} · {haceCuanto(cat.fecha)}
            </Badge>
          )}
        </div>
        {p.mix_actual && (
          <div className="max-w-48 pt-0.5">
            <BarraMix porcentajes={p.mix_actual} conLeyenda={false} />
          </div>
        )}
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}
