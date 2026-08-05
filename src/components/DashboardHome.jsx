import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { metrics, transactions, monthlySpending, categoryBreakdown, budgetUsedPercent } from '../data/dummyData'
import CoinBuddy from './CoinBuddy'

const iconMap = {
  'Total Balance': Wallet,
  "This Month's Spending": TrendingDown,
  'Total Income': TrendingUp,
  'Budget Remaining': Target,
}

function DashboardHome() {
  const mood = budgetUsedPercent > 80 ? 'concerned' : 'happy'

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <CoinBuddy mood={mood} size={56} />
        <div>
          <h1 className="text-2xl font-bold text-cream">Good evening, Rohan</h1>
          <p className="text-stone text-sm mt-1">Here's what's happening with your money</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m) => {
          const Icon = iconMap[m.label]
          return (
            <div key={m.label} className="bg-charcoal border border-cream/10 rounded-2xl p-5 hover:border-gold/30 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Icon size={18} className="text-gold" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${m.up ? 'text-emerald-light' : 'text-rust'}`}>
                  {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {m.change}
                </span>
              </div>
              <p className="text-stone text-sm mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-cream">₹{m.value.toLocaleString()}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

        <div className="lg:col-span-2 bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Spending Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlySpending}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a35e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#c9a35e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3eee310" vertical={false} />
              <XAxis dataKey="day" stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#13160f', border: '1px solid #c9a35e30', borderRadius: '12px', color: '#f3eee3' }} />
              <Area type="monotone" dataKey="amount" stroke="#c9a35e" strokeWidth={2} fill="url(#spendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Latest Transactions</h2>
          <div className="flex flex-col gap-4">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="text-cream text-sm font-medium">{t.name}</p>
                  <p className="text-stone text-xs">{t.category} · {t.date}</p>
                </div>
                <p className={`text-sm font-semibold ${t.amount > 0 ? 'text-emerald-light' : 'text-cream/80'}`}>
                  {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
        <h2 className="text-cream font-semibold mb-4">Spending by Category</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis dataKey="category" type="category" stroke="#8b8579" fontSize={13} tickLine={false} axisLine={false} width={90} />
            <Tooltip contentStyle={{ background: '#13160f', border: '1px solid #c9a35e30', borderRadius: '12px', color: '#f3eee3' }} />
            <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
              {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}

export default DashboardHome