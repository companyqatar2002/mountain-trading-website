import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#clients', label: 'Clients' },
  { href: '#certificates', label: 'Certificates' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, profile } = useAuth()

  return (
    <header className="bg-charcoal text-sand sticky top-0 z-50 border-b-4 border-rust">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-20">
        <a href="#home" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Mountain Trading & Contracting W.L.L" className="h-11 w-auto" />
          <span className="font-display text-xl md:text-2xl tracking-tight leading-none">
            Mountain Trading<br className="hidden md:block" /> &amp; Contracting W.L.L
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gold transition-colors">
              {l.label}
            </a>
          ))}
          {user ? (
            <Link to="/portal" className="border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-charcoal transition-colors">
              {profile?.role === 'admin' ? 'Admin Portal' : 'My Portal'}
            </Link>
          ) : (
            <Link to="/login" className="border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-charcoal transition-colors">
              Login
            </Link>
          )}
        </nav>

        <button
          className="md:hidden text-sand text-3xl leading-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
      </div>

      {open && (
        <nav className="md:hidden bg-charcoal border-t border-slate px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="hover:text-gold">
              {l.label}
            </a>
          ))}
          {user ? (
            <Link to="/portal" onClick={() => setOpen(false)} className="text-gold">
              {profile?.role === 'admin' ? 'Admin Portal' : 'My Portal'}
            </Link>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="text-gold">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
