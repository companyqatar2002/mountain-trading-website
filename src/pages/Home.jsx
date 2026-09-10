import { useState } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'

const services = [
  ['Construction & Contracting', 'Turnkey construction delivery for private, commercial and government projects.', '/assets/service-construction.jpg'],
  ['Manpower Supply', 'Skilled, semi-skilled and general labour, deployed when your project needs it.', '/assets/service-manpower.jpg'],
  ['MEP & AC Services', 'Mechanical, electrical, plumbing and AC installation and maintenance.', '/assets/service-mep-ac.jpg'],
  ['Cleaning & Facility Services', 'Commercial and residential cleaning and facility-management contracts.', '/assets/Cleaning.jpg'],
]

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  async function submit(event) {
    event.preventDefault(); setStatus('sending'); setError('')
    const payload = { name: form.name.trim(), message: form.message.trim(), phone: form.phone.trim() || null, email: form.email.trim() || null }
    const { error: sendError } = await supabase.from('contact_messages').insert(payload)
    if (sendError) { setStatus('error'); setError(sendError.message); return }
    setForm({ name: '', phone: '', email: '', message: '' }); setStatus('sent')
  }

  return <div id="home"><Navbar />
    <section className="relative overflow-hidden text-sand"><img src="/assets/hero-construction.jpg" alt="Construction site" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-charcoal/85" /><div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32"><p className="mb-3 text-gold">Construction · Manpower · Contracting — Qatar</p><h1 className="mb-6 text-5xl leading-none md:text-6xl">Built on reliability.<br />Delivered on time.</h1><p className="max-w-2xl text-lg text-sand/85">Mountain Trading &amp; Contracting W.L.L partners with developers, contractors and government projects across Qatar.</p><a href="#contact" className="mt-8 inline-block bg-rust px-7 py-3 font-medium transition-colors hover:bg-rust/90">Request a Quote</a></div></section>
    <section id="about" className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2"><div><h2 className="mb-3 text-3xl">About Us</h2><div className="mb-6 h-1 w-16 bg-rust" /><p className="text-slate">We provide comprehensive contracting and trading services across Qatar, with safety, quality and timely delivery at every project stage.</p></div><img src="/assets/about-team.jpg" alt="Site engineers reviewing plans" className="h-72 w-full object-cover md:h-96" /></section>
    <section id="services" className="border-y border-slate/20 bg-charcoal/5"><div className="mx-auto max-w-6xl px-5 py-20"><h2 className="mb-10 text-3xl">Services</h2><div className="grid gap-4 md:grid-cols-2">{services.map(([title, description, image]) => <article key={title} className="overflow-hidden bg-sand shadow-sm"><img src={image} alt={title} className="h-44 w-full object-cover" /><div className="p-6"><h3 className="mb-2 text-xl">{title}</h3><p className="text-sm text-slate">{description}</p></div></article>)}</div></div></section>
    <section id="clients" className="mx-auto max-w-6xl px-5 py-20"><h2 className="mb-3 text-3xl">Clients We Serve</h2><p className="text-slate">We collaborate with private contractors, developers and government projects across Qatar.</p></section>
    <section id="certificates" className="bg-charcoal text-sand"><div className="mx-auto max-w-6xl px-5 py-20"><h2 className="mb-6 text-3xl">Certifications &amp; Registrations</h2><p className="text-sand/80">Commercial Registration No. 157237 · Qatar Chamber of Commerce &amp; Industry · HSE compliant.</p></div></section>
    <section id="contact" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2"><div><h2 className="mb-6 text-3xl">Get In Touch</h2><form onSubmit={submit} className="max-w-md space-y-4"><label className="block text-sm">Name <span className="text-rust">*</span><input required value={form.name} onChange={update('name')} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><label className="block text-sm">Mobile / Telephone Number <span className="text-slate/60">(optional)</span><input type="tel" value={form.phone} onChange={update('phone')} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><label className="block text-sm">Email <span className="text-slate/60">(optional)</span><input type="email" value={form.email} onChange={update('email')} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><label className="block text-sm">Message <span className="text-rust">*</span><textarea required rows={5} value={form.message} onChange={update('message')} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><button disabled={status === 'sending'} className="bg-rust px-6 py-3 font-medium text-sand disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Send Message'}</button>{status === 'sent' && <p className="text-sm text-green-700">Message sent successfully.</p>}{status === 'error' && <p className="text-sm text-rust">{error || 'Unable to send message.'}</p>}</form></div><div><h3 className="mb-3 text-xl">Office</h3><p className="text-sm leading-relaxed text-slate">Zone 24, Street 840, Building 14, Floor 1, Flat 3, Qatar<br />Phone: +974 5501 5695<br />Email: mountaintrading477@gmail.com</p></div></section>
    <footer className="bg-charcoal py-6 text-center text-sm text-sand/70">© {new Date().getFullYear()} Mountain Trading &amp; Contracting W.L.L. All rights reserved.</footer>
  </div>
}
