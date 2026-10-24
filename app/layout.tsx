import type { Metadata, Viewport } from "next"
import { Figtree, Geist_Mono } from "next/font/google"
import "./globals.css"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Visita con Plan · La Virginia",
  description:
    "Asistente de visita para vendedores de La Virginia: sacá fotos del comercio y obtené relevamiento, surtido sugerido y precios clave.",
}

export const viewport: Viewport = {
  themeColor: "#f6f7f9",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`bg-background ${figtree.variable} ${geistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
