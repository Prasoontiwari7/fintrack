import { useState } from 'react'
import { MessageCircle, Plus } from 'lucide-react'

function AddExpensePage() {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('New expense:', { name, amount, category })
    setName('')
    setAmount('')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Add Expense</h1>
        <p className="text-stone text-sm mt-1">Log a new transaction manually or via WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-stone mb-2">Expense Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Swiggy order"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition" required />
            </div>
            <div>
              <label className="block text-sm text-stone mb-2">Amount (₹)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition" required />
            </div>
            <div>
              <label className="block text-sm text-stone mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold transition">
                {['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Income'].map((c) => (
                  <option key={c} value={c} className="bg-ink">{c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light active:scale-[0.98] transition flex items-center justify-center gap-2">
              <Plus size={18} /> Add Expense
            </button>
          </form>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald/20 flex items-center justify-center mb-4">
            <MessageCircle size={26} className="text-emerald-light" />
          </div>
          <h2 className="text-cream font-semibold mb-2">Add via WhatsApp</h2>
          <p className="text-stone text-sm max-w-xs">Message your FinTrack WhatsApp number like "Spent 450 on food" and it'll appear here automatically. Coming soon.</p>
        </div>

      </div>
    </div>
  )
}

export default AddExpensePage