"use client"

import Link from "next/link"
import { AvisoEjemplo } from "@/components/aviso-ejemplo"
import { useComercios } from "@/components/datos/cliente"
import { ETIQUETA_PRECIO, formatearPrecio, nombreComercio } from "@/components/datos/formato"
import type { FichaComercio } from "@/components/datos/tipos"
import { cn } from "@/components/utils"

type ProductoClave = FichaComercio["precios_clave"][number]["producto"]
const COLUMNAS: ProductoClave[] = ["papel_higienico", "aceite", "leche"]

export function TablaPrecios() {
  const { fichas, origen, isLoading } = useComercios()

  const filas = fichas.map((ficha) => ({
    ficha,
    precios: Object.fromEntries(
      COLUMNAS.map((col) => [col, ficha.precios_clave.find((p) => p.producto === col) ?? null]),
    ) as Record<ProductoClave, FichaComercio["precios_clave"][number] | null>,
  }))

  const extremos = Object.fromEntries(
    COLUMNAS.map((col) => {
      const valores = filas.map((f) => f.precios[col]?.precio).filter((v): v is number => typeof v === "number")
      return [col, valores.length > 1 ? { min: Math.min(...valores), max: Math.max(...valores) } : null]
    }),
  ) as Record<ProductoClave, { min: number; max: number } | null>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-balance">Comparador de precios</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Precios relevados en cada visita. <span className="font-medium text-success">Verde</span> = más barato,{" "}
          <span className="font-medium text-primary">rojo</span> = más caro.
        </p>
      </div>

      {origen === "ejemplo" && <AvisoEjemplo />}

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-muted" aria-busy="true" />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">Precios de productos clave por comercio</caption>
            <thead>
              <tr className="border-b bg-muted text-sm">
                <th scope="col" className="sticky left-0 bg-muted px-3 py-3 font-semibold">
                  Comercio
                </th>
                {COLUMNAS.map((col) => (
                  <th key={col} scope="col" className="px-3 py-3 text-right font-semibold">
                    {ETIQUETA_PRECIO[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map(({ ficha, precios }) => (
                <tr key={ficha.id} className="border-b last:border-b-0">
                  <th scope="row" className="sticky left-0 max-w-40 bg-card px-3 py-3 font-medium">
                    <Link
                      href={`/comercio/${encodeURIComponent(ficha.id)}`}
                      className="line-clamp-2 underline-offset-2 hover:underline"
                    >
                      {nombreComercio(ficha)}
                    </Link>
                  </th>
                  {COLUMNAS.map((col) => {
                    const dato = precios[col]
                    const rango = extremos[col]
                    const precio = dato?.precio ?? null
                    const esMin = rango && precio === rango.min
                    const esMax = rango && precio === rango.max
                    return (
                      <td key={col} className="px-3 py-3 text-right align-top">
                        {precio === null ? (
                          <span className="text-sm text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={cn(
                              "font-mono font-semibold",
                              esMin && "text-success",
                              esMax && "text-primary",
                            )}
                          >
                            {formatearPrecio(precio)}
                          </span>
                        )}
                        {dato && (
                          <span className="block truncate text-xs text-muted-foreground" title={dato.descripcion}>
                            {dato.descripcion}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-muted-foreground">“—” = el precio no se vio o no era legible en las fotos.</p>
    </div>
  )
}
