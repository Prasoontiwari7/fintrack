import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { categoryBreakdown, sixMonthTrend } from '../data/dummyData'
import SpendHeatmap from './SpendHeatmap'

const tooltipStyle = { background: '#13160f', border: '1px solid #c9a35e30', borderRadius: '12px', color: '#f3eee3' }

function AnalyticsPage() {
  const total = categoryBreakdown.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Analytics</h1>
        <p className="text-stone text-sm mt-1">Where your money goes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Category Split</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryBreakdown} dataKey="amount" nameKey="category" innerRadius={70} outerRadius={100} paddingAngle={3}>
                {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '13px', color: '#8b8579' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Category Breakdown</h2>
          <div className="flex flex-col gap-4">
            {categoryBreakdown.map((c) => {
              const pct = ((c.amount / total) * 100).toFixed(0)
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cream font-medium">{c.category}</span>
                    <span className="text-stone">₹{c.amount.toLocaleString()} · {pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-cream/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sixMonthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3eee310" vertical={false} />
              <XAxis dataKey="month" stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#8b8579' }} />
              <Bar dataKey="income" fill="#6fae8c" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#c9a35e" radius={[6, 6, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Daily Spend</h2>
          <SpendHeatmap />
        </div>

      </div>
    </div>
  )
}

export default AnalyticsPage