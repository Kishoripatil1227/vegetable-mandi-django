import Link from 'next/link'
import PhotoTile from '@/components/PhotoTile'
import { LeafLogo } from '@/components/AuthShell'

// First photo that exists wins; the SVG illustration is the final fallback.
const HERO_BG =
  "linear-gradient(90deg, rgba(3,26,16,.96) 0%, rgba(3,26,16,.78) 38%, rgba(3,26,16,.15) 75%), url('/images/hero-market.jpg'), url('/images/hero-farmer.jpg'), url('/images/auth-hero.svg')"

const svg = { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const perks = [
  {
    t: 'Fresh & Natural',
    d: '100% fresh vegetables direct from farms',
    icon: <LeafLogo className="w-9 h-9" />,
  },
  {
    t: 'Fair Price',
    d: 'Best prices for both farmers and buyers',
    icon: (
      <svg {...svg} aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>
    ),
  },
  {
    t: 'Fast Delivery',
    d: 'From mandi to your home',
    icon: (
      <svg {...svg} aria-hidden="true"><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
    ),
  },
  {
    t: 'Support Farmers',
    d: 'Empowering local farmers and communities',
    icon: (
      <svg {...svg} aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" /><path d="M8 5.5h8" /></svg>
    ),
  },
]

const features = [
  { e: '📦', t: 'Lot intake', d: 'Receive new produce from farmers and generate a unique lot number automatically.' },
  { e: '⚖️', t: 'Weighment', d: 'Record gross and tare weight. Net weight is calculated and validated for you.' },
  { e: '🔨', t: 'Auction and price', d: 'Enter the price a buyer pays and see the total instantly.' },
  { e: '🧾', t: 'Commissions', d: 'Calculate the agent commission with a configurable default rate.' },
  { e: '✅', t: 'Settlements', d: 'Pay farmers their net amount. Only an admin can finalize a payment.' },
  { e: '📊', t: 'Reports and analytics', d: 'Search records, review totals and track daily mandi rates.' },
]

const steps = [
  ['1', 'Lot intake', '📦'],
  ['2', 'Weighment', '⚖️'],
  ['3', 'Auction', '🔨'],
  ['4', 'Commission', '🧾'],
  ['5', 'Settlement', '✅'],
]

const roles = [
  ['🛡️', 'Admin / Owner', 'Full access. Finalizes payments, manages users, rates and settings.'],
  ['👷', 'Staff / Operator', 'Daily entries for farmers, lots, weighments and auctions. Cannot finalize payments.'],
  ['🛒', 'Customer', 'Views their own purchases and rate details.'],
]

const gallery = [
  { n: 'Tomato', e: '🍅', img: '/images/veg-tomato.jpg' },
  { n: 'Onion', e: '🧅', img: '/images/veg-onion.jpg' },
  { n: 'Potato', e: '🥔', img: '/images/veg-potato.jpg' },
  { n: 'Cabbage', e: '🥬', img: '/images/veg-cabbage.jpg' },
  { n: 'Corn', e: '🌽', img: '/images/veg-corn.jpg' },
]

const nav = [
  ['Home', '#top'],
  ['About', '#about'],
  ['Vegetables', '#vegetables'],
  ['For Farmers', '#farmers'],
  ['For Buyers', '#buyers'],
  ['Contact', '#contact'],
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#031a10] text-white">
      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-30 bg-[#031a10]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-3">
          <a href="#top" className="flex items-center gap-3 shrink-0">
            <LeafLogo className="w-11 h-11" />
            <span className="leading-tight">
              <strong className="font-display text-lg block">Vegetable Mandi</strong>
              <small className="text-[11px] text-[#bcd6c5]">Fresh Produce · Fair Price · Better Tomorrow</small>
            </span>
          </a>

          <nav className="hidden lg:flex gap-8 text-sm text-[#d3e8da]">
            {nav.map(([label, href], i) => (
              <a
                key={label}
                href={href}
                className={`py-1 hover:text-white border-b-2 ${i === 0 ? 'border-[#51cc50] text-white' : 'border-transparent'}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#vegetables" aria-label="Browse vegetables" className="hidden sm:grid w-10 h-10 place-items-center rounded-full hover:bg-white/10">
              <svg {...svg} width={20} height={20} aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></svg>
            </a>
            <Link href="/login" className="border border-white/70 hover:bg-white/10 px-5 py-2 rounded-xl text-sm font-semibold transition">
              Login
            </Link>
            <Link href="/signup" className="bg-[#2fc44f] hover:bg-[#27ab44] text-white px-5 py-2 rounded-xl text-sm font-bold transition">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section
        id="top"
        className="relative"
        style={{ backgroundImage: HERO_BG, backgroundSize: 'cover', backgroundPosition: 'center right' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 min-h-[520px] flex flex-col justify-center">
          <p className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-full border border-[#51cc50]/40 bg-black/30 px-4 py-2 text-sm text-[#d3e8da]">
            <LeafLogo className="w-4 h-4" />
            Support Farmers <span className="text-white/30">|</span> Fresh Vegetables <span className="text-white/30">|</span> Healthy Future
          </p>

          <h1 className="font-display font-extrabold leading-[1.02] mt-6 text-5xl md:text-7xl max-w-3xl">
            Welcome to
            <span className="block text-[#a5f3a0]">Vegetable Mandi</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[#e3f2e8] max-w-xl">
            Connect directly with farmers, get fresh and quality vegetables at fair prices.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#vegetables" className="inline-flex items-center gap-2 bg-[#2fc44f] hover:bg-[#27ab44] text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-black/30 transition">
              Explore Vegetables <span aria-hidden>→</span>
            </a>
            <a href="#about" className="border border-white/70 hover:bg-white/10 px-7 py-3.5 rounded-xl font-semibold transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ---------- perks strip ---------- */}
      <section className="bg-[#04281a] border-y border-[#0f4a2e]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((p) => (
            <div key={p.t} className="flex items-center gap-4">
              <span className="w-16 h-16 rounded-full border-2 border-[#2fc44f]/70 text-[#51cc50] grid place-items-center shrink-0">
                {p.icon}
              </span>
              <div>
                <h3 className="font-display font-bold">{p.t}</h3>
                <p className="text-sm text-[#a9c9b5]">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- about / features ---------- */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold">Everything a mandi agent needs</h2>
        <p className="mt-2 text-[#a9c9b5]">One searchable system with a clear record of every change.</p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 hover:-translate-y-1 transition">
              <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{f.e}</span>
              <h3 className="font-display text-lg font-bold mt-4">{f.t}</h3>
              <p className="text-sm text-[#a9c9b5] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- vegetables ---------- */}
      <section id="vegetables" className="bg-[#04281a] border-y border-[#0f4a2e]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-2">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">Fresh from the farm, straight to the mandi</h2>
            <p className="text-[#a9c9b5]">Fresh produce, fair price, better tomorrow.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {gallery.map((g) => (
              <div key={g.n} className="group">
                <PhotoTile
                  src={g.img}
                  emoji={g.e}
                  label={g.n}
                  className="h-40 md:h-52 rounded-3xl bg-[#062a1b] border border-[#0f4a2e] group-hover:border-[#2fc44f]/60 transition"
                  emojiClass="text-7xl"
                />
                <p className="mt-2 text-center font-semibold">{g.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- for farmers: workflow ---------- */}
      <section id="farmers" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold">The workflow</h2>
        <p className="mt-2 text-[#a9c9b5]">For farmers: from the gate to the payment, every step is recorded.</p>
        <div className="relative mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-10 gap-x-4">
          <span aria-hidden className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-[#0f4a2e]" />
          {steps.map(([n, t, e]) => (
            <div key={n} className="relative flex flex-col items-center text-center">
              <span className="relative w-16 h-16 rounded-full bg-[#062a1b] border-2 border-[#2fc44f]/70 grid place-items-center text-3xl">
                {e}
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#2fc44f] text-white text-xs font-bold grid place-items-center">{n}</span>
              </span>
              <span className="font-display font-bold mt-3">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- for buyers: roles ---------- */}
      <section id="buyers" className="bg-[#04281a] border-y border-[#0f4a2e]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">Built for three kinds of users</h2>
          <p className="mt-2 text-[#a9c9b5]">For buyers: customers see their own purchases and rates.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {roles.map(([e, t, d]) => (
              <div key={t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 transition">
                <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{e}</span>
                <span className="inline-block mt-4 bg-[#2fc44f]/15 text-[#7be37a] text-sm font-semibold px-3 py-1 rounded-full">{t}</span>
                <p className="text-sm text-[#a9c9b5] mt-3">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- contact / call to action ---------- */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
        <div
          className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center border border-[#0f4a2e]"
          style={{ background: 'linear-gradient(135deg, #062a1b 0%, #0a4a2c 100%)' }}
        >
          <span aria-hidden className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-white/5" />
          <span aria-hidden className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-[#51cc50]/15" />
          <div className="relative">
            <div aria-hidden className="flex justify-center gap-2 text-3xl mb-4">🍅 🥕 🧅 🥬 🌽</div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">Ready to run your mandi from one place?</h2>
            <p className="mt-2 text-[#a9c9b5]">Questions about the system? Contact your mandi administrator.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="border border-white/70 hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition">
                Login
              </Link>
              <Link href="/signup" className="bg-[#2fc44f] hover:bg-[#27ab44] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-black/30 transition">
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-[#8fb39c]">
        Vegetable Mandi Agent · Full Stack Internship Project · React, Django, Supabase and Vercel
      </footer>
    </div>
  )
}