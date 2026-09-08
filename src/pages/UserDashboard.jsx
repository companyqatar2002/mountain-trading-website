```jsx
import { useEffect, useState } from 'react'
import PortalLayout from '../components/PortalLayout'
import { supabase } from '../lib/supabaseClient'

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('documents')

  const [docs, setDocs] = useState([])
  const [messages, setMessages] = useState([])

  const [loadingDocs, setLoadingDocs] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')

  const [messageError, setMessageError] = useState('')
  const [messageSuccess, setMessageSuccess] = useState('')

  // Load documents when dashboard opens
  useEffect(() => {
    loadDocs()
  }, [])

  // Load messages when Message Admin tab is opened
  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages()
    }
  }, [activeTab])

  // =========================================================
  // DOCUMENTS
  // =========================================================

  async function loadDocs() {
    setLoadingDocs(true)

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, category, file_path, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load documents:', error)
      setDocs([])
    } else {
      setDocs(data || [])
    }

    setLoadingDocs(false)
  }

  async function handleDownload(doc) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60)

    if (error) {
      console.error('Download error:', error)
      alert('Unable to download this document.')
      return
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // =========================================================
  // MESSAGES
  // =========================================================

  async function loadMessages() {
    setLoadingMessages(true)
    setMessageError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessageError('Unable to identify the signed-in user.')
      setMessages([])
      setLoadingMessages(false)
      return
    }

    const { data, error } = await supabase
      .from('portal_messages')
      .select(
        'id, subject, message, priority, is_read, created_at'
      )
      .eq('sender_id', user.id)
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load messages:', error)
      setMessageError('Unable to load your messages.')
      setMessages([])
    } else {
      setMessages(data || [])
    }

    setLoadingMessages(false)
  }

  async function handleSendMessage(e) {
    e.preventDefault()

    setMessageError('')
    setMessageSuccess('')

    const cleanSubject = subject.trim()
    const cleanMessage = message.trim()

    if (!cleanSubject) {
      setMessageError('Please enter a subject.')
      return
    }

    if (!cleanMessage) {
      setMessageError('Please enter your message.')
      return
    }

    if (cleanSubject.length > 200) {
      setMessageError('Subject must be 200 characters or less.')
      return
    }

    if (cleanMessage.length > 5000) {
      setMessageError('Message must be 5,000 characters or less.')
      return
    }

    setSending(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessageError(
        'Your session has expired. Please sign in again.'
      )
      setSending(false)
      return
    }

    // Send message to Admin
    const { error } = await supabase
      .from('portal_messages')
      .insert({
        sender_id: user.id,
        subject: cleanSubject,
        message: cleanMessage,
        priority,
      })

    if (error) {
      console.error('Failed to send message:', error)

      setMessageError(
        error.message ||
          'Failed to send your message. Please try again.'
      )

      setSending(false)
      return
    }

    // Clear form
    setSubject('')
    setMessage('')
    setPriority('normal')

    setMessageSuccess(
      'Your message has been sent to the administrator.'
    )

    setSending(false)

    // Reload user's messages
    await loadMessages()
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <PortalLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-1">
          User Dashboard
        </h1>

        <p className="text-slate text-sm">
          View company documents and communicate securely with
          the administrator.
        </p>
      </div>

      {/* =====================================================
          TABS
      ====================================================== */}
      <div className="border-b border-slate/20 mb-8">
        <div className="flex gap-6">
          {/* Documents */}
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb - 3 text - sm font - medium border - b - 2 transition - colors ${
    activeTab === 'documents'
        ? 'border-rust text-rust'
        : 'border-transparent text-slate hover:text-rust'
} `}
          >
            Company Documents
          </button>

          {/* Message Admin */}
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`pb - 3 text - sm font - medium border - b - 2 transition - colors ${
    activeTab === 'messages'
        ? 'border-rust text-rust'
        : 'border-transparent text-slate hover:text-rust'
} `}
          >
            Message Admin
          </button>
        </div>
      </div>

      {/* =====================================================
          DOCUMENTS TAB
      ====================================================== */}

      {activeTab === 'documents' && (
        <section>
          <h2 className="text-2xl font-display mb-1">
            Company Documents
          </h2>

          <p className="text-slate mb-8 text-sm">
            View and download documents shared by the admin.
          </p>

          {loadingDocs ? (
            <p className="text-slate">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="text-slate">
              No documents have been shared yet.
            </p>
          ) : (
            <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-5 py-4 gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {doc.title}
                    </p>

                    <p className="text-xs text-slate/70">
                      {doc.category || 'General'} ·{' '}
                      {new Date(
                        doc.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  {/* USER ONLY HAS DOWNLOAD ACCESS */}
                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="shrink-0 text-sm border border-rust text-rust px-4 py-2 hover:bg-rust hover:text-sand transition-colors"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          MESSAGE ADMIN TAB
      ====================================================== */}

      {activeTab === 'messages' && (
        <section>
          <h2 className="text-2xl font-display mb-1">
            Message Admin
          </h2>

          <p className="text-slate mb-6 text-sm">
            Send a message directly to the administrator.
          </p>

          {/* =================================================
              SEND MESSAGE FORM
          ================================================== */}

          <form
            onSubmit={handleSendMessage}
            className="border border-slate/20 bg-white/40 p-6 mb-10"
          >
            {/* SUBJECT */}
            <div className="mb-5">
              <label
                htmlFor="message-subject"
                className="block text-sm font-medium mb-2"
              >
                Subject
              </label>

              <input
                id="message-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                placeholder="Enter message subject"
                className="w-full border border-slate/30 bg-white px-4 py-3 outline-none focus:border-rust"
                disabled={sending}
              />
            </div>

            {/* PRIORITY */}
            <div className="mb-5">
              <label
                htmlFor="message-priority"
                className="block text-sm font-medium mb-2"
              >
                Priority
              </label>

              <select
                id="message-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate/30 bg-white px-4 py-3 outline-none focus:border-rust"
                disabled={sending}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="mb-5">
              <label
                htmlFor="admin-message"
                className="block text-sm font-medium mb-2"
              >
                Message
              </label>

              <textarea
                id="admin-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={7}
                placeholder="Write your message..."
                className="w-full border border-slate/30 bg-white px-4 py-3 outline-none focus:border-rust resize-y"
                disabled={sending}
              />

              <p className="text-xs text-slate/60 mt-1 text-right">
                {message.length}/5000
              </p>
            </div>

            {/* ERROR */}
            {messageError && (
              <div className="mb-4 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {messageError}
              </div>
            )}

            {/* SUCCESS */}
            {messageSuccess && (
              <div className="mb-4 border border-green-300 bg-green-50 text-green-700 px-4 py-3 text-sm">
                {messageSuccess}
              </div>
            )}

            {/* SEND */}
            <button
              type="submit"
              disabled={sending}
              className="border border-rust bg-rust text-sand px-6 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          {/* =================================================
              MY MESSAGES
          ================================================== */}

          <div>
            <h3 className="text-xl font-display mb-1">
              My Messages
            </h3>

            <p className="text-slate text-sm mb-5">
              Only messages sent from your account are shown
              here.
            </p>

            {loadingMessages ? (
              <p className="text-slate">
                Loading messages…
              </p>
            ) : messages.length === 0 ? (
              <div className="border border-slate/20 bg-white/40 px-5 py-6">
                <p className="text-slate">
                  You have not sent any messages yet.
                </p>
              </div>
            ) : (
              <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="font-medium">
                          {item.subject}
                        </h4>

                        <p className="text-xs text-slate/70 mt-1">
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* PRIORITY */}
                        <span
                          className={`text - xs px - 2 py - 1 border ${
    item.priority === 'urgent'
        ? 'border-red-400 text-red-600'
        : item.priority === 'high'
            ? 'border-orange-400 text-orange-600'
            : 'border-slate/30 text-slate'
} `}
                        >
                          {item.priority}
                        </span>

                        {/* READ STATUS */}
                        <span className="text-xs text-slate">
                          {item.is_read
                            ? 'Read'
                            : 'Unread'}
                        </span>
                      </div>
                    </div>

                    {/* MESSAGE CONTENT */}
                    <p className="mt-4 text-sm text-slate whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </PortalLayout>
  )
}
```
