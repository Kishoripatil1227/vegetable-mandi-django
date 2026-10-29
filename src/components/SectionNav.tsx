'use client'
import { useEffect, useState } from 'react'

const items = [
  ['Home', 'top'],
  ['About', 'about'],
  ['Vegetables', 'vegetables'],
  ['For Farmers', 'farmers'],
  ['For Buyers', 'buyers'],
  ['Contact', 'contact'],
] as const

// Header menu of the home page. Clicking a link scrolls to that section and the
// link of the section you are reading stays highlighted.
export default function SectionNav({ mobile = false }: { mobile?: boolean }) {
  const [active, setActive] = useState<string>('top')

  useEffect(() => {
    const els = items.map(([, id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const onScroll = () => {
      const y = window.scrollY + 140
      let current = 'top'
      for (const el of els) if (el.offsetTop <= y) current = el.id
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      aria-label="Sections"
      className={mobile ? 'flex lg:hidden gap-5 overflow-x-auto px-6 pb-3 text-sm text-[#d3e8da]' : 'hidden lg:flex gap-8 text-sm text-[#d3e8da]'}
    >
      {items.map(([label, id]) => (
        <a
          key={id}
          href={`#${id}`}
          className={`py-1 whitespace-nowrap border-b-2 hover:text-white ${
            active === id ? 'border-[#51cc50] text-white font-semibold' : 'border-transparent'
          }`}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}