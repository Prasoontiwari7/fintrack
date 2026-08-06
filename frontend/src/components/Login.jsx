import { useState } from 'react';
import { loginUser, signupUser } from '../api';
import './Login.css';

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signupUser(name, email, password);
        if (res.success && res.data) {
          onLogin(res.data.user, res.data.token);
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        const res = await loginUser(email, password);
        if (res.success && res.data) {
          onLogin(res.data.user, res.data.token);
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(isSignUp ? 'Registration failed. Try again.' : 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-ink">
      {/* Left: signature illustration panel */}
      <div className="hidden lg:flex relative flex-col items-center justify-center overflow-hidden px-12 py-16">
        <div className="absolute top-10 left-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-light to-gold flex items-center justify-center font-bold text-ink">
            ₹
          </div>
          <span className="font-semibold text-lg text-cream">FinTrack</span>
        </div>

        <div className="orbit-wrap">
          <div className="orbit-glow" />
          <div className="orbit-sphere" />
          <div className="orbit-ring orbit-ring-1">
            <div className="orbit-coin-slot"><div className="orbit-coin">₹</div></div>
          </div>
          <div className="orbit-ring orbit-ring-2">
            <div className="orbit-coin-slot"><div className="orbit-coin">₹</div></div>
          </div>
          <div className="orbit-ring orbit-ring-3">
            <div className="orbit-coin-slot"><div className="orbit-coin">₹</div></div>
          </div>
        </div>

        <div className="relative mt-10 text-center max-w-sm">
          <h2 className="font-display text-2xl text-cream mb-3">Every rupee, in orbit</h2>
          <p className="text-sm leading-relaxed text-stone">
            Log your income and expenses, watch your finances balance in real time.
          </p>
        </div>
      </div>

      {/* Right: form panel — quiet and minimal */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-light to-gold flex items-center justify-center font-bold text-ink">
              ₹
            </div>
            <span className="font-semibold text-lg text-cream">FinTrack</span>
          </div>

          <h1 className="font-display text-3xl text-cream mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="text-stone mb-8">
            {isSignUp ? 'Sign up to start tracking your wealth.' : 'Log in to see where your money\'s going.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rust/15 border border-rust/30 text-rust text-xs leading-relaxed animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-stone mb-2 tracking-wide uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Sharma"
                  className="w-full bg-transparent border-b border-cream/15 text-cream placeholder-stone/50 py-2 focus:outline-none focus:border-gold transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone mb-2 tracking-wide uppercase">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent border-b border-cream/15 text-cream placeholder-stone/50 py-2 focus:outline-none focus:border-gold transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone mb-2 tracking-wide uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-cream/15 text-cream placeholder-stone/50 py-2 focus:outline-none focus:border-gold transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-ink flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                'Sign Up'
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone mt-8">
            {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
            <span
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-gold hover:underline cursor-pointer font-medium"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;