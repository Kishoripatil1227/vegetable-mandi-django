import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/auth'
import LogoutButton from '@/components/LogoutButton'
import NavLinks, { NavGroup } from '@/components/NavLinks'
import { LeafLogo } from '@/components/AuthShell'

type L = { href: string; label: string; icon: string; roles: string[] }

const groups: { label: string; items: L[] }[] = [
  {
    label: 'Workflow',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '⌂', roles: ['admin', 'staff', 'customer'] },
      { href: '/farmers', label: 'Farmers', icon: '♙', roles: ['admin', 'staff'] },
      { href: '/buyers', label: 'Buyers', icon: '◫', roles: ['admin', 'staff'] },
      { href: '/lots', label: 'Produce lots', icon: '▦', roles: ['admin', 'staff'] },
      { href: '/weighments', label: 'Weighments', icon: '⚖', roles: ['admin', 'staff'] },
      { href: '/auctions', label: 'Auction and commission', icon: '₹', roles: ['admin', 'staff'] },
      { href: '/settlements', label: 'Settlements', icon: '✓', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/history', label: 'Search and history', icon: '⌕', roles: ['admin', 'staff'] },
      { href: '/reports', label: 'Reports', icon: '▥', roles: ['admin', 'staff'] },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/roles', label: 'Role management', icon: '◇', roles: ['admin'] },
      { href: '/customer-links', label: 'Customer link', icon: '⇄', roles: ['admin'] },
      { href: '/settings', label: 'Profile and settings', icon: '⚙', roles: ['admin', 'staff', 'customer'] },
    ],
  },
]

const roleLabel: Record<string, string> = {
  admin: 'Admin / Owner',
  staff: 'Staff / Operator',
  customer: 'Customer',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const navGroups: NavGroup[] = groups
    .map((g) => ({
      label: g.label,
      items: g.items
        .filter((i) => i.roles.includes(user.role))
        .map(({ href, label, icon }) => ({ href, label, icon })),
    }))
    .filter((g) => g.items.length > 0)

  const display = user.name || user.email
  const initials = display
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('')

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="bg-[#04180f] border-r border-[#0f4a2e] text-[#e8f3ec] px-4 py-5 md:sticky md:top-0 md:h-screen md:overflow-y-auto flex flex-col gap-3">
        <div className="flex items-center gap-3 px-1">
          <LeafLogo className="w-10 h-10 shrink-0" />
          <strong className="font-display leading-tight">Vegetable Mandi Agent</strong>
        </div>

        <NavLinks groups={navGroups} />

        <div className="mt-auto flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
          <span className="w-9 h-9 rounded-full bg-[#1fa34a] text-white grid place-items-center font-bold text-sm shrink-0">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{display}</p>
            <p className="text-xs text-[#9dbfaa]">{roleLabel[user.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-[#031a10]/90 backdrop-blur border-b border-[#0f4a2e] px-6 py-4">
          <p className="text-sm text-[#a9c9b5]">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <span className="bg-[#1fa34a]/15 text-[#7be37a] border border-[#1fa34a]/40 font-semibold text-sm px-4 py-1.5 rounded-full">
            {roleLabel[user.role]}
          </span>
        </header>
        <main className="p-4 md:p-8 max-w-7xl">{children}</main>
      </div>
    </div>
  )
}