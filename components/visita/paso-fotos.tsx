"use client"

import { useRef } from "react"
import { Camera, CheckCircle2, ImagePlus, RefreshCw, Trash2 } from "lucide-react"
import type { Borrador } from "@/components/datos/borrador"
import { FOTOS_VISITA } from "@/components/datos/formato"
import type { TipoFoto } from "@/components/datos/tipos"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/utils"

export const MAX_FOTOS = 10

type Props = {
  borrador: Borrador
  actualizar: (cambio: Partial<Borrador> | ((b: Borrador) => Partial<Borrador>)) => void
}

export function PasoFotos({ borrador, actualizar }: Props) {
  const camara = useRef<HTMLInputElement>(null)
  const galeria = useRef<HTMLInputElement>(null)
  const destino = useRef<TipoFoto>("otra")
  const lleno = borrador.fotos.length >= MAX_FOTOS

  function abrir(tipo: TipoFoto, desde: "camara" | "galeria") {
    destino.current = tipo
    ;(desde === "camara" ? camara : galeria).current?.click()
  }

  function agregar(lista: FileList | null) {
    if (!lista?.length) return
    const archivos = Array.from(lista).filter((a) => a.type.startsWith("image/"))
    const tipo = destino.current
    if (!archivos.length) return
    actualizar((b) => {
      let fotos = b.fotos
      if (tipo === "otra") {
        const lugar = MAX_FOTOS - fotos.length
        fotos = [...fotos, ...archivos.slice(0, lugar).map((archivo) => nueva("otra", archivo))]
      } else {
        // Un casillero = una foto: si ya había, se reemplaza.
        const previa = fotos.find((f) => f.tipo === tipo)
        if (previa) URL.revokeObjectURL(previa.url)
        fotos = [...fotos.filter((f) => f.tipo !== tipo), nueva(tipo, archivos[0])]
      }
      return { fotos }
    })
  }

  function quitar(id: string) {
    actualizar((b) => {
      const foto = b.fotos.find((f) => f.id === id)
      if (foto) URL.revokeObjectURL(foto.url)
      return { fotos: b.fotos.filter((f) => f.id !== id) }
    })
  }

  function alternarNoVende(producto: NonNullable<(typeof FOTOS_VISITA)[number]["producto"]>, tipo: TipoFoto) {
    actualizar((b) => {
      const marcado = b.noVende.includes(producto)
      const previa = b.fotos.find((f) => f.tipo === tipo)
      if (!marcado && previa) URL.revokeObjectURL(previa.url)
      return {
        noVende: marcado ? b.noVende.filter((p) => p !== producto) : [...b.noVende, producto],
        fotos: marcado ? b.fotos : b.fotos.filter((f) => f.tipo !== tipo),
      }
    })
  }

  const otras = borrador.fotos.filter((f) => f.tipo === "otra")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Fotos del comercio</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sacá las que puedas, <strong className="text-foreground">ninguna es obligatoria</strong>. Si no vende leche, aceite o
          papel, marcalo y seguí. Cuantas más góndolas, mejor la categoría.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
        <span className="font-medium" aria-live="polite">
          {borrador.fotos.length} {borrador.fotos.length === 1 ? "foto" : "fotos"}
          {borrador.noVende.length > 0 && ` · ${borrador.noVende.length} sin vender`}
        </span>
        <Button size="sm" variant="outline" onClick={() => abrir("otra", "galeria")} disabled={lleno}>
          <ImagePlus aria-hidden="true" />
          Cargar varias
        </Button>
      </div>

      <ul className="flex flex-col gap-2.5">
        {FOTOS_VISITA.map((slot) => {
          const foto = borrador.fotos.find((f) => f.tipo === slot.tipo)
          const noVende = slot.producto ? borrador.noVende.includes(slot.producto) : false
          return (
            <li
              key={slot.tipo}
              className={cn("flex gap-3 rounded-xl border bg-card p-3", foto && "border-success/40", noVende && "bg-muted")}
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- vista previa local de un blob
                  <img src={foto.url} alt={slot.titulo} className="size-full object-cover" />
                ) : (
                  <button
                    type="button"
                    onClick={() => abrir(slot.tipo, "camara")}
                    disabled={noVende || lleno}
                    className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground disabled:opacity-40"
                    aria-label={`Sacar foto: ${slot.titulo}`}
                  >
                    <Camera className="size-6" aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {foto && <CheckCircle2 className="size-4 text-success" aria-label="Cargada" />}
                  <p className={cn("font-semibold", noVende && "text-muted-foreground line-through")}>{slot.titulo}</p>
                  <Badge variant={slot.sugerida ? "primary" : "default"} className="text-xs">
                    {slot.sugerida ? "Sugerida" : "Opcional"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{slot.ayuda}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                  {foto ? (
                    <>
                      <button type="button" onClick={() => abrir(slot.tipo, "camara")} className="inline-flex h-9 items-center gap-1 text-sm font-medium text-primary">
                        <RefreshCw className="size-3.5" aria-hidden="true" /> Cambiar
                      </button>
                      <button type="button" onClick={() => quitar(foto.id)} className="inline-flex h-9 items-center gap-1 text-sm font-medium text-destructive">
                        <Trash2 className="size-3.5" aria-hidden="true" /> Quitar
                      </button>
                    </>
                  ) : (
                    !noVende && (
                      <>
                        <button type="button" onClick={() => abrir(slot.tipo, "camara")} disabled={lleno} className="inline-flex h-9 items-center gap-1 text-sm font-medium text-primary disabled:opacity-40">
                          <Camera className="size-3.5" aria-hidden="true" /> Sacar foto
                        </button>
                        <button type="button" onClick={() => abrir(slot.tipo, "galeria")} disabled={lleno} className="inline-flex h-9 items-center gap-1 text-sm font-medium text-primary disabled:opacity-40">
                          <ImagePlus className="size-3.5" aria-hidden="true" /> Galería
                        </button>
                      </>
                    )
                  )}
                  {slot.producto && (
                    <label className="inline-flex h-9 cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={noVende}
                        onChange={() => alternarNoVende(slot.producto!, slot.tipo)}
                        className="size-4 accent-primary"
                      />
                      No lo vende
                    </label>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {otras.length > 0 && (
        <section aria-labelledby="titulo-otras" className="flex flex-col gap-2">
          <h3 id="titulo-otras" className="text-sm font-semibold">
            Otras fotos ({otras.length})
          </h3>
          <ul className="grid grid-cols-4 gap-2">
            {otras.map((f, i) => (
              <li key={f.id} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local de un blob */}
                <img src={f.url} alt={`Otra foto ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => quitar(f.id)}
                  className="absolute top-1 right-1 flex size-8 items-center justify-center rounded-full bg-foreground/75 text-background"
                  aria-label={`Quitar otra foto ${i + 1}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {lleno && <p className="text-sm text-muted-foreground">Llegaste al máximo de {MAX_FOTOS} fotos.</p>}

      <input
        ref={camara}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          agregar(e.target.files)
          e.target.value = ""
        }}
      />
      <input
        ref={galeria}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          agregar(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

function nueva(tipo: TipoFoto, archivo: File) {
  return { id: crypto.randomUUID(), tipo, archivo, url: URL.createObjectURL(archivo) }
}
