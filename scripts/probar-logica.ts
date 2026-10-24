// Verifica las reglas de NSE y mix contra la guía. Uso: npx tsx scripts/probar-logica.ts
import { calcularNSE } from "../lib/nse"
import { calcularMix, porcentajesPorPuntaje } from "../lib/mix"
import { CATALOGO } from "../lib/catalogo"
import { armarFicha } from "../lib/ficha"
import { listarFichas, listarPuntos } from "../lib/db"

let fallas = 0
function igual(nombre: string, obtenido: unknown, esperado: unknown) {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado)
  if (!ok) fallas++
  console.log(`${ok ? "OK   " : "FALLA"} ${nombre}${ok ? "" : ` → obtuvo ${JSON.stringify(obtenido)}, esperaba ${JSON.stringify(esperado)}`}`)
}

// NSE (guía: umbral ±0,3 · mínimo 4 respuestas · conflicto foto/dueño → medio)
igual("NSE alto", calcularNSE([], { cajas: 1, repositor: 1, empleados: 0, delivery: 1 }).nivel, "alto")
igual("NSE bajo", calcularNSE([], { cajas: -1, repositor: -1, empleados: -1, ticket: 0 }).nivel, "bajo")
igual("NSE medio en el umbral −0,25", calcularNSE([], { cajas: -1, repositor: 0, empleados: 0, ticket: 0 }).nivel, "medio")
const pocas = calcularNSE([], { cajas: 1, repositor: 1, empleados: 1 })
igual("Menos de 4 respuestas → medio y pide foto", [pocas.nivel, pocas.pedir_otra_foto], ["medio", true])
const conflicto = calcularNSE(
  [
    { id: "vinos", valor: 1, evidencia: "" },
    { id: "premium_saludable", valor: 1, evidencia: "" },
  ],
  { cajas: -1, empleados: -1, ticket: -1 },
)
igual("Conflicto foto/dueño → medio", [conflicto.nivel, conflicto.conflicto_foto_dueno], ["medio", true])
igual("null no cuenta", calcularNSE([{ id: "vinos", valor: null, evidencia: "" }], { cajas: null }).respondidas, 0)

// Mix: anclas de la entrevista y suma 100
igual("Mix −1 → 80/20/0", porcentajesPorPuntaje(-1), { economica: 80, media: 20, premium: 0 })
igual("Mix 0 → 20/60/20", porcentajesPorPuntaje(0), { economica: 20, media: 60, premium: 20 })
igual("Mix +1 → 0/30/70", porcentajesPorPuntaje(1), { economica: 0, media: 30, premium: 70 })
igual("Mix −0,4 → 44/44/12", porcentajesPorPuntaje(-0.4), { economica: 44, media: 44, premium: 12 })
for (const p of [-0.83, -0.33, 0.17, 0.6]) {
  const s = Object.values(porcentajesPorPuntaje(p)).reduce((a, b) => a + b, 0)
  igual(`Mix ${p} suma 100`, s, 100)
}
const mixAlmacen = calcularMix({ puntaje: -0.5, formato: "almacen", tiene: [], variedad: null })
igual("Almacén → 10 productos", mixAlmacen.total_productos, 10)
igual("Kiosco → 5 productos", calcularMix({ puntaje: 0, formato: "kiosco", tiene: [], variedad: null }).total_productos, 5)
igual("Variedad baja achica el mix", calcularMix({ puntaje: 0, formato: "autoservicio", tiene: [], variedad: "baja" }).total_productos, 11)
igual(
  "Todos los materiales del mix existen",
  mixAlmacen.productos.every((p) => CATALOGO.some((c) => c.material === p.material)),
  true,
)
igual("Bar no recibe especias", calcularMix({ puntaje: 0, formato: "bar_cafeteria", tiene: [], variedad: null }).productos.some((p) => p.linea.startsWith("ESPECIAS")), false)

// Ficha sin fotos ni modelo: solo respuestas del dueño
const soloDueno = armarFicha({
  id: "x", creado: new Date().toISOString(), nombre: "Prueba", punto: null, ubicacion: null,
  tipos_fotos: [], no_vende: ["leche"], respuestas: { cajas: 0, repositor: -1, empleados: -1, ticket: -1 },
  zona_confirmada: null, extraccion: null, origen: "demo",
})
igual("Sin fotos: dos cajas → autoservicio", soloDueno.formato.formato, "autoservicio")
igual("No vende leche → estado no_vende", soloDueno.precios_clave.find((p) => p.producto === "leche")?.estado, "no_vende")
igual("Sin foto de aceite → sin_foto", soloDueno.precios_clave.find((p) => p.producto === "aceite")?.estado, "sin_foto")
igual("Ofrecer primero ≤ 3 y todos le faltan", soloDueno.ofrecer_primero.length <= 3 && soloDueno.ofrecer_primero.every((o) => soloDueno.mix.productos.find((p) => p.material === o.material)?.estado === "le_falta"), true)

async function main() {
  const fichas = await listarFichas()
  const puntos = await listarPuntos()
  console.log(`\nFichas demo: ${fichas.length} · Puntos: ${puntos.length}`)
  for (const f of fichas)
    console.log(`  ${f.nombre}: ${f.formato.formato} · NSE ${f.nse.nivel} (${f.nse.puntaje}) · mix ${JSON.stringify(f.mix.porcentajes)} · ${f.mix.total_productos} SKUs · recat: ${f.recategorizacion?.cambio ?? "-"}`)
  console.log(`  Ej. resumen: ${fichas[0].resumen}`)
  console.log(`  Ej. mix: ${fichas[0].mix.productos.map((p) => `${p.nombre} [${p.gama}/${p.estado}]`).join(", ")}`)
  console.log(fallas ? `\n${fallas} FALLAS` : "\nTodo OK")
  process.exit(fallas ? 1 : 0)
}
main()
