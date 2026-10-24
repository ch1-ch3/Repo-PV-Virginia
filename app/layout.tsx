import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Visita con Plan · La Virginia",
  description:
    "Asistente de visita para vendedores de La Virginia: fotos y 7 preguntas al dueño para categorizar el comercio y recomendar el mix.",
}

export const viewport: Viewport = {
  themeColor: "#0e4194",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`bg-background ${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
