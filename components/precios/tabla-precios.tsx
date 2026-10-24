"use client"

import Link from "next/link"
import { usePrecios } from "@/components/datos/cliente"
import { ETIQUETA_PRODUCTO_CLAVE, formatearFecha, formatearPrecio } from "@/components/datos/formato"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"

export function TablaPrecios() {
  const { data, error, isLoading, mutate } = usePrecios()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-balance">Comparador de precios</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Precios leídos en las fotos de cada visita. <span className="font-medium text-success">Verde</span> = más barato,{" "}
          <span className="font-medium text-destructive">rojo</span> = más caro. Los comercios que no venden el producto no cuentan.
        </p>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-card p-6 text-center">
          <p className="font-semibold text-destructive">{error.message}</p>
          <Button variant="outline" onClick={() => mutate()}>
            Reintentar
          </Button>
        </div>
      ) : isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-card" aria-busy="true" />
      ) : !data?.length ? (
        <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          Todavía no hay precios relevados.
        </p>
      ) : (
        data.map((p) => (
          <Card key={p.producto}>
            <CardHeader>
              <CardTitle>{ETIQUETA_PRODUCTO_CLAVE[p.producto]}</CardTitle>
              <span className="text-xs text-muted-foreground">
                Mediana <strong className="font-mono text-foreground">{formatearPrecio(p.mediana)}</strong> · {p.comercios.length}{" "}
                {p.comercios.length === 1 ? "comercio" : "comercios"}
              </span>
            </CardHeader>
            <ul className="flex flex-col divide-y">
              {[...p.comercios]
                .sort((a, b) => a.precio - b.precio)
                .map((c) => (
                  <li key={c.fichaId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <Link href={`/comercio/${encodeURIComponent(c.fichaId)}`} className="block truncate font-medium underline-offset-2 hover:underline">
                        {c.nombre ?? "Comercio sin nombre"}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.descripcion} · {formatearFecha(c.fecha)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono font-semibold",
                        p.comercios.length > 1 && c.precio === p.minimo && "text-success",
                        p.comercios.length > 1 && c.precio === p.maximo && "text-destructive",
                      )}
                    >
                      {formatearPrecio(c.precio)}
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        ))
      )}
    </div>
  )
}
