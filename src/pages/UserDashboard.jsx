import { useEffect, useState } from 'react'
import PortalLayout from '../components/PortalLayout'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function UserDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('documents')
  const [docs, setDocs] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' })
  const [sending, setSending] = useState(false)

  useEffect(() => { loadData() }, [user?.id])

  async function loadData() {
    if (!user?.id) return
    setLoading(true); setError('')
    const [docsResult, messagesResult] = await Promise.all([
      supabase.from('documents').select('id, title, category, file_path, created_at').order('created_at', { ascending: false }),
      supabase.from('portal_messages').select('id, subject, message, priority, is_read, created_at').eq('sender_id', user.id).is('archived_at', null).order('created_at', { ascending: false }),
    ])
    setDocs(docsResult.data || [])
    setMessages(messagesResult.data || [])
    if (docsResult.error) setError(docsResult.error.message)
    if (messagesResult.error) setError(messagesResult.error.message)
    setLoading(false)
  }

  async function download(doc) {
    setError('')
    const { data, error: downloadError } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60)
    if (downloadError || !data?.signedUrl) setError(downloadError?.message || 'Unable to create a download link.')
    else window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function sendMessage(event) {
    event.preventDefault(); setSending(true); setError(''); setSuccess('')
    const { error: sendError } = await supabase.from('portal_messages').insert({ sender_id: user.id, ...form })
    setSending(false)
    if (sendError) { setError(sendError.message); return }
    setForm({ subject: '', message: '', priority: 'normal' })
    setSuccess('Message sent to the admin team.')
    await loadData()
  }

  return (
    <PortalLayout>
      <h1 className="mb-1 text-3xl font-display">My Portal</h1>
      <p className="mb-6 text-sm text-slate">View shared documents and contact the admin team.</p>
      <div className="mb-6 flex gap-1 border-b border-slate/20">
        {['documents', 'messages'].map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${tab === item ? 'border-rust text-rust' : 'border-transparent text-slate hover:text-ink'}`}>{item === 'messages' ? 'Message Admin' : 'Documents'}</button>)}
      </div>
      {error && <p className="mb-4 text-sm text-rust" role="alert">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-700" role="status">{success}</p>}
      {tab === 'documents' && (loading ? <p className="text-slate">Loading…</p> : <div className="divide-y divide-slate/20 border border-slate/20 bg-white/40">{docs.length ? docs.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium">{doc.title}</p><p className="text-xs text-slate/70">{doc.category} · {new Date(doc.created_at).toLocaleDateString()}</p></div><button onClick={() => download(doc)} className="border border-rust px-4 py-2 text-sm text-rust transition-colors hover:bg-rust hover:text-sand">Download</button></div>) : <p className="p-5 text-slate">No documents have been shared yet.</p>}</div>)}
      {tab === 'messages' && <div className="grid gap-8 lg:grid-cols-3"><form onSubmit={sendMessage} className="h-fit space-y-4 border border-slate/20 bg-white/40 p-5"><h2 className="font-display text-xl">Message Admin</h2><label className="block text-sm">Subject<input required maxLength={160} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><label className="block text-sm">Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="block text-sm">Message<textarea required rows={5} maxLength={5000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full border border-slate/40 bg-transparent px-3 py-2" /></label><button disabled={sending} className="w-full bg-rust py-2.5 font-medium text-sand disabled:opacity-60">{sending ? 'Sending…' : 'Send Message'}</button></form><div className="lg:col-span-2"><h2 className="mb-4 font-display text-xl">My Messages</h2><div className="divide-y divide-slate/20 border border-slate/20 bg-white/40">{messages.length ? messages.map((item) => <div key={item.id} className="p-5"><div className="mb-1 flex justify-between gap-3"><strong>{item.subject}</strong><span className="text-xs text-slate">{new Date(item.created_at).toLocaleString()}</span></div><p className="mb-2 text-sm text-slate">{item.message}</p><span className="text-xs uppercase text-slate">{item.priority} · {item.is_read ? 'Read' : 'Unread'}</span></div>) : <p className="p-5 text-slate">You have not sent any messages.</p>}</div></div></div>}
    </PortalLayout>
  )
}
