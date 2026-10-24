"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Ubicación del celular. La geolocalización solo funciona en HTTPS (Vercel) o localhost.
// Estrategia: alta precisión primero; si tarda o falla, ubicación aproximada; después se sigue afinando un rato.

export type EstadoUbicacion =
  | { estado: "inactiva" | "buscando" }
  | { estado: "ok"; lat: number; lng: number; precision: number }
  | { estado: "denegada" | "no-disponible" | "no-segura" }

const AFINAR_MS = 30_000 // cuánto tiempo se sigue mejorando la precisión
const PRECISION_BUENA = 30 // metros

export function useUbicacion() {
  const [ubicacion, setUbicacion] = useState<EstadoUbicacion>({ estado: "inactiva" })
  const vigilancia = useRef<number | null>(null)
  const corte = useRef<ReturnType<typeof setTimeout> | null>(null)

  const detener = useCallback(() => {
    if (vigilancia.current !== null) navigator.geolocation.clearWatch(vigilancia.current)
    if (corte.current) clearTimeout(corte.current)
    vigilancia.current = null
    corte.current = null
  }, [])

  const pedir = useCallback(() => {
    if (typeof window === "undefined") return
    if (!window.isSecureContext) return setUbicacion({ estado: "no-segura" })
    if (!("geolocation" in navigator)) return setUbicacion({ estado: "no-disponible" })

    detener()
    setUbicacion((u) => (u.estado === "ok" ? u : { estado: "buscando" }))

    const aceptar = (pos: GeolocationPosition) =>
      setUbicacion((u) =>
        // Solo reemplaza si la nueva lectura es más precisa.
        u.estado === "ok" && u.precision <= pos.coords.accuracy
          ? u
          : { estado: "ok", lat: pos.coords.latitude, lng: pos.coords.longitude, precision: Math.round(pos.coords.accuracy) },
      )

    const afinar = () => {
      vigilancia.current = navigator.geolocation.watchPosition(
        (pos) => {
          aceptar(pos)
          if (pos.coords.accuracy <= PRECISION_BUENA) detener()
        },
        () => detener(),
        { enableHighAccuracy: true, maximumAge: 0, timeout: AFINAR_MS },
      )
      corte.current = setTimeout(detener, AFINAR_MS)
    }

    const fallar = (e: GeolocationPositionError) =>
      setUbicacion((u) => (u.estado === "ok" ? u : { estado: e.code === e.PERMISSION_DENIED ? "denegada" : "no-disponible" }))

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        aceptar(pos)
        if (pos.coords.accuracy > PRECISION_BUENA) afinar()
      },
      (e) => {
        if (e.code === e.PERMISSION_DENIED) return fallar(e)
        // Adentro del local el GPS tarda: probamos con la ubicación aproximada (wifi / antenas).
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            aceptar(pos)
            afinar()
          },
          fallar,
          { enableHighAccuracy: false, timeout: 15_000, maximumAge: 5 * 60_000 },
        )
      },
      { enableHighAccuracy: true, timeout: 8_000, maximumAge: 60_000 },
    )
  }, [detener])

  // Si el permiso ya está dado (o se puede preguntar), se pide sola al entrar; si estaba bloqueado, se muestra la ayuda.
  useEffect(() => {
    let cancelado = false
    const permisos = navigator.permissions as Permissions | undefined
    if (!permisos?.query) {
      pedir()
      return detener
    }
    permisos
      .query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (cancelado) return
        if (p.state === "denied") setUbicacion({ estado: "denegada" })
        else pedir()
      })
      .catch(() => !cancelado && pedir())
    return () => {
      cancelado = true
      detener()
    }
  }, [pedir, detener])

  return { ubicacion, pedir }
}

// Distancia en metros entre dos puntos (fórmula de haversine).
export function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}
