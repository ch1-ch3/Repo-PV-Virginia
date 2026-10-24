"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { useSesion } from "@/components/datos/sesion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FormularioLogin() {
  const router = useRouter()
  const { iniciar } = useSesion()
  const [usuario, setUsuario] = useState("martin")
  const [clave, setClave] = useState("demo")
  const [error, setError] = useState<string | null>(null)

  function ingresar(e: React.FormEvent) {
    e.preventDefault()
    const limpio = usuario.trim()
    if (!limpio || !clave) {
      setError("Completá usuario y contraseña.")
      return
    }
    // Demo: cualquier usuario entra. El nombre se muestra en la app.
    iniciar(limpio.charAt(0).toUpperCase() + limpio.slice(1))
    router.replace("/")
  }

  return (
    <form onSubmit={ingresar} className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="usuario" className="text-sm font-semibold">
          Usuario
        </label>
        <Input id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="username" autoCapitalize="none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="clave" className="text-sm font-semibold">
          Contraseña
        </label>
        <Input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" variant="amarillo">
        <LogIn aria-hidden="true" />
        Ingresar
      </Button>
      <p className="text-center text-xs text-muted-foreground">Acceso de demostración · cualquier usuario ingresa</p>
    </form>
  )
}
