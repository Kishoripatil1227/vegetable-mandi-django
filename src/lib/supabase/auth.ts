import { cookies } from 'next/headers'

export type Role = 'admin' | 'staff' | 'customer'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  requested_role: string | null
  role: Role
}

// Server-side session check used by the (app) layout.
// The session now lives in Django: we forward the browser cookie to /api/auth/me.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const base = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const cookieHeader = (await cookies()).toString()
  if (!cookieHeader) return null
  try {
    const res = await fetch(`${base}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as CurrentUser
  } catch {
    return null
  }
}
