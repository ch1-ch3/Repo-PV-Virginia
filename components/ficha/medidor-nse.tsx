import { ETIQUETA_NSE, formatearPuntaje } from "@/components/datos/formato"
import type { NivelNSE } from "@/components/datos/tipos"

// Escala −1..+1 con las zonas de la guía: bajo ≤ −0,3 · medio · alto ≥ +0,3.
export function MedidorNSE({ puntaje, nivel }: { puntaje: number | null; nivel: NivelNSE }) {
  const pos = puntaje === null ? 50 : ((Math.max(-1, Math.min(1, puntaje)) + 1) / 2) * 100
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xl font-semibold text-primary">
          NSE {ETIQUETA_NSE[nivel].toLowerCase()}
          {puntaje !== null && <span className="ml-2 font-mono text-base text-muted-foreground">{formatearPuntaje(puntaje)}</span>}
        </p>
      </div>
      <div className="relative h-3 rounded-full" role="img" aria-label={`Puntaje ${puntaje ?? "sin dato"} en escala de −1 a +1`}>
        <div className="absolute inset-0 flex overflow-hidden rounded-full">
          <div className="h-full bg-gama-economica/50" style={{ width: "35%" }} />
          <div className="h-full bg-gama-media/40" style={{ width: "30%" }} />
          <div className="h-full bg-gama-premium/40" style={{ width: "35%" }} />
        </div>
        {puntaje !== null && (
          <div
            className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary shadow"
            style={{ left: `${pos}%` }}
          />
        )}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>−1 bajo</span>
        <span>0</span>
        <span>+1 alto</span>
      </div>
    </div>
  )
}
