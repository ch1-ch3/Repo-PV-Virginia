import type { Metadata } from "next"
import { FormularioLogin } from "@/components/login/formulario-login"

export const metadata: Metadata = { title: "Ingresar · Visita con Plan" }

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-primary px-4 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center text-primary-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático del logo */}
          <img src="/la-virginia.svg" alt="La Virginia" width={240} height={150} className="h-auto w-60 rounded-2xl shadow-lg" />
          <h1 className="text-3xl font-semibold">Visita con Plan</h1>
          <p className="text-sm text-primary-foreground/80">Fotos y 7 preguntas al dueño: categoría y mix en menos de un minuto.</p>
        </div>
        <FormularioLogin />
        <p className="text-center text-sm text-primary-foreground/80">Vendedor · Zona Rosario Sur</p>
      </div>
    </main>
  )
}
