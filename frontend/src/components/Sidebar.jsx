import { useRef, useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  ArrowUpCircle 
} from 'lucide-react';
import Avatar from './Avatar';
import api from '../api/axiosConfig';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Transactions', icon: Receipt },
  { name: 'Add Expense', icon: PlusCircle },
  { name: 'Add Income', icon: ArrowUpCircle },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
];

function Sidebar({ 
  active, 
  setActive, 
  collapsed, 
  setCollapsed, 
  onLogout, 
  user, 
  setUser 
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File exceeds 2 MB size limit.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/users/upload-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setUser(response.data.data.user);
      } else {
        alert(response.data.message || 'Failed to upload photo.');
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to upload profile picture.';
      if (err.response && err.response.data && err.response.data.message) {
        errMsg = err.response.data.message;
      }
      alert(errMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={`fixed left-6 top-6 bottom-6 flex flex-col items-center py-6 rounded-[2rem] border border-gold/15 shadow-2xl transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-56'
      }`}
      style={{ background: 'linear-gradient(180deg, #12160f 0%, #0a0d0b 100%)' }}
    >
      {/* Interactive Avatar Header */}
      <div className="mb-8 shrink-0 relative">
        <Avatar 
          user={user} 
          size="md" 
          editable 
          onClick={triggerFileSelect} 
          loading={uploading} 
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg,image/jpg,image/png,image/webp" 
          className="hidden" 
        />
      </div>

      <nav className="flex flex-col gap-2 w-full px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              title={item.name}
              className={`flex items-center gap-3 px-3 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive ? 'bg-gold text-ink' : 'text-stone hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="w-full px-3 mb-2 shrink-0">
        <button
          onClick={onLogout}
          title="Log Out"
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-full text-sm font-medium text-stone hover:bg-rust/10 hover:text-rust transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} className="shrink-0 text-rust" />
          {!collapsed && <span className="truncate">Log Out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-9 h-9 rounded-full bg-cream/5 hover:bg-cream/10 flex items-center justify-center text-stone hover:text-cream transition mt-2 shrink-0 cursor-pointer"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}

export default Sidebar;