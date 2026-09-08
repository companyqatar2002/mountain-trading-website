import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function HomeIcon({ className = 'h-4 w-4' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 10.5 9-7 9 7V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" />
        </svg>
    )
}

function MenuIcon({ open }) {
    return <span aria-hidden="true">{open ? '×' : '☰'}</span>
}

const links = [
    { href: '#home', label: 'Home', id: 'home', icon: HomeIcon },
    { href: '#about', label: 'About' },
    { href: '#services', label: 'Services' },
    { href: '#clients', label: 'Clients' },
    { href: '#certificates', label: 'Certificates' },
    { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('home')
    const location = useLocation()
    const { user, profile } = useAuth()

    useEffect(() => {
        const sections = links
            .map(({ id, href }) => document.querySelector(`#${id || href.slice(1)}`))
            .filter(Boolean)
        const observer = new IntersectionObserver((entries) => {
            const visible = entries.filter((entry) => entry.isIntersecting)
            if (visible.length) setActiveSection(visible[0].target.id)
        }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 })

        sections.forEach((section) => observer.observe(section))
        return () => observer.disconnect()
    }, [])

    const isActive = (link) => location.pathname === '/' && activeSection === (link.id || link.href.slice(1))
    const navItemClass = (link) => `inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal active:scale-95 ${isActive(link) ? 'bg-gold text-charcoal shadow-sm' : 'text-sand/90 hover:bg-sand/10 hover:text-gold'
        }`
    const closeMenu = () => setOpen(false)

    return (
        <header className="sticky top-0 z-50 border-b-4 border-rust bg-charcoal text-sand">
            <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-5 md:h-20">
                <Link to="/#home" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Mountain Trading & Contracting W.L.L home">
                    <img src="/assets/logo.png" alt="" className="h-11 w-11 shrink-0 object-contain md:h-12 md:w-12" />
                    <span className="min-w-0 truncate whitespace-nowrap font-display text-base tracking-tight sm:text-lg md:text-xl lg:text-2xl">Mountain Trading &amp; Contracting W.L.L</span>
                </Link>

                <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Primary navigation">
                    {links.map((link) => (
                        <a key={link.href} href={link.href} className={navItemClass(link)} aria-current={isActive(link) ? 'page' : undefined}>
                            {link.icon && <link.icon />}{link.label}
                        </a>
                    ))}
                    <Link to={user ? '/portal' : '/login'} className="ml-2 rounded-md border border-gold px-4 py-2 text-gold transition-all duration-200 hover:bg-gold hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-95">
                        {user ? (profile?.role === 'admin' ? 'Admin Portal' : 'My Portal') : 'Login'}
                    </Link>
                </nav>

                <button className="inline-flex h-10 w-10 items-center justify-center rounded-md text-3xl leading-none transition-all duration-200 hover:bg-sand/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-95 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
                    <MenuIcon open={open} />
                </button>
            </div>

            {open && (
                <nav className="border-t border-slate/50 bg-charcoal px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        {links.map((link) => (
                            <a key={link.href} href={link.href} onClick={closeMenu} className={`${navItemClass(link)} w-full`} aria-current={isActive(link) ? 'page' : undefined}>
                                {link.icon && <link.icon />}{link.label}
                            </a>
                        ))}
                        <Link to={user ? '/portal' : '/login'} onClick={closeMenu} className="mt-2 inline-flex rounded-md border border-gold px-3 py-2 text-gold transition-all duration-200 hover:bg-gold hover:text-charcoal active:scale-95">
                            {user ? (profile?.role === 'admin' ? 'Admin Portal' : 'My Portal') : 'Login'}
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    )
}