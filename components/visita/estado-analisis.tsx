"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/components/utils"

const PASOS = [
  "Subiendo fotos",
  "Reconociendo formato y tamaño",
  "Leyendo señales de nivel socioeconómico",
  "Revisando góndola y surtido La Virginia",
  "Registrando precios clave",
  "Armando pedido sugerido",
]

export function EstadoAnalisis({ cantidadFotos }: { cantidadFotos: number }) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    const intervalo = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(intervalo)
  }, [])

  const pasoActual = Math.min(Math.floor(segundos / 5), PASOS.length - 1)

  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-6" role="status" aria-live="polite">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-primary">Analizando {cantidadFotos} {cantidadFotos === 1 ? "foto" : "fotos"}</p>
        <h1 className="text-2xl font-bold text-balance">Armando la ficha del comercio</h1>
        <p className="text-sm text-muted-foreground">
          Suele tardar menos de un minuto · <span className="font-mono">{segundos}s</span>
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.min(95, (segundos / 45) * 100)}%` }}
        />
      </div>

      <ol className="flex flex-col gap-3">
        {PASOS.map((paso, i) => {
          const hecho = i < pasoActual
          const activo = i === pasoActual
          return (
            <li
              key={paso}
              className={cn("flex items-center gap-3 text-base", !hecho && !activo && "text-muted-foreground/60")}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border",
                  hecho && "border-success bg-success text-success-foreground",
                  activo && "border-primary text-primary",
                )}
              >
                {hecho ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : activo ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : null}
              </span>
              <span className={cn(activo && "font-semibold")}>{paso}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
