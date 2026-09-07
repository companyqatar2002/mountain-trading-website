import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Incorrect email or password.')
    } else {
      navigate('/portal')
    }
  }

  return (
    <div className="min-h-screen bg-charcoal text-sand flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 mb-10 justify-center">
          <img src="/assets/logo.png" alt="Logo" className="h-10" />
          <span className="font-display text-xl">Mountain Trading</span>
        </Link>

        <form onSubmit={handleSubmit} className="border border-slate/30 p-8 space-y-5">
          <h1 className="text-2xl font-display mb-2">Portal Login</h1>
          <div>
            <label className="block text-sm text-sand/70 mb-1" htmlFor="email">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-slate/40 px-3 py-2 focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-sand/70 mb-1" htmlFor="password">Password</label>
            <input
              id="password" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-slate/40 px-3 py-2 focus:border-gold outline-none"
            />
          </div>
          {error && <p className="text-rust text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-gold text-charcoal font-medium py-2.5 hover:bg-gold/90 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-xs text-sand/50 pt-2">
            Accounts are created by an administrator. Contact your admin if you need access.
          </p>
        </form>
      </div>
    </div>
  )
}
