import { transactions } from '../data/dummyData'

function TransactionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Transactions</h1>
        <p className="text-stone text-sm mt-1">All your recent activity</p>
      </div>

      <div className="bg-charcoal border border-cream/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream/10 text-left">
              <th className="p-4 text-stone text-xs font-medium uppercase">Name</th>
              <th className="p-4 text-stone text-xs font-medium uppercase">Category</th>
              <th className="p-4 text-stone text-xs font-medium uppercase">Date</th>
              <th className="p-4 text-stone text-xs font-medium uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-cream/5 hover:bg-cream/5 transition">
                <td className="p-4 text-cream text-sm font-medium">{t.name}</td>
                <td className="p-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-gold/10 text-gold">{t.category}</span>
                </td>
                <td className="p-4 text-stone text-sm">{t.date}</td>
                <td className={`p-4 text-sm font-semibold text-right ${t.amount > 0 ? 'text-emerald-light' : 'text-cream/80'}`}>
                  {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TransactionsPage