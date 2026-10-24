"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, ListChecks, Map as IconoMapa, MessageCircle, Tags } from "lucide-react"
import { useSesion } from "@/components/datos/sesion"
import { cn } from "@/components/utils"

type Props = {
  titulo?: string
  subtitulo?: string // si no se pasa, muestra el vendedor
  volverA?: string // si está, muestra el botón de volver (siempre a una ruta fija, no al historial)
  textoVolver?: string
}

const SECCIONES = [
  { href: "/", texto: "Puntos", Icono: ListChecks, activa: (p: string) => p === "/" || p.startsWith("/puntos") || p.startsWith("/visita") },
  { href: "/mapa", texto: "Mapa", Icono: IconoMapa, activa: (p: string) => p.startsWith("/mapa") },
  { href: "/asistente", texto: "Asistente", Icono: MessageCircle, activa: (p: string) => p.startsWith("/asistente") || p.startsWith("/comercio") },
  { href: "/precios", texto: "Precios", Icono: Tags, activa: (p: string) => p.startsWith("/precios") },
]

export function Encabezado({ titulo, subtitulo, volverA, textoVolver = "Volver" }: Props) {
  const ruta = usePathname()
  const router = useRouter()
  const { sesion } = useSesion()

  // Login solo visual: sin sesión en este navegador, al login.
  useEffect(() => {
    if (sesion === null) router.replace("/login")
  }, [sesion, router])

  const vendedor = sesion ? `${sesion.nombre} · Vendedor ${sesion.zona}` : ""

  return (
    <header className="sticky top-0 z-20 bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-1.5 px-2">
        {volverA && (
          <Link
            href={volverA}
            className="flex h-11 shrink-0 items-center gap-1 rounded-lg px-1.5 text-sm font-medium hover:bg-primary-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarillo"
            aria-label={textoVolver}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">{textoVolver}</span>
          </Link>
        )}
        <Link href="/" className="flex shrink-0 items-center px-1" aria-label="La Virginia · Inicio">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático del logo */}
          <img src="/la-virginia.svg" alt="La Virginia" width={56} height={35} className="h-[35px] w-14 rounded-md" />
        </Link>
        <span className="flex-1" />
        <nav aria-label="Principal" className="flex items-center text-sm font-medium">
          {SECCIONES.map(({ href, texto, Icono, activa }) => {
            const actual = activa(ruta)
            return (
              <Link
                key={href}
                href={href}
                aria-label={texto}
                aria-current={actual ? "page" : undefined}
                className={cn(
                  "flex h-11 min-w-10 items-center justify-center gap-1.5 rounded-lg px-2 hover:bg-primary-pressed",
                  actual && "bg-primary-pressed text-amarillo",
                )}
              >
                <Icono className="size-[18px]" aria-hidden="true" />
                <span className="hidden md:inline">{texto}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      {/* Segunda fila: el título a todo el ancho para que no se corte en el celular. */}
      <div className="mx-auto flex h-11 max-w-2xl flex-col justify-center px-4">
        <p className="truncate text-base leading-tight font-semibold">{titulo ?? "Visita con Plan"}</p>
        <p className="truncate text-xs leading-tight text-primary-foreground/75">{subtitulo ?? vendedor}</p>
      </div>
    </header>
  )
}
