import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function PortalLayout({ children }) {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-charcoal text-sand border-b-4 border-rust">
        <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="Logo" className="h-10" />
            <span className="font-display text-xl hidden sm:block">Mountain Trading Portal</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-sand/70">
              {profile?.full_name || 'User'} · <span className="text-gold uppercase text-xs">{profile?.role}</span>
            </span>
            <button
              onClick={signOut}
              className="border border-sand/30 px-3 py-1.5 hover:border-gold hover:text-gold transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-10">{children}</main>
    </div>
  )
}
