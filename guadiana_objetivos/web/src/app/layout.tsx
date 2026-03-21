import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',        // evita FOIT (flash of invisible text)
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Guadiana Checklists',
    template: '%s | Guadiana Checklists',
  },
  description:
    'Plataforma web de gestión de checklists, auditorías y KPIs para Llantas y Rines del Guadiana.',
  keywords: ['checklists', 'auditoría', 'KPIs', 'guadiana', 'gestión', 'formularios'],
  authors: [{ name: 'Llantas y Rines del Guadiana' }],
  robots: {
    index: false,   // app interna — no indexar en buscadores
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#004B8D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
