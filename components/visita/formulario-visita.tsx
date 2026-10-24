"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, ImagePlus, Loader2, MapPin, MapPinOff, Sparkles, X } from "lucide-react"
import { analizarVisita } from "@/components/datos/cliente"
import type { FichaComercio } from "@/components/datos/tipos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EstadoAnalisis } from "./estado-analisis"

const MAX_FOTOS = 6

type Foto = { id: string; archivo: File; url: string }
type EstadoUbicacion =
  | { estado: "buscando" }
  | { estado: "ok"; valor: NonNullable<FichaComercio["ubicacion"]> }
  | { estado: "sin-permiso" | "no-disponible" }

export function FormularioVisita() {
  const router = useRouter()
  const [fotos, setFotos] = useState<Foto[]>([])
  const [nombre, setNombre] = useState("")
  const [ubicacion, setUbicacion] = useState<EstadoUbicacion>({ estado: "buscando" })
  const [analizando, setAnalizando] = useState(false)
  const inputCamara = useRef<HTMLInputElement>(null)
  const inputGaleria = useRef<HTMLInputElement>(null)
  const fotosRef = useRef(fotos)
  fotosRef.current = fotos

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setUbicacion({ estado: "no-disponible" })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion({ estado: "ok", valor: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (error) => setUbicacion({ estado: error.code === error.PERMISSION_DENIED ? "sin-permiso" : "no-disponible" }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.url)), [])

  function agregarFotos(lista: FileList | null) {
    if (!lista) return
    const nuevas = Array.from(lista)
      .filter((archivo) => archivo.type.startsWith("image/"))
      .slice(0, MAX_FOTOS - fotos.length)
      .map((archivo) => ({ id: crypto.randomUUID(), archivo, url: URL.createObjectURL(archivo) }))
    setFotos((prev) => [...prev, ...nuevas])
  }

  function quitarFoto(id: string) {
    setFotos((prev) => {
      const foto = prev.find((f) => f.id === id)
      if (foto) URL.revokeObjectURL(foto.url)
      return prev.filter((f) => f.id !== id)
    })
  }

  async function analizar() {
    if (fotos.length === 0 || analizando) return
    setAnalizando(true)
    const { ficha, origen } = await analizarVisita({
      fotos: fotos.map((f) => f.archivo),
      nombre: nombre.trim() || null,
      ubicacion: ubicacion.estado === "ok" ? ubicacion.valor : null,
    })
    router.push(`/comercio/${encodeURIComponent(ficha.id)}${origen === "ejemplo" ? "?origen=ejemplo" : ""}`)
  }

  const lleno = fotos.length >= MAX_FOTOS

  if (analizando) return <EstadoAnalisis cantidadFotos={fotos.length} />

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-balance">Nueva visita</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sacá de 1 a 6 fotos: góndolas, fachada y precios. La ficha se completa sola.
        </p>
      </div>

      <section aria-labelledby="titulo-fotos" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 id="titulo-fotos" className="font-semibold">
            Fotos
          </h2>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {fotos.length} de {MAX_FOTOS}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={() => inputCamara.current?.click()} disabled={lleno} className="h-20 flex-col gap-1">
            <Camera aria-hidden="true" />
            Sacar foto
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => inputGaleria.current?.click()}
            disabled={lleno}
            className="h-20 flex-col gap-1"
          >
            <ImagePlus aria-hidden="true" />
            Subir de galería
          </Button>
        </div>
        <input
          ref={inputCamara}
          type="file"
          accept="image/jpeg,image/png"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            agregarFotos(e.target.files)
            e.target.value = ""
          }}
        />
        <input
          ref={inputGaleria}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            agregarFotos(e.target.files)
            e.target.value = ""
          }}
        />

        {fotos.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {fotos.map((foto, i) => (
              <li key={foto.id} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local de un blob */}
                <img src={foto.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => quitarFoto(foto.id)}
                  className="absolute top-1 right-1 flex size-9 items-center justify-center rounded-full bg-foreground/75 text-background"
                  aria-label={`Quitar foto ${i + 1}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <label htmlFor="nombre" className="font-semibold">
          Nombre del comercio <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej.: Almacén Don Tito"
          autoComplete="off"
          enterKeyHint="done"
        />
      </div>

      <IndicadorUbicacion ubicacion={ubicacion} />

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <Button size="lg" className="w-full" onClick={analizar} disabled={fotos.length === 0}>
          <Sparkles aria-hidden="true" />
          Analizar {fotos.length > 0 ? `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}` : ""}
        </Button>
        {fotos.length === 0 && (
          <p className="pt-2 text-center text-sm text-muted-foreground">Agregá al menos una foto para analizar.</p>
        )}
      </div>
    </div>
  )
}

function IndicadorUbicacion({ ubicacion }: { ubicacion: EstadoUbicacion }) {
  const contenido = {
    buscando: { icono: <Loader2 className="size-4 animate-spin" aria-hidden="true" />, texto: "Buscando ubicación…" },
    ok: { icono: <MapPin className="size-4 text-success" aria-hidden="true" />, texto: "Ubicación capturada" },
    "sin-permiso": {
      icono: <MapPinOff className="size-4" aria-hidden="true" />,
      texto: "Sin permiso de ubicación: la visita se guarda igual.",
    },
    "no-disponible": {
      icono: <MapPinOff className="size-4" aria-hidden="true" />,
      texto: "Ubicación no disponible: la visita se guarda igual.",
    },
  }[ubicacion.estado]

  return (
    <p role="status" className="flex items-center gap-2 rounded-lg bg-muted px-3 py-3 text-sm">
      {contenido.icono}
      <span>
        {contenido.texto}
        {ubicacion.estado === "ok" && (
          <span className="font-mono text-muted-foreground">
            {" "}
            {ubicacion.valor.lat.toFixed(4)}, {ubicacion.valor.lng.toFixed(4)}
          </span>
        )}
      </span>
    </p>
  )
}
