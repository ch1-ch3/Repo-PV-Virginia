"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Loader2, LocateFixed, MapPin, MapPinOff, Sparkles, Timer } from "lucide-react"
import { useBorrador } from "@/components/datos/borrador"
import { analizarVisita, usePunto } from "@/components/datos/cliente"
import { distanciaMetros, useUbicacion, type EstadoUbicacion } from "@/components/datos/ubicacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/components/utils"
import { EstadoAnalisis } from "./estado-analisis"
import { PasoEntrevista } from "./paso-entrevista"
import { PasoFotos } from "./paso-fotos"

export function Visita({ puntoId, paso }: { puntoId: string | null; paso: 1 | 2 }) {
  const router = useRouter()
  const { data: punto } = usePunto(puntoId)
  const { borrador, actualizar, descartar } = useBorrador(puntoId ?? "fuera-de-ruta")
  const { ubicacion, pedir: pedirUbicacion } = useUbicacion()
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const base = `/visita/nueva${puntoId ? `?punto=${encodeURIComponent(puntoId)}&` : "?"}`
  const volverAlDetalle = puntoId ? `/puntos/${encodeURIComponent(puntoId)}` : "/"

  const respondidas = Object.values(borrador.respuestas).filter((v) => v !== null && v !== undefined).length
  const puedeAnalizar = borrador.fotos.length > 0 || respondidas > 0

  async function analizar() {
    if (!puedeAnalizar || analizando) return
    setAnalizando(true)
    setError(null)
    try {
      const ficha = await analizarVisita({
        puntoId,
        nombre: puntoId ? null : borrador.nombre.trim() || null,
        fotos: borrador.fotos.map((f) => ({ tipo: f.tipo, archivo: f.archivo })),
        noVende: borrador.noVende,
        respuestas: borrador.respuestas,
        zona: borrador.zona,
        ubicacion: ubicacion.estado === "ok" ? { lat: ubicacion.lat, lng: ubicacion.lng } : null,
      })
      router.replace(`/comercio/${encodeURIComponent(ficha.id)}`)
      descartar()
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo analizar")
      setAnalizando(false)
    }
  }

  if (analizando) return <EstadoAnalisis cantidadFotos={borrador.fotos.length} />

  return (
    <div className="flex flex-col gap-4 pb-32">
      <Pasos paso={paso} />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Reloj inicio={borrador.inicio} />
      </div>
      <TarjetaUbicacion ubicacion={ubicacion} pedir={pedirUbicacion} punto={punto ?? null} />

      {!puntoId && paso === 1 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-sm font-semibold">
            Nombre del comercio <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Input
            id="nombre"
            value={borrador.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            placeholder="Ej.: Almacén Don Tito"
            autoComplete="off"
            enterKeyHint="done"
          />
        </div>
      )}

      {paso === 1 ? (
        <PasoFotos borrador={borrador} actualizar={actualizar} />
      ) : (
        <PasoEntrevista borrador={borrador} actualizar={actualizar} zonaAnterior={punto?.categoria_actual?.zona ?? null} />
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}. Tus fotos y respuestas siguen acá: probá de nuevo.
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-1.5 px-4">
          <div className="flex gap-2">
            {paso === 1 ? (
              <Button asChild variant="outline" size="lg" className="px-4">
                <Link href={volverAlDetalle}>
                  <ArrowLeft aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">{puntoId ? "Detalle" : "Salir"}</span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="px-4" onClick={() => router.replace(`${base}paso=1`)}>
                <ArrowLeft aria-hidden="true" />
                Fotos
              </Button>
            )}
            {paso === 1 ? (
              <Button size="lg" className="flex-1" onClick={() => router.push(`${base}paso=2`)}>
                {borrador.fotos.length === 0 ? "Seguir sin fotos" : "Siguiente: entrevista"}
                <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button size="lg" className="flex-1" onClick={analizar} disabled={!puedeAnalizar}>
                <Sparkles aria-hidden="true" />
                Analizar
              </Button>
            )}
          </div>
          {paso === 2 && !puedeAnalizar && (
            <p className="text-center text-xs text-muted-foreground">Sacá al menos una foto o respondé una pregunta para analizar.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Pasos({ paso }: { paso: 1 | 2 }) {
  const nombres = ["Fotos", "Entrevista", "Resultado"]
  return (
    <ol className="flex items-center gap-1.5" aria-label="Pasos de la visita">
      {nombres.map((n, i) => {
        const activo = i + 1 === paso
        const hecho = i + 1 < paso
        return (
          <li key={n} className="flex flex-1 flex-col gap-1" aria-current={activo ? "step" : undefined}>
            <span className={cn("h-1.5 rounded-full", activo || hecho ? "bg-primary" : "bg-border")} />
            <span className={cn("text-xs", activo ? "font-semibold text-primary" : "text-muted-foreground")}>
              {i + 1}. {n}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Reloj({ inicio }: { inicio: number }) {
  const [ahora, setAhora] = useState(inicio)
  useEffect(() => {
    setAhora(Date.now())
    const t = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const seg = Math.max(0, Math.floor((ahora - inicio) / 1000))
  const pasado = seg > 15 * 60
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 font-mono", pasado && "text-destructive")}>
      <Timer className="size-3.5" aria-hidden="true" />
      {String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")} / 15:00
    </span>
  )
}

function TarjetaUbicacion({
  ubicacion,
  pedir,
  punto,
}: {
  ubicacion: EstadoUbicacion
  pedir: () => void
  punto: { lat: number; lng: number; nombre: string } | null
}) {
  if (ubicacion.estado === "ok") {
    const distancia = punto ? distanciaMetros(ubicacion, punto) : null
    const lejos = distancia !== null && distancia > 300
    return (
      <div className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm", lejos ? "bg-warning text-warning-foreground" : "bg-accent text-accent-foreground")}>
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          <span className="font-medium">Ubicación capturada</span>
          <span className="opacity-80"> · ±{ubicacion.precision} m</span>
          {distancia !== null && (
            <span className="block text-xs">
              {lejos
                ? `Estás a ${distancia >= 1000 ? `${(distancia / 1000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} km` : `${distancia} m`} de ${punto!.nombre}. ¿Es el comercio correcto?`
                : `Estás en ${punto!.nombre} (a ${distancia} m).`}
            </span>
          )}
        </p>
        {ubicacion.precision > 100 && (
          <button type="button" onClick={pedir} className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold underline">
            Afinar
          </button>
        )}
      </div>
    )
  }
  if (ubicacion.estado === "buscando")
    return (
      <p className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Buscando tu ubicación…
      </p>
    )
  const ayuda = {
    inactiva: "Activá la ubicación para registrar dónde está el comercio.",
    denegada: "El permiso de ubicación está bloqueado. Tocá el candado o el ícono de la barra de direcciones → Permisos → Ubicación → Permitir, y después Reintentar.",
    "no-disponible": "No se pudo obtener la ubicación. Revisá que el GPS del celular esté prendido y reintentá.",
    "no-segura": "La ubicación solo funciona en una dirección segura (https). Abrí la app desde Vercel.",
  }[ubicacion.estado]
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card px-3 py-2.5 text-sm">
      <p className="flex gap-2 text-muted-foreground">
        <MapPinOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          {ayuda}
          {punto && <span className="block text-xs">Si no, se usa la dirección del punto de venta.</span>}
        </span>
      </p>
      {ubicacion.estado !== "no-segura" && (
        <Button variant="outline" onClick={pedir} className="w-full">
          <LocateFixed aria-hidden="true" />
          {ubicacion.estado === "inactiva" ? "Activar ubicación" : "Reintentar ubicación"}
        </Button>
      )}
    </div>
  )
}
