import { useState } from 'react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabaseClient'

const services = [
  {
    title: 'Construction & Contracting',
    desc: 'Turnkey construction — from planning and site mobilization through handover — for private, commercial and government projects across Qatar.',
    img: '/assets/service-construction.jpg',
  },
  {
    title: 'Manpower Supply',
    desc: 'Skilled, semi-skilled and general labour, screened and deployed on short notice to keep your project on schedule.',
    img: '/assets/service-manpower.jpg',
  },
  {
    title: 'MEP & AC Services',
    desc: 'Mechanical, electrical and plumbing works plus AC installation and maintenance, delivered to local code and safety standards.',
    img: '/assets/service-mep-ac.jpg',
  },
  {
    title: 'Cleaning & Facility Services',
    desc: 'Ongoing site and facility cleaning contracts for commercial and residential clients, from routine upkeep to full facility management.',
    img: null,
  },
]

const stats = [
  { label: 'Commercial Registration', value: 'No. 157237' },
  { label: 'Registered With', value: 'Qatar Chamber of Commerce & Industry' },
  { label: 'Coverage', value: 'Nationwide, Qatar' },
]

export default function Home() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      message: form.message,
    })
    if (error) {
      setStatus('error')
    } else {
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    }
  }

  return (
    <div id="home">
      <Navbar />

      {/* Hero */}
      <section className="relative text-sand overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/hero-construction.jpg"
            alt="Construction site with cranes"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/60" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 py-20 md:py-32 grid md:grid-cols-5 gap-10 items-end">
          <div className="md:col-span-3">
            <p className="text-gold font-medium mb-3">Construction · Manpower · Contracting — Qatar</p>
            <h1 className="text-5xl md:text-6xl leading-[0.95] mb-6">
              Built on reliability.<br />Delivered on time.
            </h1>
            <p className="text-lg max-w-xl mb-8 text-sand/85">
              Mountain Trading &amp; Contracting W.L.L partners with developers, contractors and
              government projects across Qatar — bringing skilled manpower, MEP expertise and
              construction management to every site we take on.
            </p>
            <a href="#contact" className="inline-block bg-rust text-sand px-7 py-3 font-medium hover:bg-rust/90 transition-colors">
              Request a Quote
            </a>
          </div>
          <div className="md:col-span-2 border-l-4 border-gold pl-6 py-2 bg-charcoal/40 backdrop-blur-sm">
            <dl className="space-y-5">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs uppercase tracking-wide text-sand/60">{s.label}</dt>
                  <dd className="text-xl font-display">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl mb-2">About Us</h2>
          <div className="w-16 h-1 bg-rust mb-6" />
          <div className="space-y-4 text-slate">
            <p>
              We provide comprehensive contracting and trading services across Qatar, delivering
              projects with safety, quality and timeliness. Our team brings together experienced
              professionals from diverse backgrounds, ready to meet the specific demands of each
              site and client.
            </p>
            <p>
              From single-trade manpower supply to full construction and MEP scopes, we structure
              our teams around the project — not the other way around.
            </p>
            <ul className="grid grid-cols-2 gap-3 pt-2 text-sm">
              {['Construction & Contracting', 'Manpower & Staffing', 'Logistics & Supply', 'MEP Works'].map((i) => (
                <li key={i} className="border-l-2 border-gold pl-3 py-1">{i}</li>
              ))}
            </ul>
          </div>
        </div>
        <img
          src="/assets/about-team.jpg"
          alt="Site engineers reviewing plans on a Mountain Trading project"
          className="w-full h-72 md:h-96 object-cover border border-slate/20"
        />
      </section>

      {/* Services */}
      <section id="services" className="bg-charcoal/5 border-y border-slate/20">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <h2 className="text-3xl mb-10">Services</h2>
          <div className="grid md:grid-cols-2 gap-px bg-slate/20">
            {services.map((s) => (
              <div key={s.title} className="bg-sand flex flex-col sm:flex-row">
                {s.img ? (
                  <img src={s.img} alt={s.title} className="w-full sm:w-40 h-44 sm:h-auto object-cover flex-shrink-0" />
                ) : (
                  <div className="w-full sm:w-40 h-44 sm:h-auto flex-shrink-0 bg-charcoal flex items-center justify-center">
                    <span className="text-gold font-display text-4xl">MT</span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl mb-2">{s.title}</h3>
                  <p className="text-slate text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section id="clients" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-3xl mb-2">Clients We Serve</h2>
        <p className="text-slate mb-10 max-w-xl">
          We have collaborated with private contractors, developers and government projects
          across Qatar, focused on reliability and quality of delivery.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { img: '/assets/service-construction.jpg', label: 'Construction' },
            { img: '/assets/client-industrial.jpg', label: 'Industrial & Manpower' },
            { img: '/assets/service-manpower.jpg', label: 'Site Workforce' },
            { img: '/assets/service-mep-ac.jpg', label: 'MEP & AC' },
          ].map((c) => (
            <img key={c.img} src={c.img} alt={c.label} className="w-full h-32 md:h-40 object-cover border border-slate/20" />
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section id="certificates" className="bg-charcoal text-sand">
        <div className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl mb-6">Certifications &amp; Registrations</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gold uppercase text-xs tracking-wide">Commercial Registration No.</dt>
                <dd className="text-lg">157237</dd>
              </div>
              <div>
                <dt className="text-gold uppercase text-xs tracking-wide">Registered With</dt>
                <dd className="text-lg">Qatar Chamber of Commerce &amp; Industry</dd>
              </div>
              <div>
                <dt className="text-gold uppercase text-xs tracking-wide">Trade License</dt>
                <dd className="text-lg">Valid and approved for general trading &amp; contracting</dd>
              </div>
              <div>
                <dt className="text-gold uppercase text-xs tracking-wide">HSE Compliance</dt>
                <dd className="text-lg">Adheres to local and international health, safety and environmental standards</dd>
              </div>
            </dl>
          </div>
          <div className="border-l-4 border-gold pl-6">
            <h3 className="text-2xl mb-3">Representative Clients</h3>
            <p className="text-sand/80">
              We have worked with private contractors, developers and government projects across
              Qatar. Client references and project documentation are available on request.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl mb-6">Get In Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-slate mb-1" htmlFor="name">Name</label>
              <input
                id="name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate/40 bg-transparent px-3 py-2 focus:border-rust outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate mb-1" htmlFor="email">Email</label>
              <input
                id="email" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate/40 bg-transparent px-3 py-2 focus:border-rust outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate mb-1" htmlFor="message">Message</label>
              <textarea
                id="message" required rows={4} value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-slate/40 bg-transparent px-3 py-2 focus:border-rust outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-rust text-sand px-6 py-3 font-medium hover:bg-rust/90 transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
            {status === 'sent' && <p className="text-sm text-green-700">Message sent — we'll get back to you shortly.</p>}
            {status === 'error' && <p className="text-sm text-rust">Something went wrong. Please try again or email us directly.</p>}
          </form>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl mb-3">Office</h3>
            <p className="text-slate text-sm leading-relaxed">
              Zone 24, Street 840, Building 14, Floor 1, Flat 3, Qatar<br />
              Phone: +974 5501 5695<br />
              Email: mountaintrading477@gmail.com<br />
              P.O. Box: 50244
            </p>
          </div>
          <div>
            <h3 className="text-xl mb-3">Operations Manager</h3>
            <p className="text-slate text-sm leading-relaxed">
              Gousul Hoque Chowdhury<br />
              Phone: +974 6662 7618<br />
              Email: Gousulhoque89@gmail.com
            </p>
          </div>
          <iframe
            title="Office location"
            src="https://www.google.com/maps?q=Doha%20Qatar&output=embed"
            className="w-full h-48 border border-slate/20"
            loading="lazy"
          />
        </div>
      </section>

      <footer className="bg-charcoal text-sand/70 text-sm text-center py-6">
        © {new Date().getFullYear()} Mountain Trading &amp; Contracting W.L.L. All rights reserved.
      </footer>
    </div>
  )
}
