import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path ? 'text-cyan' : 'text-muted hover:text-text'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-6 h-6 rounded-full border border-cyan/50 flex items-center justify-center group-hover:border-cyan transition-colors">
              <div className="w-2 h-2 rounded-full bg-cyan group-hover:shadow-[0_0_8px_#00d4ff] transition-shadow" />
            </div>
            <span className="font-display text-lg text-text/90 tracking-wide">
              memory<span className="text-cyan">graph</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/graph" className={`font-mono text-xs tracking-widest uppercase transition-colors ${isActive('/graph')}`}>
              Explore
            </Link>
            <Link to="/workshop" className={`font-mono text-xs tracking-widest uppercase transition-colors ${isActive('/workshop')}`}>
              Workshop
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted truncate max-w-[120px]">
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={signOut}
                  className="font-mono text-xs text-muted hover:text-rose transition-colors uppercase tracking-widest"
                >
                  Exit
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
