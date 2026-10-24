import { CloudOff } from "lucide-react"

export function AvisoEjemplo({ texto = "Sin conexión con el servidor: mostrando datos de ejemplo." }: { texto?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 rounded-lg bg-warning px-3 py-2 text-sm text-warning-foreground">
      <CloudOff className="size-4 shrink-0" aria-hidden="true" />
      {texto}
    </p>
  )
}
