import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── Producción: output standalone para despliegue en Hostinger Node.js ──────
  output: 'standalone',

  // ── Compresión gzip/brotli automática ───────────────────────────────────────
  compress: true,

  // ── Headers de seguridad y caché ────────────────────────────────────────────
  async headers() {
    return [
      {
        // Aplica a todas las rutas
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // En producción los assets de Next.js tienen hash en el nombre → caché agresiva segura.
      // En desarrollo se omite este bloque para evitar que el browser sirva JS obsoleto.
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }] : []),
      {
        // API routes — sin caché (datos dinámicos)
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ]
  },

  // ── Optimización de imágenes ─────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // ── Logging mínimo en producción ─────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
