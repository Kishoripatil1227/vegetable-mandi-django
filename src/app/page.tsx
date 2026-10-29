import Link from 'next/link'
import PhotoTile from '@/components/PhotoTile'
import SectionNav from '@/components/SectionNav'
import { LeafLogo } from '@/components/AuthShell'

// Change these to the real contact details of your mandi.
const CONTACT = {
  place: 'Vegetable Mandi, [belgaum], [karnataka]',
  phone: '+91 9686102628',
  email: 'kishoripatil1210@gmail.com',
  hours: 'Monday to Saturday, 5:00 am to 2:00 pm',
}

// First photo that exists wins; the SVG illustration is the final fallback.
const HERO_BG =
  "linear-gradient(90deg, rgba(3,26,16,.96) 0%, rgba(3,26,16,.78) 38%, rgba(3,26,16,.15) 75%), url('/images/hero-market.jpg'), url('/images/hero-farmer.jpg'), url('/images/auth-hero.svg')"

const svg = { width: 34, height: 34, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const perks = [
  { t: 'Fresh & Natural', d: '100% fresh vegetables direct from farms', icon: <LeafLogo className="w-9 h-9" /> },
  {
    t: 'Fair Price',
    d: 'Best prices for both farmers and buyers',
    icon: <svg {...svg} aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>,
  },
  {
    t: 'Fast Delivery',
    d: 'From mandi to your home',
    icon: <svg {...svg} aria-hidden="true"><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>,
  },
  {
    t: 'Support Farmers',
    d: 'Empowering local farmers and communities',
    icon: <svg {...svg} aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6" /><path d="M8 5.5h8" /></svg>,
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

const farmerPoints = [
  { e: '🧾', t: 'Every delivery gets a lot number', d: 'The mandi staff register you once. After that each load you bring is saved with its own lot number, date and quantity.' },
  { e: '⚖️', t: 'Honest weight', d: 'Gross weight, tare weight and net weight are written in the system, so the weight you are paid for is always on record.' },
  { e: '💰', t: 'Clear price and commission', d: 'The auction rate, the total amount and the commission that is deducted are shown for every lot.' },
  { e: '📅', t: 'Payment you can track', d: 'Each settlement is Pending or Paid, with the date of payment, and only the admin can mark it paid.' },
]

const buyerPoints = [
  { e: '🔐', t: 'Your own login', d: 'Register as a customer. The mandi admin links your login to your buyer profile.' },
  { e: '🛒', t: 'Your purchase history', d: 'See every lot you bought: vegetable, net kg, rate, amount and date.' },
  { e: '📈', t: 'Rates at a glance', d: 'Your dashboard shows total quantity, total amount and your average rate per kg.' },
  { e: '🥕', t: 'Spend by vegetable', d: 'Find out which vegetables you spend the most on.' },
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

          <SectionNav />

          <div className="flex items-center gap-3">
            <Link href="/login" className="border border-white/70 hover:bg-white/10 px-5 py-2 rounded-xl text-sm font-semibold transition">
              Login
            </Link>
            <Link href="/signup" className="bg-[#2fc44f] hover:bg-[#27ab44] text-white px-5 py-2 rounded-xl text-sm font-bold transition">
              Register
            </Link>
          </div>
        </div>
        <SectionNav mobile />
      </header>

      {/* ---------- hero (Home) ---------- */}
      <section
        id="top"
        className="relative scroll-mt-24"
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
              <span className="w-16 h-16 rounded-full border-2 border-[#2fc44f]/70 text-[#51cc50] grid place-items-center shrink-0">{p.icon}</span>
              <div>
                <h3 className="font-display font-bold">{p.t}</h3>
                <p className="text-sm text-[#a9c9b5]">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <p className="text-sm font-semibold tracking-widest uppercase text-[#51cc50]">About</p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-2">Everything a mandi agent needs</h2>
        <p className="mt-3 text-[#a9c9b5] max-w-3xl">
          Vegetable Mandi replaces paper registers with one digital system: from the moment a farmer brings a load to the day the farmer is paid,
          every step is recorded, calculated and searchable.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 hover:-translate-y-1 transition">
              <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{f.e}</span>
              <h3 className="font-display text-lg font-bold mt-4">{f.t}</h3>
              <p className="text-sm text-[#a9c9b5] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display text-2xl font-extrabold mt-16">Built for three kinds of users</h3>
        <div className="mt-6 grid md:grid-cols-3 gap-5">
          {roles.map(([e, t, d]) => (
            <div key={t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 transition">
              <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{e}</span>
              <span className="inline-block mt-4 bg-[#2fc44f]/15 text-[#7be37a] text-sm font-semibold px-3 py-1 rounded-full">{t}</span>
              <p className="text-sm text-[#a9c9b5] mt-3">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Vegetables ---------- */}
      <section id="vegetables" className="bg-[#04281a] border-y border-[#0f4a2e] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold tracking-widest uppercase text-[#51cc50]">Vegetables</p>
          <div className="flex items-end justify-between flex-wrap gap-2 mt-2">
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

      {/* ---------- For Farmers ---------- */}
      <section id="farmers" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <p className="text-sm font-semibold tracking-widest uppercase text-[#51cc50]">For Farmers</p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-2">Fair weight, clear price, payment you can track</h2>
        <p className="mt-3 text-[#a9c9b5] max-w-3xl">
          Farmers do not need to log in. The mandi staff register you and record your produce, and you can ask for your lot and payment details at any time.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {farmerPoints.map((f) => (
            <div key={f.t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 transition">
              <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{f.e}</span>
              <h3 className="font-display text-lg font-bold mt-4">{f.t}</h3>
              <p className="text-sm text-[#a9c9b5] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display text-2xl font-extrabold mt-16">How your produce moves</h3>
        <div className="relative mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-10 gap-x-4">
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
        <a href="#contact" className="inline-block mt-10 border border-white/70 hover:bg-white/10 px-7 py-3 rounded-xl font-semibold transition">
          Talk to the mandi
        </a>
      </section>

      {/* ---------- For Buyers ---------- */}
      <section id="buyers" className="bg-[#04281a] border-y border-[#0f4a2e] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <p className="text-sm font-semibold tracking-widest uppercase text-[#51cc50]">For Buyers</p>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-2">See what you bought and what you paid</h2>
          <p className="mt-3 text-[#a9c9b5] max-w-3xl">
            Buyers get a customer login. Once the admin links it to your buyer profile, your purchases and rates appear on your own dashboard.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {buyerPoints.map((f) => (
              <div key={f.t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6 hover:border-[#2fc44f]/60 transition">
                <span className="w-14 h-14 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-3xl">{f.e}</span>
                <h3 className="font-display text-lg font-bold mt-4">{f.t}</h3>
                <p className="text-sm text-[#a9c9b5] mt-1.5">{f.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/signup" className="bg-[#2fc44f] hover:bg-[#27ab44] text-white px-7 py-3 rounded-xl font-bold shadow-lg shadow-black/30 transition">
              Register as a buyer
            </Link>
            <Link href="/login" className="border border-white/70 hover:bg-white/10 px-7 py-3 rounded-xl font-semibold transition">
              Customer login
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20 scroll-mt-24">
        <p className="text-sm font-semibold tracking-widest uppercase text-[#51cc50]">Contact</p>
        <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-2">Talk to the mandi</h2>
        <p className="mt-3 text-[#a9c9b5] max-w-3xl">
          Questions about registering a farmer or a buyer, a lot or a payment? Reach the mandi office.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            ['📍', 'Address', CONTACT.place],
            ['📞', 'Phone', CONTACT.phone],
            ['✉️', 'Email', CONTACT.email],
            ['🕒', 'Office hours', CONTACT.hours],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-3xl bg-[#062a1b] border border-[#0f4a2e] p-6">
              <span className="w-12 h-12 rounded-2xl bg-[#2fc44f]/15 grid place-items-center text-2xl">{e}</span>
              <h3 className="font-display font-bold mt-4">{t}</h3>
              <p className="text-sm text-[#a9c9b5] mt-1 break-words">{d}</p>
            </div>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl p-10 md:p-12 mt-10 text-center border border-[#0f4a2e]"
          style={{ background: 'linear-gradient(135deg, #062a1b 0%, #0a4a2c 100%)' }}
        >
          <span aria-hidden className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-white/5" />
          <span aria-hidden className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-[#51cc50]/15" />
          <div className="relative">
            <div aria-hidden className="flex justify-center gap-2 text-3xl mb-4">🍅 🥕 🧅 🥬 🌽</div>
            <h3 className="font-display text-2xl md:text-3xl font-extrabold">Ready to run your mandi from one place?</h3>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a href={`mailto:${CONTACT.email}`} className="border border-white/70 hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition">
                Send an email
              </a>
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