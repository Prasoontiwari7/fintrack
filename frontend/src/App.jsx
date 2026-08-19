import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import api, { setAuthToken, registerLogoutCallback } from './api/axiosConfig';
import { getCurrentUser } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Register global logout callback for 401 interceptor
    registerLogoutCallback(handleLogout);

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await getCurrentUser();
          if (res.success && res.data && res.data.user) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Auto login check failed:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
          <p className="font-semibold text-gold tracking-wide">Syncing with FinTrack...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;