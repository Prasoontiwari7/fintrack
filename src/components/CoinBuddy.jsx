import './CoinBuddy.css'

function CoinBuddy({ mood = 'happy', size = 64 }) {
  const isHappy = mood === 'happy'

  return (
    <div className="coin-buddy" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" width="100%" height="100%">
        <defs>
          <radialGradient id="coinFace" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e3c98a" />
            <stop offset="100%" stopColor="#c9a35e" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#coinFace)" stroke="#17392b" strokeOpacity="0.15" strokeWidth="2" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#17392b" strokeOpacity="0.12" strokeWidth="1.5" />
        <ellipse className="coin-eye" cx="30" cy="38" rx="3" ry="4" fill="#17392b" />
        <ellipse className="coin-eye" cx="50" cy="38" rx="3" ry="4" fill="#17392b" />
        {isHappy ? (
          <path d="M 28 50 Q 40 58 52 50" stroke="#17392b" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M 28 54 Q 40 48 52 54" stroke="#17392b" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  )
}

export default CoinBuddy