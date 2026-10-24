# AGENTS.md — Visita con Plan (Shippear #3 · desafío La Virginia)

## Producto
Asistente para el vendedor de La Virginia. En la visita saca las fotos que pueda (ninguna es obligatoria) y le hace
7 preguntas rápidas al dueño; la app:
1. Completa sola el relevamiento del comercio (formato, NSE con señales, estado de góndola, cajas, ubicación).
2. Propone el surtido ideal La Virginia (tiene / le falta) y qué ofrecer primero con argumento.
3. Registra precios de productos clave (papel higiénico, aceite, leche, etc.) para comparar entre comercios.
4. Permite repreguntar por chat.
Restricción de negocio: el vendedor tiene ~15 min por cliente. El análisis debe tardar < 1 min y pedir cero tipeo.

## Stack (fijo, no cambiar)
- Next.js App Router + TypeScript + Tailwind + componentes estilo shadcn/ui en `components/ui`.
- Supabase opcional (tabla `fichas`, ver `supabase/schema.sql`); sin variables, memoria + datos de ejemplo.
- Modelo multimodal por `fetch` en `lib/llm.ts` (Gemini, OpenAI o Anthropic según la variable de entorno), sin SDK.
- Docker: `Dockerfile` + `probar-docker.sh` para correrlo local.
- Deploy: Vercel, conectado a GitHub. `main` = producción. Cada rama = preview.
- Versiones FIJAS en package.json (nunca "latest").

## Quién trabaja
- No se usa v0. Front y back los hace Claude en este repo; no hay dueños de carpetas.
- `lib/types.ts` es el contrato entre front y back; las etiquetas para mostrar están en `lib/etiquetas.ts`.
- La IA solo extrae evidencia de las fotos; NSE (`lib/nse.ts`), mix (`lib/mix.ts`) y ficha (`lib/ficha.ts`) los decide el código.

## Contrato
Ver `docs/CONTRATO_V2.md` (la sección "IMPLEMENTADO" manda). Si algo no está en el contrato, no se inventa: se usa el tipo existente o se pregunta.

## Reglas
- Ruta de demo que SIEMPRE debe funcionar, aun sin clave del modelo: puntos → detalle → fotos → entrevista → resultado → chat.
- Claves (API del modelo, Supabase) solo en variables de entorno de Vercel / `.env.local`. Nunca en el código.
- La IA no inventa: si un dato no se ve en las fotos (p. ej. un precio ilegible), devuelve `null` y lo dice.
- Datos de ejemplo precargados: `data/puntos-demo.json` (12 puntos) y `data/fichas-demo.json` (visitas previas).
- Antes de cerrar un cambio: `npx tsc --noEmit`, `npx tsx scripts/probar-logica.ts` y `pnpm build`.
- Trabajo en ramas `claude/*` con PR a `main`.
