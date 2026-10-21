'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import StatusBadge from '@/components/StatusBadge'

const one = (v: any) => (Array.isArray(v) ? v[0] : v)
const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })

const vegEmoji = (name?: string | null) => {
  const n = (name || '').toLowerCase()
  const map: [string, string][] = [
    ['tomato', '🍅'], ['onion', '🧅'], ['potato', '🥔'], ['carrot', '🥕'], ['cabbage', '🥬'], ['spinach', '🥬'],
    ['cauliflower', '🥦'], ['broccoli', '🥦'], ['brinjal', '🍆'], ['eggplant', '🍆'], ['corn', '🌽'], ['cucumber', '🥒'],
    ['garlic', '🧄'], ['chilli', '🌶️'], ['capsicum', '🫑'], ['pepper', '🫑'], ['pumpkin', '🎃'], ['peas', '🫛'], ['beans', '🫛'],
  ]
  return map.find(([k]) => n.includes(k))?.[1] || '🥬'
}

type D = {
  lots_today: number; active_farmers: number; pending_count: number; pending_amount: number
  total_sales: number; total_commission: number; by_status: Record<string, number>
}

function Stat({ icon, label, value, sub, tone, href }: { icon: string; label: string; value: string | number; sub?: string; tone: string; href?: string }) {
  const card = (
    <div className="bg-white rounded-2xl p-3 transition hover:-translate-y-1 hover:shadow-xl h-full">
      <div className={`h-24 rounded-2xl grid place-items-center text-5xl ${tone}`}>{icon}</div>
      <div className="flex items-end justify-between gap-2 px-2 pt-3 pb-1">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[#5b6f68] font-bold">{label}</p>
          <p className="text-2xl font-extrabold text-[#12261f] truncate mt-1">{value}</p>
          <p className="text-xs text-[#5b6f68] min-h-4">{sub}</p>
        </div>
        {href && (
          <span className="w-9 h-9 rounded-xl bg-[#0d4637] text-white grid place-items-center shrink-0">→</span>
        )}
      </div>
    </div>
  )
  return href ? <Link href={href} className="block">{card}</Link> : card
}

function Banner({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl text-white p-6 md:p-8 min-h-[210px]"
      style={{ background: 'linear-gradient(135deg, #0d4637 0%, #0a5340 55%, #0e6b50 100%)' }}
    >
      <span aria-hidden className="pointer-events-none absolute -right-12 -top-20 w-72 h-72 rounded-full bg-white/5" />
      <span aria-hidden className="pointer-events-none absolute right-40 -bottom-28 w-60 h-60 rounded-full bg-[#51cc50]/15" />
      <div aria-hidden className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 w-72 h-48 select-none">
        <span className="absolute left-4 top-10 w-28 h-28 rounded-full bg-white/15 border border-white/20 grid place-items-center text-6xl">🍅</span>
        <span className="absolute left-28 top-0 w-24 h-24 rounded-full bg-white/15 border border-white/20 grid place-items-center text-5xl">🥕</span>
        <span className="absolute right-0 top-14 w-28 h-28 rounded-full bg-white/15 border border-white/20 grid place-items-center text-6xl">🥬</span>
        <span className="absolute left-24 bottom-0 w-20 h-20 rounded-full bg-white/15 border border-white/20 grid place-items-center text-4xl">🌽</span>
      </div>
      <div className="relative max-w-xl">
        {children}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}

function CustomerView() {
  const [r, setR] = useState<any>(null)
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((x) => x.json()).then(setMe)
    fetch('/api/my').then((x) => x.json()).then(setR)
  }, [])

  if (!r) return <p className="text-[#5b6f68]">Loading...</p>

  const rows: any[] = r.data || []
  const kg = (a: any) => Number(one(one(a.produce_lots)?.weighments)?.net_weight || 0)
  const totalKg = rows.reduce((s, a) => s + kg(a), 0)
  const spent = Number(r.summary?.total_spent || 0)
  const avg = totalKg > 0 ? spent / totalKg : 0

  const byVeg: Record<string, { amt: number; kg: number }> = {}
  rows.forEach((a) => {
    const n = one(one(a.produce_lots)?.vegetables)?.name || 'Other'
    byVeg[n] ||= { amt: 0, kg: 0 }
    byVeg[n].amt += Number(a.total_amount)
    byVeg[n].kg += kg(a)
  })
  const vegList = Object.entries(byVeg).sort((a, b) => b[1].amt - a[1].amt)
  const maxVeg = Math.max(1, ...vegList.map(([, v]) => v.amt))

  return (
    <div className="space-y-6">
      <Banner>
        <p className="text-sm text-[#9dbfaa]">Customer dashboard</p>
        <h1 className="!text-white !text-3xl md:!text-4xl mt-1">
          <span className="font-script text-[#72dd37] text-4xl md:text-5xl">Welcome,</span> {me?.name || 'Customer'}
        </h1>
        {r.linked && (
          <p className="mt-3 text-[#d6e9dc]">
            Buyer profile: <span className="font-semibold bg-white/15 px-2.5 py-0.5 rounded-full">{r.buyer}</span>
          </p>
        )}
      </Banner>

      {!r.linked ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">🔗</div>
          <h2 className="text-lg font-semibold">Account link pending</h2>
          <p className="text-[#5b6f68] mt-1">Your account has not been linked to a buyer profile yet. Please contact the mandi admin.</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">🥬</div>
          <h2 className="text-lg font-semibold">No purchases yet</h2>
          <p className="text-[#5b6f68] mt-1">Your purchase summary will appear here once an auction is recorded.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat icon="🧾" label="Purchases" value={r.summary.purchases} tone="bg-[#e1f0ea]" />
            <Stat icon="⚖️" label="Total quantity" value={`${totalKg.toFixed(1)} kg`} tone="bg-[#e4eefc]" />
            <Stat icon="💰" label="Total amount" value={inr(spent)} tone="bg-[#ffece5]" />
            <Stat icon="📈" label="Average rate" value={`${inr(avg)}/kg`} tone="bg-[#efe8fb]" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <h2 className="mb-4">Spend by vegetable</h2>
              {vegList.map(([name, v]) => (
                <div key={name} className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{name} <span className="text-[#8aa097]">({v.kg.toFixed(1)} kg)</span></span>
                    <span className="font-semibold">{inr(v.amt)}</span>
                  </div>
                  <div className="h-2.5 bg-[#eaf0ed] rounded-full mt-1.5">
                    <div className="h-2.5 bg-[#0e6b50] rounded-full" style={{ width: `${(v.amt / maxVeg) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 lg:col-span-2 overflow-x-auto">
              <h2 className="mb-4">My purchases</h2>
              <table className="text-sm">
                <thead>
                  <tr className="text-left">
                    <th>Lot</th><th>Vegetable</th>
                    <th className="text-right">Net kg</th><th className="text-right">Rate</th>
                    <th className="text-right">Amount</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => {
                    const lot = one(a.produce_lots)
                    return (
                      <tr key={a.id}>
                        <td className="font-semibold">{lot?.lot_no}</td>
                        <td>{one(lot?.vegetables)?.name}</td>
                        <td className="text-right">{one(lot?.weighments)?.net_weight}</td>
                        <td className="text-right">{inr(Number(a.rate_per_kg))}</td>
                        <td className="text-right font-semibold">{inr(Number(a.total_amount))}</td>
                        <td className="text-[#5b6f68]">{a.auction_date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const stages = [
  { k: 'received', label: 'Received', c: 'bg-[#ff5e31]' },
  { k: 'weighed', label: 'Weighed', c: 'bg-[#3b82f6]' },
  { k: 'auctioned', label: 'Auctioned', c: 'bg-[#8b5cf6]' },
  { k: 'settled', label: 'Settled', c: 'bg-[#0e6b50]' },
]

const actions = [
  { href: '/lots', icon: '📦', t: 'New lot', d: 'Receive produce' },
  { href: '/weighments', icon: '⚖️', t: 'Weigh a lot', d: 'Gross and tare' },
  { href: '/auctions', icon: '🔨', t: 'Record auction', d: 'Price and buyer' },
  { href: '/settlements', icon: '✅', t: 'Settle payment', d: 'Pay the farmer' },
  { href: '/reports', icon: '📊', t: 'View reports', d: 'Sales and rates' },
]

export default function Dashboard() {
  const [d, setD] = useState<D | null>(null)
  const [denied, setDenied] = useState(false)
  const [me, setMe] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then((x) => x.json()).then(setMe)
    fetch('/api/lots?page=1')
      .then((x) => (x.ok ? x.json() : null))
      .then((j) => j && setRecent((j.data || []).slice(0, 5)))
      .catch(() => {})
    fetch('/api/dashboard').then(async (r) => {
      if (r.ok) setD(await r.json())
      else setDenied(true)
    })
  }, [])

  if (denied) return <CustomerView />
  if (!d) return <p className="text-[#5b6f68]">Loading...</p>

  const totalLots = Object.values(d.by_status).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <Banner
        action={
          <Link
            href="/lots"
            className="inline-block bg-[#ff5e31] hover:bg-[#e04a1f] text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-black/20 transition"
          >
            + New lot
          </Link>
        }
      >
        <p className="text-sm text-[#9dbfaa]">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="!text-white !text-3xl md:!text-4xl mt-1">
          <span className="font-script text-[#72dd37] text-4xl md:text-5xl">Welcome back,</span> {me?.name || 'there'}
        </h1>
        <p className="mt-2 text-[#d6e9dc]">Here is what is happening in your mandi today.</p>
      </Banner>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon="📦" label="Today's lots" value={d.lots_today} tone="bg-[#e1f0ea]" href="/lots" />
        <Stat icon="🧑‍🌾" label="Active farmers" value={d.active_farmers} tone="bg-[#e4eefc]" href="/farmers" />
        <Stat icon="⏳" label="Pending payments" value={inr(d.pending_amount)} sub={`${d.pending_count} settlements`} tone="bg-[#ffece5]" href="/settlements" />
        <Stat icon="💰" label="Total sales" value={inr(d.total_sales)} sub={`Commission ${inr(d.total_commission)}`} tone="bg-[#efe8fb]" href="/reports" />
      </div>

      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Lot pipeline</h2>
          <span className="text-sm text-[#5b6f68]">{totalLots} lots in total</span>
        </div>
        <div className="flex h-3.5 rounded-full overflow-hidden bg-[#eaf0ed]">
          {stages.map((s) => (
            <div key={s.k} className={s.c} style={{ width: `${totalLots ? ((d.by_status[s.k] || 0) / totalLots) * 100 : 0}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {stages.map((s) => (
            <div key={s.k} className="rounded-2xl bg-[#f4f8f6] border border-[#e3ece8] p-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${s.c}`} />
                <span className="text-sm text-[#5b6f68]">{s.label}</span>
              </div>
              <p className="text-3xl font-extrabold mt-2">{d.by_status[s.k] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg">Quick actions</h2>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {actions.map((a) => (
            <Link key={a.href} href={a.href} className="flex flex-col items-center gap-2 min-w-[104px] group">
              <span className="w-16 h-16 rounded-full bg-white border border-[#dbe5e1] shadow-sm grid place-items-center text-3xl transition group-hover:border-[#ff5e31] group-hover:shadow-lg group-hover:-translate-y-0.5">
                {a.icon}
              </span>
              <span className="text-sm font-bold text-center">{a.t}</span>
              <span className="text-[11px] text-[#5b6f68] text-center -mt-1.5">{a.d}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg">Recent lots</h2>
          <Link href="/lots" className="text-sm font-bold text-[#ff5e31] hover:underline">See all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-[#5b6f68] py-4">No lots yet. Use "New lot" to receive the first produce.</p>
        ) : (
          <ul className="divide-y divide-[#edf1ed]">
            {recent.map((l) => (
              <li key={l.id} className="flex items-center gap-4 py-3">
                <span className="w-12 h-12 rounded-2xl bg-[#e1f0ea] grid place-items-center text-2xl shrink-0">
                  {vegEmoji(one(l.vegetables)?.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{l.lot_no}</p>
                  <p className="text-xs text-[#5b6f68] truncate">
                    {one(l.vegetables)?.name} · {one(l.farmers)?.name}
                  </p>
                </div>
                <p className="text-sm font-semibold hidden sm:block">{l.quantity} kg</p>
                <StatusBadge s={l.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}