import type { FichaComercio } from "./tipos"

// Datos de ejemplo para la demo cuando /api/comercios o /api/analizar no responden.
export const FICHAS_EJEMPLO: FichaComercio[] = [
  {
    id: "ej-01",
    creado: "2026-10-24T10:15:00-03:00",
    nombre: "Almacén Don Tito",
    ubicacion: { lat: -32.9468, lng: -60.6393 },
    formato: {
      tipo: "almacen",
      tamano: "mediano",
      cajas_estimadas: 1,
      metros_gondola_estimados: 9,
      justificacion: "Una sola caja con balanza, 3 góndolas de 3 m y heladera de lácteos al fondo.",
    },
    nse: {
      nivel: "medio",
      senales: [
        "Mezcla de marcas líderes y segundas marcas en aceite",
        "Cartel de promoción con tarjeta de débito",
        "Fachada pintada, vereda en buen estado",
      ],
      confianza: 0.72,
    },
    gondola: {
      estado: "regular",
      observaciones: [
        "Infusiones mezcladas con galletitas en la misma góndola",
        "Faltante visible en té en saquitos (hueco de ~40 cm)",
        "Precios escritos a mano, algunos tapados",
      ],
    },
    surtido: {
      tiene: [
        { producto: "Café La Virginia Clásico molido 500 g", observacion: "2 frentes, a la altura de los ojos" },
        { producto: "Mate cocido La Virginia x25", observacion: "Último estante, poco visible" },
      ],
      falta: [
        { producto: "Té La Virginia Clásico x50", motivo: "Hueco en la góndola de té, rota rápido en almacén de barrio" },
        { producto: "Café instantáneo La Virginia 170 g", motivo: "Tiene instantáneo de la competencia con precio alto" },
        { producto: "Mate cocido con miel x25", motivo: "Público familiar, complementa el mate cocido que ya vende" },
      ],
    },
    ofrecer_primero: [
      {
        producto: "Té La Virginia Clásico x50",
        argumento: "Tiene el lugar vacío hoy: es venta segura y se repone sin ocupar góndola nueva.",
      },
      {
        producto: "Café instantáneo La Virginia 170 g",
        argumento: "El instantáneo de la competencia está caro; con el nuestro puede ganar margen y precio.",
      },
      {
        producto: "Mate cocido con miel x25",
        argumento: "Ya vende mate cocido; la variedad con miel suma ticket sin canibalizar.",
      },
    ],
    pedido_sugerido: [
      { producto: "Té La Virginia Clásico x50", cantidad: 12, unidad: "cajas" },
      { producto: "Café instantáneo La Virginia 170 g", cantidad: 6, unidad: "frascos" },
      { producto: "Mate cocido con miel x25", cantidad: 12, unidad: "cajas" },
      { producto: "Café La Virginia Clásico molido 500 g", cantidad: 6, unidad: "paquetes" },
    ],
    competencia: [
      { marca: "Cabrales", categoria: "Café molido", observacion: "3 frentes, cartel de oferta 2x1" },
      { marca: "Nescafé", categoria: "Café instantáneo", observacion: "Único instantáneo, frasco 170 g" },
      { marca: "Taragüí", categoria: "Mate cocido", observacion: "4 frentes en estante principal" },
    ],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Higienol 4 rollos 30 m", precio: 2890 },
      { producto: "aceite", descripcion: "Natura girasol 1,5 L", precio: 3450 },
      { producto: "leche", descripcion: "La Serenísima entera 1 L", precio: 1490 },
      { producto: "cafe", descripcion: "Cabrales molido 500 g", precio: 9800 },
    ],
    resumen:
      "Almacén mediano de NSE medio con góndola regular. Falta té en saquitos (hueco visible): ofrecé Té Clásico x50 primero y sumá instantáneo.",
  },
  {
    id: "ej-02",
    creado: "2026-10-24T09:20:00-03:00",
    nombre: "Autoservicio El Sol",
    ubicacion: { lat: -32.9512, lng: -60.6551 },
    formato: {
      tipo: "autoservicio",
      tamano: "grande",
      cajas_estimadas: 3,
      metros_gondola_estimados: 28,
      justificacion: "Tres cajas con lector, changuitos y 7 pasillos señalizados.",
    },
    nse: {
      nivel: "medio-alto",
      senales: ["Café en cápsulas en exhibición", "Sección de productos sin TACC", "Estacionamiento propio"],
      confianza: 0.81,
    },
    gondola: {
      estado: "buena",
      observaciones: ["Infusiones ordenadas por categoría", "Precios impresos y visibles", "Buena limpieza"],
    },
    surtido: {
      tiene: [
        { producto: "Café La Virginia Clásico molido 500 g" },
        { producto: "Té La Virginia Clásico x100" },
        { producto: "Mate cocido La Virginia x50" },
        { producto: "Té verde La Virginia x20" },
      ],
      falta: [
        { producto: "Cápsulas La Virginia compatibles", motivo: "Tiene cápsulas de otra marca con buena rotación" },
        { producto: "Té saborizado frutos rojos x20", motivo: "Público medio-alto busca variedades" },
      ],
    },
    ofrecer_primero: [
      {
        producto: "Cápsulas La Virginia compatibles",
        argumento: "Ya hay demanda de cápsulas en el local; las nuestras entran a menor precio por taza.",
      },
      {
        producto: "Té saborizado frutos rojos x20",
        argumento: "Completa la línea de tés que ya exhibe y sube el ticket promedio.",
      },
    ],
    pedido_sugerido: [
      { producto: "Cápsulas La Virginia compatibles x10", cantidad: 24, unidad: "cajas" },
      { producto: "Té saborizado frutos rojos x20", cantidad: 12, unidad: "cajas" },
      { producto: "Té La Virginia Clásico x100", cantidad: 12, unidad: "cajas" },
    ],
    competencia: [
      { marca: "Bonafide", categoria: "Café en cápsulas", observacion: "Exhibidor propio en cabecera" },
      { marca: "Green Hills", categoria: "Té", observacion: "6 frentes en variedades saborizadas" },
    ],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Elite 4 rollos 30 m", precio: 3150 },
      { producto: "aceite", descripcion: "Cocinero girasol 1,5 L", precio: 3290 },
      { producto: "leche", descripcion: "La Serenísima entera 1 L", precio: 1420 },
      { producto: "yerba", descripcion: "Playadito 1 kg", precio: 5600 },
    ],
    resumen:
      "Autoservicio grande, NSE medio-alto, góndola en buen estado y buen surtido nuestro. Oportunidad en cápsulas y tés saborizados.",
  },
  {
    id: "ej-03",
    creado: "2026-10-23T17:40:00-03:00",
    nombre: "Kiosco La Esquina",
    ubicacion: { lat: -32.9401, lng: -60.6612 },
    formato: {
      tipo: "kiosco",
      tamano: "chico",
      cajas_estimadas: 1,
      metros_gondola_estimados: 2,
      justificacion: "Atención por ventana, un exhibidor de pared y heladera de bebidas.",
    },
    nse: {
      nivel: "medio-bajo",
      senales: ["Venta de cigarrillos sueltos", "Productos en tamaños chicos", "Fachada con rejas"],
      confianza: 0.64,
    },
    gondola: {
      estado: "regular",
      observaciones: ["Exhibidor sobrecargado", "Sin precios visibles en infusiones"],
    },
    surtido: {
      tiene: [{ producto: "Mate cocido La Virginia x25" }],
      falta: [
        { producto: "Café instantáneo La Virginia sobres", motivo: "Formato individual ideal para kiosco" },
        { producto: "Té La Virginia Clásico x25", motivo: "Tamaño chico acorde al ticket del local" },
      ],
    },
    ofrecer_primero: [
      {
        producto: "Café instantáneo La Virginia sobres",
        argumento: "Venta por unidad, ocupa poco espacio y deja buen margen en kiosco.",
      },
    ],
    pedido_sugerido: [
      { producto: "Café instantáneo sobres (display x20)", cantidad: 3, unidad: "displays" },
      { producto: "Té La Virginia Clásico x25", cantidad: 6, unidad: "cajas" },
    ],
    competencia: [{ marca: "Taragüí", categoria: "Mate cocido", observacion: "Mismo formato, mejor ubicado" }],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Campanita 4 rollos", precio: 2400 },
      { producto: "aceite", descripcion: "Ilegible en la foto", precio: null },
      { producto: "leche", descripcion: "Ilolay entera 1 L", precio: 1590 },
    ],
    resumen:
      "Kiosco chico de NSE medio-bajo. Solo tiene mate cocido nuestro. Ofrecé sobres de café instantáneo: poco espacio, venta por unidad.",
  },
  {
    id: "ej-04",
    creado: "2026-10-23T15:05:00-03:00",
    nombre: "Despensa Mi Barrio",
    ubicacion: { lat: -32.9622, lng: -60.6704 },
    formato: {
      tipo: "despensa",
      tamano: "chico",
      cajas_estimadas: 1,
      metros_gondola_estimados: 5,
      justificacion: "Mostrador con atención personalizada y dos estanterías de pared.",
    },
    nse: {
      nivel: "bajo",
      senales: ["Predominan segundas marcas", "Venta fraccionada de yerba y azúcar", "Cartel de fiado"],
      confianza: 0.7,
    },
    gondola: {
      estado: "mala",
      observaciones: ["Productos con polvo", "Mezcla de limpieza con alimentos", "Muchos faltantes"],
    },
    surtido: {
      tiene: [],
      falta: [
        { producto: "Mate cocido La Virginia x25", motivo: "Básico de consumo diario en el barrio" },
        { producto: "Té La Virginia Clásico x25", motivo: "Precio accesible, alta rotación" },
      ],
    },
    ofrecer_primero: [
      {
        producto: "Mate cocido La Virginia x25",
        argumento: "Producto de entrada: precio bajo, se vende todos los días y no tiene nuestro.",
      },
    ],
    pedido_sugerido: [
      { producto: "Mate cocido La Virginia x25", cantidad: 6, unidad: "cajas" },
      { producto: "Té La Virginia Clásico x25", cantidad: 6, unidad: "cajas" },
    ],
    competencia: [
      { marca: "Unión", categoria: "Té", observacion: "Única marca de té presente" },
      { marca: "Amanda", categoria: "Mate cocido", observacion: "Bien ubicado en mostrador" },
    ],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Segunda marca 4 rollos", precio: 1950 },
      { producto: "aceite", descripcion: "Marca propia girasol 900 ml", precio: 1890 },
      { producto: "leche", descripcion: "Leche sachet 1 L", precio: 1290 },
    ],
    resumen:
      "Despensa chica, NSE bajo, góndola en mal estado y sin productos nuestros. Entrá con mate cocido y té x25, pedido chico.",
  },
  {
    id: "ej-05",
    creado: "2026-10-22T11:30:00-03:00",
    nombre: "Café Plaza",
    ubicacion: { lat: -32.9475, lng: -60.6302 },
    formato: {
      tipo: "cafeteria",
      tamano: "mediano",
      cajas_estimadas: 1,
      metros_gondola_estimados: null,
      justificacion: "Salón con 12 mesas y barra con máquina espresso de dos grupos.",
    },
    nse: {
      nivel: "medio-alto",
      senales: ["Carta con precios altos", "Decoración renovada", "Zona céntrica"],
      confianza: 0.77,
    },
    gondola: { estado: "buena", observaciones: ["No aplica góndola: se evaluó la barra, ordenada y limpia"] },
    surtido: {
      tiene: [{ producto: "Café La Virginia en grano 1 kg", observacion: "Tolva de la máquina" }],
      falta: [{ producto: "Té La Virginia línea gastronómica", motivo: "Sirven té de otra marca en saquito" }],
    },
    ofrecer_primero: [
      {
        producto: "Té La Virginia línea gastronómica",
        argumento: "Ya confía en nuestro café; unificar proveedor simplifica su compra.",
      },
    ],
    pedido_sugerido: [
      { producto: "Café La Virginia en grano 1 kg", cantidad: 10, unidad: "kg" },
      { producto: "Té línea gastronómica x100", cantidad: 4, unidad: "cajas" },
    ],
    competencia: [{ marca: "Green Hills", categoria: "Té", observacion: "Se sirve en saquitos individuales" }],
    precios_clave: [
      { producto: "cafe", descripcion: "Café en jarrito (carta)", precio: 2800 },
      { producto: "leche", descripcion: "Sin dato en fotos", precio: null },
    ],
    resumen: "Cafetería mediana, NSE medio-alto, ya usa nuestro café en grano. Proponé sumar el té gastronómico.",
  },
  {
    id: "ej-06",
    creado: "2026-10-22T09:45:00-03:00",
    nombre: "Súper Centro",
    ubicacion: { lat: -32.9551, lng: -60.6428 },
    formato: {
      tipo: "supermercado",
      tamano: "grande",
      cajas_estimadas: 6,
      metros_gondola_estimados: 60,
      justificacion: "Seis cajas, sección de carnicería y góndolas de 2 m de alto.",
    },
    nse: {
      nivel: "medio",
      senales: ["Ofertas por cantidad", "Marcas propias junto a líderes"],
      confianza: 0.8,
    },
    gondola: {
      estado: "buena",
      observaciones: ["Infusiones en pasillo propio", "Algunos productos nuestros en estante bajo"],
    },
    surtido: {
      tiene: [
        { producto: "Café La Virginia Clásico molido 500 g" },
        { producto: "Té La Virginia Clásico x100" },
        { producto: "Mate cocido La Virginia x50" },
        { producto: "Café instantáneo La Virginia 170 g" },
      ],
      falta: [{ producto: "Cappuccino La Virginia", motivo: "Competencia tiene premezclas con buena rotación" }],
    },
    ofrecer_primero: [
      {
        producto: "Cappuccino La Virginia",
        argumento: "Categoría en crecimiento en el local; hoy solo la cubre la competencia.",
      },
      {
        producto: "Reubicación de Clásico molido",
        argumento: "Está en estante bajo: negociar altura de ojos con exhibidor.",
      },
    ],
    pedido_sugerido: [
      { producto: "Cappuccino La Virginia 125 g", cantidad: 24, unidad: "unidades" },
      { producto: "Café La Virginia Clásico molido 500 g", cantidad: 24, unidad: "paquetes" },
    ],
    competencia: [
      { marca: "Nescafé", categoria: "Premezclas", observacion: "Cabecera con promo 30% off" },
      { marca: "Cabrales", categoria: "Café molido", observacion: "Altura de ojos, 5 frentes" },
    ],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Higienol 4 rollos 30 m", precio: 2690 },
      { producto: "aceite", descripcion: "Natura girasol 1,5 L", precio: 3190 },
      { producto: "leche", descripcion: "La Serenísima entera 1 L", precio: 1380 },
      { producto: "cafe", descripcion: "Cabrales molido 500 g", precio: 9200 },
    ],
    resumen:
      "Supermercado grande de NSE medio, buen surtido nuestro pero mal ubicado. Ofrecé Cappuccino y pedí mejor altura para el molido.",
  },
  {
    id: "ej-07",
    creado: "2026-10-21T16:10:00-03:00",
    nombre: "Almacén Los Hermanos",
    ubicacion: { lat: -32.9688, lng: -60.6511 },
    formato: {
      tipo: "almacen",
      tamano: "chico",
      cajas_estimadas: 1,
      metros_gondola_estimados: 6,
      justificacion: "Local angosto con dos estanterías y mostrador de fiambrería.",
    },
    nse: { nivel: "medio-bajo", senales: ["Promos de segundas marcas", "Pago con billetera virtual"], confianza: 0.62 },
    gondola: { estado: "regular", observaciones: ["Infusiones en estante alto, difícil acceso"] },
    surtido: {
      tiene: [{ producto: "Té La Virginia Clásico x25" }],
      falta: [{ producto: "Mate cocido La Virginia x25", motivo: "Tiene solo una marca de la competencia" }],
    },
    ofrecer_primero: [
      { producto: "Mate cocido La Virginia x25", argumento: "Completa la línea con la marca que ya conoce por el té." },
    ],
    pedido_sugerido: [{ producto: "Mate cocido La Virginia x25", cantidad: 6, unidad: "cajas" }],
    competencia: [{ marca: "Taragüí", categoria: "Mate cocido", observacion: "Única opción en góndola" }],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Higienol 4 rollos 30 m", precio: 2990 },
      { producto: "aceite", descripcion: "Cocinero girasol 900 ml", precio: 2350 },
      { producto: "leche", descripcion: "Ilolay entera 1 L", precio: 1550 },
    ],
    resumen: "Almacén chico NSE medio-bajo, tiene nuestro té. Sumá mate cocido x25, sin competencia fuerte.",
  },
  {
    id: "ej-08",
    creado: "2026-10-21T10:00:00-03:00",
    nombre: "Autoservicio Norte",
    ubicacion: { lat: -32.9301, lng: -60.6655 },
    formato: {
      tipo: "autoservicio",
      tamano: "mediano",
      cajas_estimadas: 2,
      metros_gondola_estimados: 16,
      justificacion: "Dos cajas, 4 pasillos y heladeras murales.",
    },
    nse: { nivel: "medio", senales: ["Marcas líderes en lácteos", "Cartelería impresa"], confianza: 0.69 },
    gondola: { estado: "buena", observaciones: ["Orden por marca", "Precios visibles"] },
    surtido: {
      tiene: [{ producto: "Café La Virginia Clásico molido 500 g" }, { producto: "Mate cocido La Virginia x50" }],
      falta: [
        { producto: "Té La Virginia Clásico x50", motivo: "Tiene té solo de la competencia" },
        { producto: "Café instantáneo La Virginia 170 g", motivo: "Categoría con 1 sola marca" },
      ],
    },
    ofrecer_primero: [
      { producto: "Té La Virginia Clásico x50", argumento: "Góndola de té sin nuestra marca: entrada fácil." },
      { producto: "Café instantáneo La Virginia 170 g", argumento: "Le da al cliente una segunda opción de precio." },
    ],
    pedido_sugerido: [
      { producto: "Té La Virginia Clásico x50", cantidad: 12, unidad: "cajas" },
      { producto: "Café instantáneo La Virginia 170 g", cantidad: 6, unidad: "frascos" },
    ],
    competencia: [{ marca: "Crysf", categoria: "Té", observacion: "4 frentes" }],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Elite 4 rollos 30 m", precio: 3050 },
      { producto: "aceite", descripcion: "Natura girasol 1,5 L", precio: 3380 },
      { producto: "leche", descripcion: "La Serenísima entera 1 L", precio: 1450 },
    ],
    resumen: "Autoservicio mediano NSE medio, góndola buena. Faltan té y café instantáneo nuestros.",
  },
  {
    id: "ej-09",
    creado: "2026-10-20T12:25:00-03:00",
    nombre: null,
    ubicacion: null,
    formato: {
      tipo: "kiosco",
      tamano: "mediano",
      cajas_estimadas: 1,
      metros_gondola_estimados: 4,
      justificacion: "Kiosco con salón y góndola central baja.",
    },
    nse: { nivel: "medio", senales: ["Golosinas importadas", "Pago con QR"], confianza: 0.55 },
    gondola: { estado: "regular", observaciones: ["Infusiones junto a galletitas, poco espacio"] },
    surtido: {
      tiene: [],
      falta: [{ producto: "Café instantáneo La Virginia sobres", motivo: "Formato kiosco, venta por unidad" }],
    },
    ofrecer_primero: [
      { producto: "Café instantáneo La Virginia sobres", argumento: "Display chico de mostrador, cero esfuerzo para el kiosquero." },
    ],
    pedido_sugerido: [{ producto: "Café instantáneo sobres (display x20)", cantidad: 2, unidad: "displays" }],
    competencia: [{ marca: "Nescafé", categoria: "Instantáneo", observacion: "Sobres en mostrador" }],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "No se vende", precio: null },
      { producto: "aceite", descripcion: "No se vende", precio: null },
      { producto: "leche", descripcion: "Ilolay entera 1 L", precio: 1650 },
    ],
    resumen: "Kiosco mediano sin nombre visible y sin productos nuestros. Entrá con display de sobres de instantáneo.",
  },
  {
    id: "ej-10",
    creado: "2026-10-19T18:00:00-03:00",
    nombre: "Despensa Doña Rosa",
    ubicacion: { lat: -32.9733, lng: -60.6398 },
    formato: {
      tipo: "despensa",
      tamano: "mediano",
      cajas_estimadas: 1,
      metros_gondola_estimados: 8,
      justificacion: "Mostrador y autoservicio parcial con 2 góndolas.",
    },
    nse: { nivel: "medio-bajo", senales: ["Ofertas en pizarra", "Productos de primera necesidad al frente"], confianza: 0.66 },
    gondola: { estado: "regular", observaciones: ["Buena carga, poco orden"] },
    surtido: {
      tiene: [{ producto: "Mate cocido La Virginia x25" }, { producto: "Té La Virginia Clásico x25" }],
      falta: [{ producto: "Mate cocido con miel x25", motivo: "Variedad que suma ticket" }],
    },
    ofrecer_primero: [
      { producto: "Mate cocido con miel x25", argumento: "Ya rota nuestro mate cocido; la variedad agrega venta." },
    ],
    pedido_sugerido: [
      { producto: "Mate cocido con miel x25", cantidad: 6, unidad: "cajas" },
      { producto: "Mate cocido La Virginia x25", cantidad: 12, unidad: "cajas" },
    ],
    competencia: [{ marca: "Amanda", categoria: "Mate cocido", observacion: "Oferta 2x1 en pizarra" }],
    precios_clave: [
      { producto: "papel_higienico", descripcion: "Campanita 4 rollos", precio: 2250 },
      { producto: "aceite", descripcion: "Cocinero girasol 1,5 L", precio: 3350 },
      { producto: "leche", descripcion: "Leche sachet 1 L", precio: 1310 },
    ],
    resumen: "Despensa mediana NSE medio-bajo, cliente de mate cocido y té. Sumá la variedad con miel.",
  },
]

export function fichaDeEjemplo(datos: {
  nombre: string | null
  ubicacion: FichaComercio["ubicacion"]
}): FichaComercio {
  const base = FICHAS_EJEMPLO[0]
  return {
    ...base,
    id: `local-${Date.now()}`,
    creado: new Date().toISOString(),
    nombre: datos.nombre,
    ubicacion: datos.ubicacion,
    resumen: `${base.resumen} (Ficha de ejemplo: no se pudo conectar con el análisis.)`,
  }
}
