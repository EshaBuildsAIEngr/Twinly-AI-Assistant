import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import client from '../api/client'

export default function Inbox() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showThreadOnMobile, setShowThreadOnMobile] = useState(false)

  const load = async () => {
    const res = await client.get('/api/conversations')
    setConversations(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openConversation = async (id) => {
    const res = await client.get(`/api/conversations/${id}`)
    setSelected(res.data)
    setShowThreadOnMobile(true)
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return
    await client.post(`/api/conversations/${selected.id}/reply`, { content: replyText })
    setReplyText('')
    await openConversation(selected.id)
    load()
  }

  const statusColor = { pending: 'text-gold', replied: 'text-twin', escalated: 'text-you' }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-57px)] md:h-screen">
        {/* Conversation list — hidden on mobile once a thread is open */}
        <div className={`${showThreadOnMobile ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-80 border-r border-border overflow-y-auto shrink-0`}>
          <div className="px-5 py-4 border-b border-border font-display text-lg">Inbox</div>
          {loading && <div className="p-5 text-textMuted text-sm">Loading...</div>}
          {!loading && conversations.length === 0 && (
            <div className="p-5 text-textMuted text-sm">
              No conversations yet. Once your WhatsApp or Instagram is connected, customer messages will show up here.
            </div>
          )}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => openConversation(c.id)}
              className={`w-full text-left px-5 py-3.5 border-b border-border hover:bg-surface2/50 ${selected?.id === c.id ? 'bg-surface2' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{c.customer_name || c.customer_id}</span>
                <span className={`text-[11px] font-mono uppercase ${statusColor[c.status]}`}>{c.status}</span>
              </div>
              <div className="text-xs text-textMuted">{c.platform} · {c.messages?.length || 0} messages</div>
            </button>
          ))}
        </div>

        {/* Thread view — full width on mobile when open */}
        <div className={`${showThreadOnMobile ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0`}>
          {!selected && <div className="flex-1 items-center justify-center text-textMuted text-sm hidden md:flex">Select a conversation</div>}
          {selected && (
            <>
              <div className="px-4 md:px-6 py-4 border-b border-border flex items-center gap-3">
                <button onClick={() => setShowThreadOnMobile(false)} className="md:hidden text-textMuted text-lg">←</button>
                <div>
                  <div className="font-medium">{selected.customer_name || selected.customer_id}</div>
                  <div className="text-xs text-textMuted">{selected.platform}</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3">
                {selected.messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2.5 rounded-xl text-sm ${
                    m.sender === 'customer' ? 'self-start bg-surface2' : 'self-end bg-twin/10 border border-twin/25'
                  }`}>
                    {m.content}
                    {m.was_voice_note && <div className="text-[10px] text-textMuted mt-1">🎤 transcribed from voice note</div>}
                  </div>
                ))}
              </div>
              <div className="p-3 md:p-4 border-t border-border flex gap-2 md:gap-3">
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                  placeholder="Type a reply..."
                  className="flex-1 min-w-0 bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
                <button onClick={sendReply} className="bg-twin text-bg font-semibold text-sm px-4 md:px-5 rounded-lg shrink-0">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}