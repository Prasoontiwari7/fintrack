import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getDashboardSummary } from '../api';
import CoinBuddy from './CoinBuddy';

const iconMap = {
  'Total Balance': Wallet,
  "This Month's Spending": TrendingDown,
  'Total Income': TrendingUp,
  'Budget Remaining': Target,
};

function DashboardHome({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getDashboardSummary();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message || 'Failed to load summary data');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch financial data from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone text-sm">Aggregating ledger data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rust/15 border border-rust/30 text-rust max-w-xl mx-auto my-8">
        <h3 className="font-semibold text-lg mb-2">Error Loading Dashboard</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const { metrics, latestTransactions, monthlySpending, categoryBreakdown, budgetUsedPercent } = data;
  const mood = budgetUsedPercent > 80 ? 'concerned' : 'happy';

  // Helper to format dates
  const formatTxDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return `Today, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffTime = Math.abs(today - dateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return `${diffDays} days ago`;
      }
      return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <CoinBuddy mood={mood} size={56} />
        <div>
          <h1 className="text-2xl font-bold text-cream">Good evening, {user?.name || 'User'}</h1>
          <p className="text-stone text-sm mt-1">Here's what's happening with your money</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m) => {
          const Icon = iconMap[m.label] || Wallet;
          return (
            <div key={m.label} className="bg-charcoal border border-cream/10 rounded-2xl p-5 hover:border-gold/30 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Icon size={18} className="text-gold" />
                </div>
                {m.change ? (
                  <span className={`text-xs font-medium flex items-center gap-1 ${m.up ? 'text-emerald-light' : 'text-rust'}`}>
                    {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {m.change}
                  </span>
                ) : null}
              </div>
              <p className="text-stone text-sm mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-cream">₹{m.value.toLocaleString()}</p>
              {m.subtext && <p className="text-stone/60 text-xs mt-1">{m.subtext}</p>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Spending Overview</h2>
          {monthlySpending && monthlySpending.length > 0 ? (
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
                <Tooltip 
                  contentStyle={{ background: '#13160f', border: '1px solid #c9a35e30', borderRadius: '12px' }} 
                  itemStyle={{ color: '#f3eee3' }} 
                  labelStyle={{ color: '#c9a35e', fontWeight: 'bold' }} 
                />
                <Area type="monotone" dataKey="amount" stroke="#c9a35e" strokeWidth={2} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-stone text-sm">
              No spending logged this month yet.
            </div>
          )}
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Latest Transactions</h2>
          <div className="flex flex-col gap-4">
            {latestTransactions && latestTransactions.length > 0 ? (
              latestTransactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-cream text-sm font-medium">{t.name}</p>
                    <p className="text-stone text-xs">{t.category} · {formatTxDate(t.date)}</p>
                  </div>
                  <p className={`text-sm font-semibold ${t.amount > 0 ? 'text-emerald-light' : 'text-cream/80'}`}>
                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-stone text-sm py-8 text-center">
                No recent transactions found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
        <h2 className="text-cream font-semibold mb-4">Spending by Category</h2>
        {categoryBreakdown && categoryBreakdown.some(c => c.amount > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" stroke="#8b8579" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="category" type="category" stroke="#8b8579" fontSize={13} tickLine={false} axisLine={false} width={90} />
              <Tooltip 
                contentStyle={{ background: '#13160f', border: '1px solid #c9a35e30', borderRadius: '12px' }} 
                itemStyle={{ color: '#f3eee3' }} 
                labelStyle={{ color: '#c9a35e', fontWeight: 'bold' }} 
              />
              <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-stone text-sm">
            No expenses logged to display category chart.
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;