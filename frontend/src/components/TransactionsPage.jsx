import { useState, useEffect } from 'react';
import { getTransactions, deleteTransaction, deleteIncome } from '../api';
import { Trash2, Download } from 'lucide-react';
import ExportModal from './ExportModal';

function TransactionsPage({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      if (res.success) {
        setTransactions(res.data.transactions);
      } else {
        setError(res.message || 'Failed to retrieve transactions');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the transaction service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id, type) => {
    const isIncome = type === 'income';
    if (!window.confirm(`Are you sure you want to delete this ${isIncome ? 'income record' : 'expense transaction'}?`)) return;
    setDeletingId(id);
    try {
      const res = isIncome ? await deleteIncome(id) : await deleteTransaction(id);
      if (res.success) {
        setTransactions(transactions.filter((t) => t._id !== id));
      } else {
        alert(res.message || 'Failed to delete record');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to the server to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTxDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone text-sm">Retrieving transaction ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rust/15 border border-rust/30 text-rust max-w-xl mx-auto my-8">
        <h3 className="font-semibold text-lg mb-2">Error Loading Transactions</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cream">Transactions</h1>
          <p className="text-stone text-sm mt-1">All your recent activity</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="px-5 py-2.5 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light transition active:scale-[0.98] cursor-pointer text-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Download size={16} /> Export Transactions
        </button>
      </div>

      <div className="bg-charcoal border border-cream/10 rounded-2xl overflow-hidden">
        {transactions.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-cream/10 text-left">
                <th className="p-4 text-stone text-xs font-medium uppercase">Name</th>
                <th className="p-4 text-stone text-xs font-medium uppercase">Category / Source</th>
                <th className="p-4 text-stone text-xs font-medium uppercase">Date</th>
                <th className="p-4 text-stone text-xs font-medium uppercase text-right">Amount</th>
                <th className="p-4 text-stone text-xs font-medium uppercase text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-cream/5 hover:bg-cream/5 transition">
                  <td className="p-4 text-cream text-sm font-medium">{t.name}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        t.type === 'income' ? 'bg-emerald/10 text-emerald-light' : 'bg-gold/10 text-gold'
                      }`}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className="p-4 text-stone text-sm">{formatTxDate(t.date)}</td>
                  <td className={`p-4 text-sm font-semibold text-right ${t.amount > 0 ? 'text-emerald-light' : 'text-cream/80'}`}>
                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(t._id, t.type)}
                      disabled={deletingId === t._id}
                      className="text-stone hover:text-rust transition cursor-pointer disabled:opacity-50"
                      title="Delete record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-stone text-sm">
            No transactions found. Log your earnings or expenses to get started!
          </div>
        )}
      </div>

      {/* Export Modal Overlay */}
      {showExport && (
        <ExportModal user={user} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

export default TransactionsPage;