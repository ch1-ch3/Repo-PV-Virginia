"use client"

import { calcularNSE, MINIMO_RESPUESTAS, PREGUNTAS_DUENO } from "@/lib/nse"
import type { Borrador } from "@/components/datos/borrador"
import { ETIQUETA_NSE, ETIQUETA_ZONA, formatearPuntaje } from "@/components/datos/formato"
import type { ValorNSE, Zona } from "@/components/datos/tipos"
import { cn } from "@/components/utils"

type Props = {
  borrador: Borrador
  actualizar: (cambio: Partial<Borrador> | ((b: Borrador) => Partial<Borrador>)) => void
  zonaAnterior: Zona | null
}

const ZONAS: Zona[] = ["vulnerable", "media", "acomodada"]

export function PasoEntrevista({ borrador, actualizar, zonaAnterior }: Props) {
  const respuestas = borrador.respuestas
  const tocadas = PREGUNTAS_DUENO.filter((p) => p.id in respuestas).length
  const previa = calcularNSE([], respuestas)

  function responder(id: (typeof PREGUNTAS_DUENO)[number]["id"], valor: ValorNSE) {
    actualizar((b) => {
      const nuevas = { ...b.respuestas }
      // Tocar de nuevo la misma opción la desmarca.
      if (id in nuevas && nuevas[id] === valor) delete nuevas[id]
      else nuevas[id] = valor
      return { respuestas: nuevas }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">7 preguntas rápidas al dueño</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Un toque por pregunta, de charla. Si no sabe, “No sé” y seguí: ninguna es obligatoria.
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1.5 text-center text-sm font-semibold text-secondary-foreground">
          {tocadas}/7
        </span>
      </div>

      <ol className="flex flex-col gap-2.5">
        {PREGUNTAS_DUENO.map((p, i) => {
          const elegido = p.id in respuestas ? respuestas[p.id] : undefined
          return (
            <li key={p.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3">
              <p className="flex gap-2 font-medium">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {i + 1}
                </span>
                {p.pregunta}
              </p>
              <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label={p.pregunta}>
                {([-1, 0, 1, null] as ValorNSE[]).map((v) => {
                  const activo = elegido === v
                  return (
                    <button
                      key={String(v)}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      onClick={() => responder(p.id, v)}
                      className={cn(
                        "min-h-12 rounded-lg border px-1.5 py-2 text-sm leading-tight font-medium transition-colors",
                        activo
                          ? v === null
                            ? "border-muted-foreground bg-muted-foreground text-white"
                            : "border-primary bg-primary text-primary-foreground"
                          : "bg-background hover:bg-secondary",
                        v === null && !activo && "text-muted-foreground",
                      )}
                    >
                      {v === null ? "No sé" : p.opciones[v + 1]}
                    </button>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>

      <section aria-labelledby="titulo-zona" className="flex flex-col gap-2 rounded-xl border bg-card p-3">
        <h3 id="titulo-zona" className="font-medium">
          ¿Cómo ves la zona?
        </h3>
        <p className="text-sm text-muted-foreground">
          {zonaAnterior
            ? `La última vez quedó como ${ETIQUETA_ZONA[zonaAnterior].toLowerCase()}. Confirmá o cambiá.`
            : "Opcional: si no lo marcás, la IA lo sugiere con la foto de fachada."}
        </p>
        <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Zona">
          {ZONAS.map((z) => {
            const activo = borrador.zona === z
            return (
              <button
                key={z}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => actualizar({ zona: activo ? null : z })}
                className={cn(
                  "min-h-12 rounded-lg border text-sm font-medium",
                  activo ? "border-oro bg-oro text-white" : "bg-background hover:bg-secondary",
                  !activo && zonaAnterior === z && "border-oro/60",
                )}
              >
                {ETIQUETA_ZONA[z]}
              </button>
            )
          })}
        </div>
      </section>

      <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-secondary-foreground" aria-live="polite">
        {previa.puntaje === null ? (
          <>Respondé algunas preguntas para ver una primera lectura del nivel socioeconómico.</>
        ) : (
          <>
            <strong>Solo con el dueño:</strong> puntaje {formatearPuntaje(previa.puntaje)} → NSE{" "}
            {ETIQUETA_NSE[previa.nivel].toLowerCase()}.{" "}
            {previa.respondidas < MINIMO_RESPUESTAS
              ? `Con menos de ${MINIMO_RESPUESTAS} datos queda en medio; las fotos suman señales.`
              : "Las fotos de góndola lo ajustan al analizar."}
          </>
        )}
      </p>
    </div>
  )
}
