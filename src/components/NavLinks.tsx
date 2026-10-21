'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = { href: string; label: string; icon: string }
export type NavGroup = { label: string; items: NavItem[] }

export default function NavLinks({ groups }: { groups: NavGroup[] }) {
  const path = usePathname()
  return (
    <nav className="flex flex-col">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#7fa68d] mt-6 mb-2 px-3">{g.label}</p>
          <div className="flex flex-col gap-1">
            {g.items.map((l) => {
              const active = path === l.href || path.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition ${
                    active
                      ? 'bg-[#ff5e31] text-white font-semibold shadow-lg shadow-black/25'
                      : 'text-[#bcd6c5] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full grid place-items-center text-sm shrink-0 ${
                      active ? 'bg-white/25' : 'bg-white/10'
                    }`}
                  >
                    {l.icon}
                  </span>
                  {l.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}