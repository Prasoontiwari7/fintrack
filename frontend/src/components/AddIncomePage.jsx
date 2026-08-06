import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createIncome } from '../api';

function AddIncomePage({ setActive }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await createIncome({
        amount: Number(amount),
        source,
        date: date || undefined,
        notes,
      });

      if (res.success) {
        setMessage({ text: 'Income recorded successfully!', type: 'success' });
        setAmount('');
        setNotes('');
        setDate('');
        
        setTimeout(() => {
          if (setActive) setActive('Dashboard');
        }, 1000);
      } else {
        setMessage({ text: res.message || 'Failed to save income record.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'Error connecting to database to save income.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Add Income</h1>
        <p className="text-stone text-sm mt-1">Log new earnings into your account</p>
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

      <div className="max-w-xl bg-charcoal border border-cream/10 rounded-2xl p-6">
        <h2 className="text-cream font-semibold mb-4">Income Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-stone mb-2">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
              required
              min="0.01"
              step="any"
            />
          </div>

          <div>
            <label className="block text-sm text-stone mb-2">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold transition"
            >
              {['Salary', 'Freelancing', 'Business', 'Gift', 'Interest', 'Other'].map((s) => (
                <option key={s} value={s} className="bg-ink">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-stone mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold transition"
            />
            <span className="text-[10px] text-stone/50 mt-1 block">Leave blank to use today's date</span>
          </div>

          <div>
            <label className="block text-sm text-stone mb-2">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Q3 bonus payment"
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
            />
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
                <Plus size={18} /> Record Income
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddIncomePage;
