import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { getDashboardAnalytics } from '../api';
import SpendHeatmap from './SpendHeatmap';

const tooltipStyle = {
  background: '#13160f',
  border: '1px solid #c9a35e30',
  borderRadius: '12px',
};

const tooltipItemStyle = {
  color: '#f3eee3',
};

const tooltipLabelStyle = {
  color: '#c9a35e',
  fontWeight: 'bold',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius) * cos;
  const sy = cy + (outerRadius) * sin;
  const mx = cx + (outerRadius + 15) * cos;
  const my = cy + (outerRadius + 15) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 12;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#8b8579" fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill="#8b8579" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 6} y={ey} textAnchor={textAnchor} fill="#f3eee3" dominantBaseline="central" className="text-[10px] font-semibold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getDashboardAnalytics();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load analytics data.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching analytics from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone text-sm">Generating trend models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rust/15 border border-rust/30 text-rust max-w-xl mx-auto my-8">
        <h3 className="font-semibold text-lg mb-2">Error Loading Analytics</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const { categoryBreakdown, sixMonthTrend, dailyHeatmap } = data;
  const filteredBreakdown = categoryBreakdown.filter((c) => c.amount > 0);
  const total = filteredBreakdown.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Analytics</h1>
        <p className="text-stone text-sm mt-1">Where your money goes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Category Split</h2>
          {filteredBreakdown.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={filteredBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    label={renderCustomizedLabel}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {filteredBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  <Legend
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      const percent = total > 0 ? ((payload.amount / total) * 100).toFixed(1) : 0;
                      return (
                        <span className="text-stone inline-block mr-2 font-medium">
                          {value} <span className="text-cream font-semibold ml-1">{percent}%</span>
                        </span>
                      );
                    }}
                    wrapperStyle={{ fontSize: '12px', color: '#8b8579' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] text-stone uppercase tracking-wider font-semibold">Total Expenses</p>
                <p className="text-lg font-bold text-cream mt-0.5">₹{total.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-stone text-sm">
              No expense data available.
            </div>
          )}
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Category Breakdown</h2>
          <div className="flex flex-col gap-4">
            {filteredBreakdown.length > 0 ? (
              filteredBreakdown.map((c) => {
                const pct = total > 0 ? ((c.amount / total) * 100).toFixed(0) : 0;
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cream font-medium">{c.category}</span>
                      <span className="text-stone">
                        ₹{c.amount.toLocaleString()} · {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-cream/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-stone text-sm py-12 text-center">
                Log expenses to see their category breakdown here.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Income vs Expense & Net Savings</h2>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={sixMonthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3eee310" vertical={false} />
              <XAxis dataKey="month" stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#8b8579' }} />
              <Bar dataKey="income" fill="#6fae8c" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#c9a35e" radius={[6, 6, 0, 0]} name="Expense" />
              <Line type="monotone" dataKey="savings" stroke="#e3c98a" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Net Savings" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Daily Spend</h2>
          <SpendHeatmap dailyHeatmap={dailyHeatmap} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;