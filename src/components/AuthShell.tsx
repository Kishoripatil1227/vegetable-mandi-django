import Link from 'next/link'

export function LeafLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M22 43C8 39 3 24 7 7c15 0 25 10 24 27z" fill="#72dd37" />
      <path d="M26 43c0-15 6-30 19-37 2 17-4 32-19 37z" fill="#2aa648" />
    </svg>
  )
}

const slips = [
  { c: '#d6452d', v: 'Tomato', f: 'Ramesh Patil', l: 'L-1001', kg: '1,200 kg', rot: '-rotate-2', ml: '' },
  { c: '#9b4f96', v: 'Onion', f: 'Sunita Devi', l: 'L-1002', kg: '2,050 kg', rot: 'rotate-1', ml: 'ml-9' },
  { c: '#b08a4f', v: 'Potato', f: 'Mahesh Gowda', l: 'L-1003', kg: '1,800 kg', rot: '-rotate-1', ml: '' },
]

// Drop a photo at public/images/login-bg.jpg to put it behind the illustration.
const BACKDROP =
  "linear-gradient(180deg, rgba(3,22,12,.35) 0%, rgba(3,22,12,.78) 100%), url('/images/login-bg.jpg'), url('/images/auth-hero.svg')"

export default function AuthShell({
  children,
  tone = 'light',
}: {
  children: React.ReactNode
  tone?: 'light' | 'glass'
}) {
  return (
    <div
      className="min-h-screen grid md:grid-cols-[1.15fr_1fr] text-white bg-[#06210f]"
      style={{ backgroundImage: BACKDROP, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <section className="px-8 py-8 md:px-14 md:py-12 flex flex-col justify-between gap-8 md:gap-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <LeafLogo className="w-11 h-11" />
            <strong className="font-display text-xl md:text-2xl font-extrabold">Vegetable Mandi Agent</strong>
          </Link>
          <p className="mt-2 text-xs tracking-[.22em] uppercase text-[#bcd6c5]">
            Fresh Produce · Fair Price · Better Tomorrow
          </p>
        </div>

        <div>
          <h1 className="font-script text-5xl md:text-7xl font-bold leading-[.95] max-w-[14ch]">
            Every lot, from the gate to the{' '}
            <span className="text-[#72dd37]">farmer&apos;s payment.</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[#d3e8da] max-w-[42ch]">
            Receive, weigh, price, take commission and settle in one place, instead of five registers.
          </p>
        </div>

        <div className="hidden md:grid gap-3 max-w-[340px]">
          {slips.map((s) => (
            <div
              key={s.l}
              className={`relative bg-white/95 text-[#12261f] rounded-xl py-2.5 pl-5 pr-4 shadow-lg ${s.rot} ${s.ml}`}
            >
              <span className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ background: s.c }} />
              <b className="font-display block">{s.v}</b>
              <span className="block text-sm text-[#5b6f68]">{s.f}</span>
              <small className="text-xs text-[#5b6f68] mr-3">{s.l}</small>
              <small className="text-xs text-[#5b6f68]">{s.kg}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="grid place-items-center p-5 md:p-8">
        <div
          className={`w-full max-w-md rounded-3xl p-7 md:p-9 ${
            tone === 'glass' ? 'auth-glass' : 'bg-white/95 text-[#12261f] shadow-2xl'
          }`}
        >
          {children}
        </div>
      </section>
    </div>
  )
}