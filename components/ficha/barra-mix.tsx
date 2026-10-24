import { ETIQUETA_GAMA } from "@/components/datos/formato"
import type { Gama } from "@/components/datos/tipos"
import { cn } from "@/components/utils"

const GAMAS: Gama[] = ["economica", "media", "premium"]
export const COLOR_GAMA: Record<Gama, string> = {
  economica: "bg-gama-economica",
  media: "bg-gama-media",
  premium: "bg-gama-premium",
}

export function BarraMix({
  porcentajes,
  grande = false,
  conLeyenda = true,
}: {
  porcentajes: Record<Gama, number>
  grande?: boolean
  conLeyenda?: boolean
}) {
  const texto = GAMAS.map((g) => `${ETIQUETA_GAMA[g]} ${porcentajes[g]} %`).join(", ")
  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn("flex w-full overflow-hidden rounded-full bg-muted", grande ? "h-6" : "h-2.5")}
        role="img"
        aria-label={`Mix: ${texto}`}
      >
        {GAMAS.filter((g) => porcentajes[g] > 0).map((g) => (
          <div
            key={g}
            className={cn("flex items-center justify-center text-xs font-bold text-white", COLOR_GAMA[g])}
            style={{ width: `${porcentajes[g]}%` }}
          >
            {grande && porcentajes[g] >= 9 ? `${porcentajes[g]}%` : null}
          </div>
        ))}
      </div>
      {conLeyenda && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {GAMAS.map((g) => (
            <li key={g} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-sm", COLOR_GAMA[g])} aria-hidden="true" />
              {ETIQUETA_GAMA[g]} <span className="font-semibold text-foreground">{porcentajes[g]} %</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
