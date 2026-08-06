import { useState, useRef } from 'react';
import { updateUserProfile } from '../api';
import api from '../api/axiosConfig';
import Avatar from './Avatar';

function SettingsPage({ user, setUser, onLogout }) {
  const [name, setName] = useState(user?.name || '');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 20000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // File Upload State Hooks
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removing, setRemoving] = useState(false);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size client-side (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'File exceeds 2 MB size limit.', type: 'error' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data && response.data.success) {
        setUser(response.data.data.user);
        setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
      } else {
        setMessage({ text: response.data.message || 'Failed to upload photo.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to upload profile picture.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setRemoving(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await api.delete('/users/profile-image');
      if (response.data && response.data.success) {
        setUser(response.data.data.user);
        setMessage({ text: 'Profile picture removed successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to remove profile photo.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to remove profile picture.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setRemoving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const res = await updateUserProfile({
        name,
        monthlyBudget: Number(monthlyBudget),
      });

      if (res.success && res.data && res.data.user) {
        setUser(res.data.user);
        setMessage({ text: 'Settings updated successfully!', type: 'success' });
      } else {
        setMessage({ text: res.message || 'Failed to update settings.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setMessage({ text: err.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'Error connecting to server to save settings.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream">Settings</h1>
        <p className="text-stone text-sm mt-1">Manage your account and preferences</p>
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
          <h2 className="text-cream font-semibold mb-4">Edit Profile & Budget</h2>
          
          {/* Avatar upload sector */}
          <div className="flex flex-col items-center mb-6">
            <Avatar 
              user={user} 
              size="lg" 
              editable 
              onClick={triggerFileSelect} 
              loading={uploading || removing} 
              uploadProgress={uploadProgress} 
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/jpg,image/png,image/webp" 
              className="hidden" 
            />
            
            {user?.profileImage && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading || removing}
                className="mt-3 text-xs text-rust hover:underline transition font-semibold cursor-pointer disabled:opacity-50"
              >
                Remove Photo
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-stone mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-ink/50 border border-cream/10 text-stone focus:outline-none cursor-not-allowed"
              />
              <span className="text-[10px] text-stone/60 mt-1 block">Email address cannot be changed</span>
            </div>

            <div>
              <label className="block text-sm text-stone mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-stone mb-2">Monthly Budget Limit (₹)</label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="20000"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-cream/10 text-cream placeholder-stone/50 focus:outline-none focus:border-gold transition"
                required
                min="0"
              />
            </div>

            <button
              type="submit"
              disabled={loading || uploading || removing}
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>

        <div className="bg-charcoal border border-cream/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-cream font-semibold mb-2">Linked Integrations</h2>
            <p className="text-stone text-sm mb-4">
              Connect external services to log your expenses automatically.
            </p>
            <div className="p-4 rounded-xl border border-cream/5 bg-ink/30 mb-4">
              <p className="text-cream text-xs font-semibold mb-1">WhatsApp Agent</p>
              <p className="text-stone text-xs">
                Log items directly via WhatsApp texts (e.g., "Spent 200 on transport"). Coming soon.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-cream/5">
            <h2 className="text-cream font-semibold mb-2">Session</h2>
            <p className="text-stone text-sm mb-4">Securely sign out of this browser session.</p>
            <button
              onClick={onLogout}
              className="px-6 py-2.5 rounded-full border border-rust text-rust hover:bg-rust/10 transition cursor-pointer text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;