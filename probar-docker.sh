#!/usr/bin/env bash
# Construye la imagen, levanta el contenedor y prueba la ruta de demo por HTTP.
#
# Uso:
#   ./probar-docker.sh                     # build + run + pruebas
#   ./probar-docker.sh foto1.jpg foto2.jpg # además prueba /api/analizar con esas fotos (necesita clave del modelo)
#   ./probar-docker.sh --down              # para y borra el contenedor
#
# Claves: se leen de .env.local si existe (ver .env.example). Sin clave igual corre:
# lista de comercios con fichas demo; analizar/chat responden error controlado.

set -euo pipefail
cd "$(dirname "$0")"

IMAGEN="visita-con-plan:local"
CONTENEDOR="visita-con-plan"
PUERTO="${PUERTO:-3000}"
URL="http://localhost:${PUERTO}"

verde() { printf '\033[32m%s\033[0m\n' "$*"; }
rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
gris()  { printf '\033[90m%s\033[0m\n' "$*"; }

if [[ "${1:-}" == "--down" ]]; then
  docker rm -f "$CONTENEDOR" >/dev/null 2>&1 && verde "Contenedor $CONTENEDOR borrado" || gris "No había contenedor corriendo"
  exit 0
fi

command -v docker >/dev/null || { rojo "Docker no está instalado"; exit 1; }
docker info >/dev/null 2>&1 || { rojo "Docker no está corriendo (abrí Docker Desktop)"; exit 1; }
command -v curl >/dev/null || { rojo "Falta curl"; exit 1; }

FOTOS=("$@")
for f in ${FOTOS[@]+"${FOTOS[@]}"}; do [[ -f "$f" ]] || { rojo "No existe la foto: $f"; exit 1; }; done

ENV_ARGS=()
HAY_CLAVE=0
if [[ -f .env.local ]]; then
  ENV_ARGS=(--env-file .env.local)
  grep -Eq '^(GEMINI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)=.+' .env.local && HAY_CLAVE=1
  gris "Usando .env.local (clave del modelo: $([[ $HAY_CLAVE == 1 ]] && echo sí || echo no))"
else
  gris "Sin .env.local: modo demo (sin modelo, sin Supabase)"
fi

echo "==> Build de la imagen"
docker build -t "$IMAGEN" .

echo "==> Levantando contenedor en $URL"
docker rm -f "$CONTENEDOR" >/dev/null 2>&1 || true
docker run -d --name "$CONTENEDOR" -p "${PUERTO}:3000" ${ENV_ARGS[@]+"${ENV_ARGS[@]}"} "$IMAGEN" >/dev/null

echo -n "==> Esperando que responda"
for i in $(seq 1 60); do
  if curl -fs "$URL/api/comercios" >/dev/null 2>&1; then echo; break; fi
  echo -n "."; sleep 1
  if [[ $i == 60 ]]; then echo; rojo "No arrancó en 60 s. Logs:"; docker logs --tail 50 "$CONTENEDOR"; exit 1; fi
done

FALLAS=0
# chequear <nombre> <código esperado> <curl args...>
chequear() {
  local nombre="$1" esperado="$2"; shift 2
  local codigo
  codigo=$(curl -s -o /tmp/vcp_resp.$$ -w '%{http_code}' --max-time 90 "$@" || echo 000)
  if [[ "$codigo" == "$esperado" ]]; then
    verde "  OK   $nombre ($codigo)"
  else
    rojo  "  FALLA $nombre: esperaba $esperado, vino $codigo"
    head -c 300 /tmp/vcp_resp.$$ 2>/dev/null; echo
    FALLAS=$((FALLAS + 1))
  fi
}

echo "==> Pruebas"
chequear "GET /  (inicio)"                 200 "$URL/"
chequear "GET /visita/nueva"               200 "$URL/visita/nueva"
chequear "GET /precios"                    200 "$URL/precios"
chequear "GET /api/comercios"              200 "$URL/api/comercios"

COMERCIOS=$(curl -s "$URL/api/comercios")
CANT=$(grep -o '"creado"' <<<"$COMERCIOS" | wc -l | tr -d ' ')
ID=$(grep -o '"id":"[^"]*"' <<<"$COMERCIOS" | head -1 | cut -d'"' -f4)
if [[ "$CANT" -gt 0 ]]; then verde "  OK   fichas demo cargadas ($CANT)"; else rojo "  FALLA no hay fichas demo"; FALLAS=$((FALLAS + 1)); fi
[[ -n "$ID" ]] && chequear "GET /comercio/$ID" 200 "$URL/comercio/$ID"

chequear "POST /api/analizar sin fotos → 400" 400 -X POST "$URL/api/analizar" -F "nombre=prueba"
chequear "POST /api/chat sin ficha → 400"     400 -X POST "$URL/api/chat" -H 'content-type: application/json' -d '{"mensajes":[{"rol":"vendedor","texto":"hola"}]}'

if [[ $HAY_CLAVE == 1 && -n "$ID" ]]; then
  chequear "POST /api/chat con ficha demo" 200 -X POST "$URL/api/chat" -H 'content-type: application/json' \
    -d "{\"fichaId\":\"$ID\",\"mensajes\":[{\"rol\":\"vendedor\",\"texto\":\"¿Qué le ofrezco primero?\"}]}"
  [[ $FALLAS == 0 ]] && gris "       respuesta: $(head -c 200 /tmp/vcp_resp.$$)"
else
  gris "  --   chat con modelo: salteado (no hay clave en .env.local)"
fi

if [[ ${#FOTOS[@]} -gt 0 ]]; then
  if [[ $HAY_CLAVE == 1 ]]; then
    ARGS=(); for f in "${FOTOS[@]}"; do ARGS+=(-F "fotos=@$f"); done
    INICIO=$(date +%s)
    chequear "POST /api/analizar con ${#FOTOS[@]} foto(s)" 200 -X POST "$URL/api/analizar" -F "nombre=Prueba Docker" "${ARGS[@]}"
    gris "       tardó $(( $(date +%s) - INICIO )) s (objetivo < 60 s)"
  else
    gris "  --   analizar con fotos: salteado (no hay clave en .env.local)"
  fi
fi

rm -f /tmp/vcp_resp.$$
echo
if [[ $FALLAS == 0 ]]; then
  verde "Todo OK. App corriendo en $URL"
else
  rojo "$FALLAS prueba(s) fallaron. Logs: docker logs $CONTENEDOR"
fi
gris "Para pararla: ./probar-docker.sh --down"
exit $FALLAS
