"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { textoPedido } from "@/components/datos/formato"
import type { FichaComercio } from "@/components/datos/tipos"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"

export function PedidoSugerido({ ficha }: { ficha: FichaComercio }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoPedido(ficha))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <Card>
      <CardTitle>Pedido sugerido</CardTitle>
      <ul className="flex flex-col divide-y">
        {ficha.pedido_sugerido.map((item) => (
          <li key={item.producto} className="flex items-center justify-between gap-3 py-2.5">
            <span>{item.producto}</span>
            <span className="shrink-0 font-mono font-semibold">
              {item.cantidad} <span className="font-sans font-normal text-muted-foreground">{item.unidad}</span>
            </span>
          </li>
        ))}
      </ul>
      <Button size="lg" variant={copiado ? "secondary" : "outline"} className="w-full" onClick={copiar}>
        {copiado ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        <span aria-live="polite">{copiado ? "Pedido copiado" : "Copiar pedido"}</span>
      </Button>
    </Card>
  )
}
