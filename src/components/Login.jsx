import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login attempt:', email, password)
    onLogin()
  }

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
            Text an expense on WhatsApp and watch it land here, automatically.
          </p>
        </div>

      </div>

      {/* Right: form panel — quiet and minimal, no glass card */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-light to-gold flex items-center justify-center font-bold text-ink">
              ₹
            </div>
            <span className="font-semibold text-lg text-cream">FinTrack</span>
          </div>

          <h1 className="font-display text-3xl text-cream mb-2">Welcome back</h1>
          <p className="text-stone mb-10">Log in to see where your money's going.</p>

          <form onSubmit={handleSubmit} className="space-y-7">

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
              className="w-full py-3 rounded-full bg-gold text-ink font-semibold hover:bg-gold-light active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-ink"
            >
              Log In
            </button>

          </form>

          <p className="text-center text-sm text-stone mt-8">
            Don't have an account?{' '}
            <span className="text-gold hover:underline cursor-pointer">
              Sign up
            </span>
          </p>
        </div>
      </div>

    </div>
  )
}

export default Login