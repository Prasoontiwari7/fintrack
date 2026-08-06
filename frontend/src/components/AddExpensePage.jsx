import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import { createTransaction } from '../api';

function AddExpensePage({ setActive }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await createTransaction({
        name,
        amount: Number(amount),
        category,
      });

      if (res.success) {
        setMessage({ text: 'Transaction added successfully!', type: 'success' });
        setName('');
        setAmount('');
        // Transition to main dashboard view after a brief delay
        setTimeout(() => {
          if (setActive) setActive('Dashboard');
        }, 1000);
      } else {
        setMessage({ text: res.message || 'Failed to add transaction.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'Error connecting to database to save transaction.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Add Transaction</h1>
        <p className="text-stone text-sm mt-1">Log a new transaction manually or via WhatsApp</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border max-w-xl text-sm ${
            message.type === 'success'
              ? 'bg-emerald/15 border-emerald-light/30 text-emerald-light'
              : 'bg-rust/15 border-rust/30 text-rust'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6">
          <h2 className="text-cream font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-stone mb-2">Transaction Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Swiggy order"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-stone mb-2">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
                required
                min="0.01"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm text-stone mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold transition"
              >
                {['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Income'].map((c) => (
                  <option key={c} value={c} className="bg-ink">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus size={18} /> Add Transaction
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald/20 flex items-center justify-center mb-4">
            <MessageCircle size={26} className="text-emerald-light" />
          </div>
          <h2 className="text-cream font-semibold mb-2">Add via WhatsApp</h2>
          <p className="text-stone text-sm max-w-xs">
            Message your FinTrack WhatsApp number like "Spent 450 on food" and it'll appear here automatically. Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddExpensePage;