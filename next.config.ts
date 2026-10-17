import type { NextConfig } from 'next'

// Django backend URL. Local: http://127.0.0.1:8000, Production: your Render URL.
const BACKEND_URL = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const nextConfig: NextConfig = {
  // Every /api/* call from the React pages is forwarded to Django,
  // so the browser still sees one origin (cookies work, no CORS needed).
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }]
  },
}

export default nextConfig
