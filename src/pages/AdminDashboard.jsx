import { useEffect, useState } from 'react'
import PortalLayout from '../components/PortalLayout'
import { supabase } from '../lib/supabaseClient'

const TABS = ['Documents', 'Users', 'Messages']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Documents')

  return (
    <PortalLayout>
      <h1 className="text-3xl font-display mb-1">Admin Dashboard</h1>
      <p className="text-slate mb-8 text-sm">Manage company documents, portal users and contact enquiries.</p>

      <div className="flex gap-1 mb-8 border-b border-slate/20">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-rust text-rust' : 'border-transparent text-slate hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Documents' && <DocumentsPanel />}
      {tab === 'Users' && <UsersPanel />}
      {tab === 'Messages' && <MessagesPanel />}
    </PortalLayout>
  )
}

// ---------- Documents (import/export files) ----------
function DocumentsPanel() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('General')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('id, title, category, file_path, created_at')
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setError('')
    setUploading(true)

    const filePath = `${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { error: insertError } = await supabase.from('documents').insert({
      title: title || file.name,
      category,
      file_path: filePath,
    })

    if (insertError) setError(insertError.message)

    setUploading(false)
    setTitle('')
    setFile(null)
    e.target.reset()
    loadDocs()
  }

  async function handleDownload(doc) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleDelete(doc) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    await supabase.storage.from('documents').remove([doc.file_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    loadDocs()
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={handleUpload} className="border border-slate/20 p-6 space-y-4 h-fit bg-white/40">
        <h2 className="font-display text-xl">Import Document</h2>
        <div>
          <label className="block text-sm text-slate mb-1">Title</label>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Trade License 2026"
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-slate mb-1">Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none"
          >
            <option>General</option>
            <option>Certificate</option>
            <option>License</option>
            <option>Contract</option>
            <option>Report</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate mb-1">File</label>
          <input
            type="file" required onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        <button
          type="submit" disabled={uploading}
          className="w-full bg-rust text-sand font-medium py-2.5 hover:bg-rust/90 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      <div className="md:col-span-2">
        <h2 className="font-display text-xl mb-4">All Documents</h2>
        {loading ? (
          <p className="text-slate">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-slate">No documents uploaded yet.</p>
        ) : (
          <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-slate/70">{doc.category} · {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(doc)} className="text-sm border border-slate/40 px-3 py-1.5 hover:border-rust hover:text-rust">
                    Export
                  </button>
                  <button onClick={() => handleDelete(doc)} className="text-sm border border-slate/40 px-3 py-1.5 hover:border-rust hover:text-rust">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Users (invite + role management) ----------
function UsersPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('user')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('id, full_name, role, created_at').order('created_at')
    setUsers(data || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    // Calls a Supabase Edge Function that securely creates the auth user
    // with the service role key (never exposed to the browser).
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: { email, password, full_name: fullName, role },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    setCreating(false)
    if (error || data?.error) {
      setError(data?.error || error.message)
      return
    }
    setEmail(''); setPassword(''); setFullName(''); setRole('user')
    loadUsers()
  }

  async function toggleRole(u) {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', u.id)
    loadUsers()
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <form onSubmit={handleCreate} className="border border-slate/20 p-6 space-y-4 h-fit bg-white/40">
        <h2 className="font-display text-xl">Create Account</h2>
        <div>
          <label className="block text-sm text-slate mb-1">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate mb-1">Temporary password</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full border border-slate/40 px-3 py-2 bg-transparent focus:border-rust outline-none">
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="text-rust text-sm">{error}</p>}
        <button type="submit" disabled={creating}
          className="w-full bg-rust text-sand font-medium py-2.5 hover:bg-rust/90 disabled:opacity-60">
          {creating ? 'Creating…' : 'Create Account'}
        </button>
      </form>

      <div className="md:col-span-2">
        <h2 className="font-display text-xl mb-4">Portal Users</h2>
        {loading ? <p className="text-slate">Loading…</p> : (
          <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-xs text-slate/70 uppercase">{u.role}</p>
                </div>
                <button onClick={() => toggleRole(u)} className="text-sm border border-slate/40 px-3 py-1.5 hover:border-rust hover:text-rust">
                  Make {u.role === 'admin' ? 'Normal User' : 'Admin'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Contact form messages ----------
function MessagesPanel() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMessages(data || []); setLoading(false) })
  }, [])

  if (loading) return <p className="text-slate">Loading…</p>
  if (messages.length === 0) return <p className="text-slate">No messages yet.</p>

  return (
    <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
      {messages.map((m) => (
        <div key={m.id} className="px-5 py-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{m.name} · {m.email}</span>
            <span className="text-slate/60">{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <p className="text-sm text-slate">{m.message}</p>
        </div>
      ))}
    </div>
  )
}
