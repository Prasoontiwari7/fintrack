import { useState } from 'react';
import { X, Mail, Download, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';

function ExportModal({ user, onClose }) {
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const getFilterData = () => {
    return {
      filter,
      startDate: filter === 'custom' ? startDate : undefined,
      endDate: filter === 'custom' ? endDate : undefined,
    };
  };

  const handleDownload = async (format) => {
    setLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const response = await api.post(`/export/${format}`, getFilterData(), {
        responseType: 'blob',
      });

      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `FinTrack_Report_${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to download report. Please try again.';
      if (err.response && err.response.data) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed && parsed.message) {
            errMsg = parsed.message;
          }
        } catch (e) {
          // ignore parsing error, use default
        }
      }
      setFeedback({ text: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (format) => {
    setLoading(true);
    setFeedback({ text: '', type: '' });

    try {
      const payload = {
        format,
        email: emailInput,
        ...getFilterData(),
      };

      const response = await api.post('/export/email', payload);

      if (response.data && response.data.success) {
        setFeedback({ 
          text: response.data.message || `Report successfully emailed to ${emailInput}`, 
          type: 'success' 
        });
      } else {
        setFeedback({ text: 'Failed to send report email.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to dispatch email. Check SMTP settings.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setFeedback({ text: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-charcoal border border-gold/20 rounded-[2rem] shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ background: 'linear-gradient(180deg, #13160f 0%, #0a0d0b 100%)' }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-stone hover:text-cream transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-cream flex items-center gap-2">
            <span>Export Transactions</span>
          </h2>
          <p className="text-stone text-xs mt-1">Export transaction history and ledger summaries</p>
        </div>

        {/* Feedback Alert */}
        {feedback.text && (
          <div 
            className={`p-3.5 mb-5 rounded-xl border text-xs leading-relaxed ${
              feedback.type === 'success' 
                ? 'bg-emerald/10 border-emerald/20 text-emerald-light' 
                : 'bg-rust/10 border-rust/20 text-rust'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="space-y-5">
          {/* Filter Range */}
          <div>
            <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-2">Statement Period</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold transition disabled:opacity-50"
            >
              <option value="month" className="bg-ink">This Month</option>
              <option value="lastMonth" className="bg-ink">Last Month</option>
              <option value="week" className="bg-ink">This Week</option>
              <option value="today" className="bg-ink">Today</option>
              <option value="year" className="bg-ink">This Year</option>
              <option value="all" className="bg-ink">All Time</option>
              <option value="custom" className="bg-ink">Custom Date Range</option>
            </select>
          </div>

          {/* Custom Date Inputs */}
          {filter === 'custom' && (
            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-4 duration-200">
              <div>
                <label className="block text-[10px] text-stone uppercase tracking-wider mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-lg bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold text-xs transition"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone uppercase tracking-wider mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 rounded-lg bg-ink border border-cream/10 text-cream focus:outline-none focus:border-gold text-xs transition"
                />
              </div>
            </div>
          )}

          {/* Email Recipient Input */}
          <div>
            <label className="block text-xs font-semibold text-stone uppercase tracking-wider mb-2">Email Recipient</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={loading}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/30 focus:outline-none focus:border-gold transition disabled:opacity-50 text-sm"
            />
          </div>

          {/* Action Triggers */}
          <div className="pt-4 border-t border-cream/5 space-y-3.5">
            {/* Download Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-ink hover:bg-cream/5 border border-cream/10 text-cream font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-gold" /> : <Download size={14} className="text-gold" />}
                Download PDF
              </button>
              <button
                onClick={() => handleDownload('excel')}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-ink hover:bg-cream/5 border border-cream/10 text-cream font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-gold" /> : <Download size={14} className="text-gold" />}
                Download Excel
              </button>
            </div>

            {/* Email Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleEmail('pdf')}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-gold hover:bg-gold-light text-ink font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-ink" /> : <Mail size={14} className="text-ink" />}
                Email PDF
              </button>
              <button
                onClick={() => handleEmail('excel')}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-gold hover:bg-gold-light text-ink font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin text-ink" /> : <Mail size={14} className="text-ink" />}
                Email Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
