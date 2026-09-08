import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function MessagesPanel() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadMessages()
    }, [])

    async function loadMessages() {
        setLoading(true)
        setError('')

        const { data, error } = await supabase
            .from('portal_messages')
            .select(`
        id,
        subject,
        message,
        priority,
        is_read,
        archived_at,
        created_at,
        sender:profiles!sender_id(full_name)
      `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            setError('Unable to load messages.')
        } else {
            setMessages(data || [])
        }

        setLoading(false)
    }

    async function markAsRead(item) {
        const { error } = await supabase
            .from('portal_messages')
            .update({ is_read: true })
            .eq('id', item.id)

        if (error) {
            console.error(error)
            setError('Unable to mark message as read.')
            return
        }

        setMessages((current) =>
            current.map((msg) =>
                msg.id === item.id
                    ? { ...msg, is_read: true }
                    : msg
            )
        )
    }

    async function archiveMessage(item) {
        // Confirmation 1
        const firstConfirm = window.confirm(
            `Archive ${item.subject}?`
        )

        if (!firstConfirm) return

        // Confirmation 2
        const secondConfirm = window.confirm(
            'Final confirmation: archive this message?'
        )

        if (!secondConfirm) return

        const { error } = await supabase
            .from('portal_messages')
            .update({
                archived_at: new Date().toISOString(),
            })
            .eq('id', item.id)

        if (error) {
            console.error(error)
            setError('Unable to archive message.')
            return
        }

        setMessages((current) =>
            current.filter((msg) => msg.id !== item.id)
        )
    }

    async function deleteMessage(item) {
        // Confirmation 1 - EXACT requested wording
        const firstConfirm = window.confirm(
            `Delete ${item.subject}? This cannot be undone.`
        )

        if (!firstConfirm) return

        // Confirmation 2 - EXACT requested wording
        const secondConfirm = window.confirm(
            'Final confirmation: permanently delete this message?'
        )

        if (!secondConfirm) return

        const { error } = await supabase
            .from('portal_messages')
            .delete()
            .eq('id', item.id)

        if (error) {
            console.error(error)
            setError('Unable to delete message.')
            return
        }

        setMessages((current) =>
            current.filter((msg) => msg.id !== item.id)
        )
    }

    if (loading) {
        return (
            <div className="text-slate">
                Loading messages…
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-display">
                        Messages
                    </h2>

                    <p className="text-slate text-sm mt-1">
                        Messages received from portal users.
                    </p>
                </div>

                <button
                    onClick={loadMessages}
                    className="text-sm border border-slate/30 px-4 py-2 hover:bg-slate/5"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-5 border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            {messages.length === 0 ? (
                <div className="border border-slate/20 bg-white/40 p-6 text-slate">
                    No messages found.
                </div>
            ) : (
                <div className="border border-slate/20 divide-y divide-slate/20 bg-white/40">
                    {messages.map((item) => (
                        <div
                            key={item.id}
                            className={`px-5 py-5 ${!item.is_read ? 'bg-yellow-50/50' : ''
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-5">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-medium">
                                            {item.subject}
                                        </h3>

                                        {!item.is_read && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1">
                                                Unread
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate mt-1">
                                        From:{' '}
                                        <span className="font-medium">
                                            {item.sender?.full_name || 'Unknown User'}
                                        </span>
                                    </p>

                                    <p className="text-xs text-slate/70 mt-1">
                                        {new Date(item.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {/* Priority */}
                                <span className="text-xs border border-slate/20 px-2 py-1 whitespace-nowrap">
                                    {item.priority}
                                </span>
                            </div>

                            {/* Message */}
                            <div className="mt-4 text-sm text-slate whitespace-pre-wrap">
                                {item.message}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 mt-5">
                                {!item.is_read && (
                                    <button
                                        onClick={() => markAsRead(item)}
                                        className="text-sm border border-green-600 text-green-700 px-3 py-2 hover:bg-green-50"
                                    >
                                        Mark as Read
                                    </button>
                                )}

                                <button
                                    onClick={() => archiveMessage(item)}
                                    className="text-sm border border-slate-500 text-slate-700 px-3 py-2 hover:bg-slate-50"
                                >
                                    Archive
                                </button>

                                <button
                                    onClick={() => deleteMessage(item)}
                                    className="text-sm border border-red-600 text-red-600 px-3 py-2 hover:bg-red-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}