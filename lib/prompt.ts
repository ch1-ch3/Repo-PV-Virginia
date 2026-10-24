import { GUIA_PDV as guia } from "./guia"
import { catalogoParaPrompt } from "./catalogo"
import { ETIQUETA_FORMATO, ETIQUETA_GAMA, ETIQUETA_PRODUCTO_CLAVE, FOTOS_VISITA } from "./etiquetas"
import { CRITERIOS_FOTO } from "./nse"
import type { FichaComercio, ProductoClave, TipoFoto } from "./types"

export const PROMPT_SISTEMA = `Sos un analista comercial de La Virginia (café, té, mate cocido, especias, caldos) que acompaña a un
vendedor en la calle. El vendedor tiene 15 minutos por cliente: sé concreto y accionable. Español rioplatense, breve.

Regla de oro: NO INVENTES. Si algo no se ve en las fotos, devolvé null o una lista vacía. Un precio ilegible es null.
El nivel socioeconómico NO lo decidís vos: solo puntuás cada criterio con la evidencia que ves; el sistema calcula el nivel.

GUÍA DEL PUNTO DE VENTA (La Virginia):
${guia}

CATÁLOGO LA VIRGINIA (código exacto = nombre):
${catalogoParaPrompt()}`

const criteriosTexto = CRITERIOS_FOTO.map((c) => `- ${c.id}: ${c.etiqueta}. −1: ${c.bajo} · 0: ${c.medio} · +1: ${c.alto}`).join("\n")

export function pedidoExtraccion(opciones: {
  nombre: string | null
  tipos_fotos: TipoFoto[]
  no_vende: ProductoClave[]
}): string {
  const titulos = Object.fromEntries(FOTOS_VISITA.map((f) => [f.tipo, f.titulo])) as Record<TipoFoto, string>
  const fotos = opciones.tipos_fotos.map((t, i) => `Foto ${i + 1}: ${titulos[t] ?? "otra toma del local"}`).join("\n")
  const noVende = opciones.no_vende.map((p) => ETIQUETA_PRODUCTO_CLAVE[p]).join(", ")
  return `Fotos del comercio${opciones.nombre ? ` "${opciones.nombre}"` : ""}, en orden:
${fotos}
${noVende ? `El vendedor marcó que el comercio NO vende: ${noVende}. No busques ese precio.\n` : ""}
Criterios de góndola para el nivel socioeconómico (puntuá −1, 0, +1 o null si no se ve):
${criteriosTexto}

Devolvé SOLO un objeto JSON válido, sin texto extra:
{
  "formato": { "formato": ${Object.keys(ETIQUETA_FORMATO).map((f) => `"${f}"`).join("|")} | null, "cajas": number|null, "gondolas": number|null, "justificacion": string },
  "criterios_foto": [{ "id": "gaseosas_cerveza|vinos|papel_limpieza|premium_saludable|marcas_basicos|forma_venta|surtido|orden_carteles", "valor": -1|0|1|null, "evidencia": "qué viste, en pocas palabras" }],
  "gondola": { "estado": "buena|regular|mala"|null, "variedad": "baja|media|alta"|null, "observaciones": [string] },
  "tiene": [{ "material": "CÓDIGO EXACTO del catálogo que se ve en góndola", "observacion": string }],
  "competencia": [{ "marca": string, "categoria": string, "observacion": string }],
  "precios_clave": [{ "producto": "leche|aceite|papel_higienico|yerba|cafe|azucar|otro", "descripcion": "marca y presentación", "precio": number|null }],
  "zona": { "sugerida": "vulnerable|media|acomodada"|null, "evidencia": "qué se ve de la fachada y la cuadra" },
  "checklist_fotos_faltantes": [string]
}
Reglas: formato según la tabla de la guía (si mezcla dos, el más grande). "tiene" solo con productos La Virginia que se VEN.
Zona solo si hay foto de fachada o cuadra; si no, null. Precios en pesos argentinos, número sin símbolos.`
}

// Segunda llamada (solo texto, rápida): argumentos para los productos que eligió el código y resumen de 2–3 líneas.
export function pedidoArgumentos(f: FichaComercio): string {
  const productos = f.ofrecer_primero.map((p) => `- ${p.material} (${p.nombre}, gama ${ETIQUETA_GAMA[p.gama]})`).join("\n")
  return `Comercio: ${ETIQUETA_FORMATO[f.formato.formato]}, NSE ${f.nse.nivel} (puntaje ${f.nse.puntaje ?? "sin dato"}).
Señales: ${f.nse.criterios.filter((c) => c.valor !== null).map((c) => `${c.etiqueta}: ${c.evidencia}`).join("; ") || "sin datos"}.
Góndola: ${f.gondola.estado ?? "sin dato"}; ${f.gondola.observaciones.join("; ")}.
Competencia: ${f.competencia.map((c) => `${c.marca} (${c.categoria})`).join(", ") || "no se vio"}.
Mix calculado: ${f.mix.porcentajes.economica}% económica, ${f.mix.porcentajes.media}% media, ${f.mix.porcentajes.premium}% premium.

Productos para ofrecer primero (ya elegidos, NO los cambies):
${productos}

Devolvé SOLO JSON: { "argumentos": [{ "material": string, "argumento": "1 frase que el vendedor dice tal cual al dueño, basada en lo que se vio" }], "resumen": "2 a 3 líneas: qué comercio es y por dónde arrancar" }`
}
