'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell, { LeafLogo } from '@/components/AuthShell'

const ROLES = ['Admin', 'Staff', 'Customer'] as const
const DESC: Record<string, string> = {
  Admin: 'Admin / Owner: full access, finalizes payments.',
  Staff: 'Staff / Operator: daily entries, cannot finalize payments.',
  Customer: 'Customer: view your own purchases and rates.',
}

const svg = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const ROLE_ICON: Record<string, React.ReactNode> = {
  Admin: (
    <svg {...svg} aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
  ),
  Staff: (
    <svg {...svg} aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
  ),
  Customer: (
    <svg {...svg} aria-hidden="true"><path d="M5 8h14l-1.2 11H6.2L5 8z" /><path d="M9 8V6.5a3 3 0 016 0V8" /></svg>
  ),
}

export default function LoginPage() {
  const [role, setRole] = useState<(typeof ROLES)[number]>('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 20000)

    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: role.toLowerCase() }),
        signal: ctrl.signal,
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || `Login failed (${r.status})`)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(
        err?.name === 'AbortError'
          ? 'The server is taking too long. Please try again.'
          : err?.message || 'Something went wrong. Please try again.'
      )
      setLoading(false)
    } finally {
      clearTimeout(timer)
    }
  }

  return (
    <AuthShell tone="glass">
      <form onSubmit={onSubmit} className="w-full">
        <div className="flex flex-col items-center text-center">
          <LeafLogo className="w-12 h-12" />
          <h2 className="font-display text-3xl font-extrabold mt-2">Sign in</h2>
          <p className="text-[#b8d8c1] mt-1 text-sm">Choose your role to see the right tools.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6" role="tablist" aria-label="Sign in as">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => {
                setRole(r)
                setError('')
              }}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-sm font-semibold transition ${
                role === r
                  ? 'border-[#51cc50] bg-[#51cc50]/15 text-white'
                  : 'border-white/10 bg-white/5 text-[#b8d8c1] hover:border-white/25'
              }`}
            >
              {ROLE_ICON[r]}
              {r}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9fc4ac] mt-2 text-center">{DESC[role]}</p>

        <div className="mt-5">
          <label htmlFor="email" className="block text-sm mb-1.5">Email</label>
          <div className="relative">
            <svg {...svg} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72dd37]" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" />
            </svg>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@mandi.in"
              className="w-full pad-l"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="block text-sm mb-1.5">Password</label>
          <div className="relative">
            <svg {...svg} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72dd37]" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            <input
              id="password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pad-l pad-r"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b8d8c1] hover:text-white"
            >
              <svg {...svg} aria-hidden="true">
                <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {show && <path d="M4 4l16 16" />}
              </svg>
            </button>
          </div>
          <div className="text-right mt-2">
            <Link href="/forgot-password" className="text-sm font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <p className="text-sm text-[#ff9d8a] min-h-5 mt-2" role="alert">{error}</p>

        <button
          disabled={loading}
          className="w-full mt-2 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg, #51cc50, #2aa648)', boxShadow: '0 10px 24px rgba(42,166,72,.35)' }}
        >
          <svg {...svg} width={20} height={20} aria-hidden="true"><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M14 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5" /></svg>
          {loading ? 'Signing in...' : `Sign in as ${role}`}
        </button>

        <div className="flex items-center gap-3 mt-6 text-xs text-[#9fc4ac]">
          <span className="flex-1 h-px bg-white/15" />OR<span className="flex-1 h-px bg-white/15" />
        </div>

        <p className="text-center text-sm mt-4 text-[#b8d8c1]">
          New here?{' '}
          <Link href="/signup" className="font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-center text-sm mt-3">
          <Link href="/" className="font-semibold hover:underline">← Back to home</Link>
        </p>
      </form>
    </AuthShell>
  )
}