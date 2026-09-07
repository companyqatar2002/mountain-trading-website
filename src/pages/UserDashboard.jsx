import { useEffect, useState } from 'react'
import PortalLayout from '../components/PortalLayout'
import { supabase } from '../lib/supabaseClient'

export default function UserDashboard() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('id, title, category, file_path, created_at')
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }

  async function handleDownload(doc) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60) // link valid for 60 seconds
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <PortalLayout>
      <h1 className="text-3xl font-display mb-1">Company Documents</h1>
      <p className="text-slate mb-8 text-sm">View and download documents shared by the admin.</p>

      {loading ? (
        <p className="text-slate">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-slate">No documents have been shared yet.</p>
      ) : (
        <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-xs text-slate/70">{doc.category} · {new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="text-sm border border-rust text-rust px-4 py-2 hover:bg-rust hover:text-sand transition-colors"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  )
}
