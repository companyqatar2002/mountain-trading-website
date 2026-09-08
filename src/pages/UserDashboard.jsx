import { useEffect, useState } from 'react'
import PortalLayout from '../components/PortalLayout'
import { supabase } from '../lib/supabaseClient'

export default function UserDashboard() {
    const [activeTab, setActiveTab] = useState('documents')

    const [docs, setDocs] = useState([])
    const [messages, setMessages] = useState([])

    const [loading, setLoading] = useState(true)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [sending, setSending] = useState(false)

    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [priority, setPriority] = useState('Normal')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        loadDocs()
    }, [])

    async function getCurrentUser() {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        if (error) throw error
        return user
    }

    async function loadDocs() {
        setLoading(true)

        const { data, error } = await supabase
            .from('documents')
            .select('id, title, category, file_path, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            setError('Unable to load documents.')
            console.error(error)
        } else {
            setDocs(data || [])
        }

        setLoading(false)
    }

    async function loadMessages() {
        setMessagesLoading(true)
        setError('')

        try {
            const user = await getCurrentUser()

            if (!user) {
                setError('You are not signed in.')
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
                throw error
            }

            setMessages(data || [])
        } catch (err) {
            console.error(err)
            setError('Unable to load your messages.')
        } finally {
            setMessagesLoading(false)
        }
    }

    async function handleDownload(doc) {
        setError('')

        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.file_path, 60)

        if (error) {
            console.error(error)
            setError('Unable to create the download link.')
            return
        }

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
        } else {
            setError('Download link could not be created.')
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault()

        setError('')
        setSuccess('')

        if (!subject.trim()) {
            setError('Please enter a subject.')
            return
        }

        if (!message.trim()) {
            setError('Please enter your message.')
            return
        }

        setSending(true)

        try {
            const user = await getCurrentUser()

            if (!user) {
                setError('You are not signed in.')
                return
            }

            const { error } = await supabase
                .from('portal_messages')
                .insert({
                    sender_id: user.id,
                    subject: subject.trim(),
                    message: message.trim(),
                    priority,
                })

            if (error) {
                throw error
            }

            setSubject('')
            setMessage('')
            setPriority('Normal')
            setSuccess('Your message has been sent to the admin.')

            await loadMessages()
        } catch (err) {
            console.error(err)
            setError(
                err?.message || 'Failed to send your message. Please try again.'
            )
        } finally {
            setSending(false)
        }
    }

    function changeTab(tab) {
        setActiveTab(tab)
        setError('')
        setSuccess('')

        if (tab === 'messages') {
            loadMessages()
        }
    }

    return (
        <PortalLayout>
            <h1 className="text-3xl font-display mb-1">
                User Dashboard
            </h1>

            <p className="text-slate mb-6 text-sm">
                View company documents and communicate with the admin.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate/20 mb-6">
                <button
                    onClick={() => changeTab('documents')}
                    className={`px-5 py-3 text-sm transition-colors ${activeTab === 'documents'
                            ? 'border-b-2 border-rust text-rust font-medium'
                            : 'text-slate hover:text-rust'
                        }`}
                >
                    Documents
                </button>

                <button
                    onClick={() => changeTab('messages')}
                    className={`px-5 py-3 text-sm transition-colors ${activeTab === 'messages'
                            ? 'border-b-2 border-rust text-rust font-medium'
                            : 'text-slate hover:text-rust'
                        }`}
                >
                    Message Admin
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mb-5 border border-green-300 bg-green-50 text-green-700 px-4 py-3 text-sm">
                    {success}
                </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
                <>
                    <p className="text-slate mb-8 text-sm">
                        View and download documents shared by the admin.
                    </p>

                    {loading ? (
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
                                    className="flex items-center justify-between px-5 py-4"
                                >
                                    <div>
                                        <p className="font-medium">{doc.title}</p>

                                        <p className="text-xs text-slate/70">
                                            {doc.category} ·{' '}
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
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
                </>
            )}

            {/* MESSAGE ADMIN TAB */}
            {activeTab === 'messages' && (
                <div className="space-y-8">

                    {/* Send Message */}
                    <div>
                        <h2 className="text-xl font-display mb-1">
                            Message Admin
                        </h2>

                        <p className="text-slate text-sm mb-5">
                            Send a message to the administrator.
                        </p>

                        <form
                            onSubmit={handleSendMessage}
                            className="border border-slate/20 bg-white/40 p-5 space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    maxLength={150}
                                    className="w-full border border-slate/30 px-3 py-2 bg-white focus:outline-none focus:border-rust"
                                    placeholder="Enter subject"
                                    disabled={sending}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Priority
                                </label>

                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full border border-slate/30 px-3 py-2 bg-white focus:outline-none focus:border-rust"
                                    disabled={sending}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Message
                                </label>

                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    maxLength={5000}
                                    className="w-full border border-slate/30 px-3 py-2 bg-white focus:outline-none focus:border-rust resize-y"
                                    placeholder="Write your message to the admin..."
                                    disabled={sending}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="border border-rust bg-rust text-sand px-5 py-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {sending ? 'Sending…' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* My Messages */}
                    <div>
                        <h2 className="text-xl font-display mb-1">
                            My Messages
                        </h2>

                        <p className="text-slate text-sm mb-5">
                            Messages you have sent to the admin.
                        </p>

                        {messagesLoading ? (
                            <p className="text-slate">Loading messages…</p>
                        ) : messages.length === 0 ? (
                            <p className="text-slate">
                                You have not sent any messages yet.
                            </p>
                        ) : (
                            <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
                                {messages.map((item) => (
                                    <div
                                        key={item.id}
                                        className="px-5 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium">
                                                    {item.subject}
                                                </p>

                                                <p className="text-xs text-slate/70 mt-1">
                                                    {new Date(
                                                        item.created_at
                                                    ).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 text-xs">
                                                <span className="border border-slate/20 px-2 py-1">
                                                    {item.priority}
                                                </span>

                                                <span
                                                    className={`px-2 py-1 ${item.is_read
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                        }`}
                                                >
                                                    {item.is_read ? 'Read' : 'Unread'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate mt-3 whitespace-pre-wrap">
                                            {item.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PortalLayout>
    )
}