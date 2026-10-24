"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { preguntarAlAsistente } from "@/components/datos/cliente"
import type { FichaComercio, MensajeChat } from "@/components/datos/tipos"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { cn } from "@/components/utils"

const SUGERENCIAS = [
  "¿Qué le digo si dice que no tiene lugar?",
  "¿Cómo le gano a la competencia?",
  "Achicá el pedido a la mitad",
]

export function ChatFicha({ ficha }: { ficha: FichaComercio }) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function enviar(pregunta: string) {
    const limpio = pregunta.trim()
    if (!limpio || enviando) return
    const historial: MensajeChat[] = [...mensajes, { rol: "vendedor", texto: limpio }]
    setMensajes([...historial, { rol: "asistente", texto: "" }])
    setTexto("")
    setEnviando(true)
    await preguntarAlAsistente(ficha, historial, (parcial) =>
      setMensajes([...historial, { rol: "asistente", texto: parcial }]),
    )
    setEnviando(false)
  }

  return (
    <Card aria-labelledby="titulo-chat">
      <CardTitle id="titulo-chat">Repreguntar</CardTitle>

      {mensajes.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              className="rounded-full border bg-background px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <ol className="flex flex-col gap-2" aria-live="polite">
          {mensajes.map((m, i) => (
            <li
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-base leading-relaxed whitespace-pre-wrap",
                m.rol === "vendedor" ? "self-end bg-foreground text-background" : "self-start bg-muted",
              )}
            >
              <span className="sr-only">{m.rol === "vendedor" ? "Vos: " : "Asistente: "}</span>
              {m.texto || <Loader2 className="size-4 animate-spin" aria-label="Pensando" />}
            </li>
          ))}
        </ol>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          enviar(texto)
        }}
      >
        <label htmlFor="pregunta" className="sr-only">
          Escribí tu pregunta
        </label>
        <input
          id="pregunta"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
          }}
          placeholder="Preguntá sobre este comercio…"
          enterKeyHint="send"
          className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <Button type="submit" size="icon" className="size-12" disabled={enviando || !texto.trim()} aria-label="Enviar">
          <Send aria-hidden="true" />
        </Button>
      </form>
    </Card>
  )
}
