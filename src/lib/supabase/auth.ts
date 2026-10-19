import { headers } from 'next/headers'

export type Role = 'admin' | 'staff' | 'customer'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  phone: string | null
  requested_role: string | null
  role: Role
}

// Forward the RAW cookie header. cookies().toString() re-encodes the value
// (":" becomes "%3A") and Django's signed-cookie session then fails to verify.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const base = (process.env.BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  const cookieHeader = (await headers()).get('cookie')
  if (!cookieHeader) return null
  try {
    const res = await fetch(`${base}/api/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })
    if (!res.ok) {
      console.error('getCurrentUser: /api/auth/me returned', res.status)
      return null
    }
    return (await res.json()) as CurrentUser
  } catch (err) {
    console.error('getCurrentUser: backend unreachable', err)
    return null
  }
}