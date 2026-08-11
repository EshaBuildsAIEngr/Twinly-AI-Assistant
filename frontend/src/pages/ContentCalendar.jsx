import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import client from '../api/client'

export default function ContentCalendar() {
  const [items, setItems] = useState([])
  const [platform, setPlatform] = useState('instagram')
  const [topicHint, setTopicHint] = useState('')
  const [generating, setGenerating] = useState(false)

  const load = async () => {
    const res = await client.get('/api/content')
    setItems(res.data)
  }

  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      await client.post('/api/content/generate', { platform, topic_hint: topicHint || null })
      setTopicHint('')
      await load()
    } finally {
      setGenerating(false)
    }
  }

  const updateStatus = async (id, status) => {
    await client.patch(`/api/content/${id}`, { status })
    load()
  }

  const statusColor = {
    draft: 'text-textMuted', approved: 'text-twin', scheduled: 'text-gold',
    posted: 'text-you', rejected: 'text-red-400',
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="font-display text-2xl mb-1">Content Calendar</h1>
        <p className="text-textMuted text-sm mb-8">The Content Agent checks your past posts and writes a draft — you review before anything goes out.</p>

        <div className="bg-surface border border-border rounded-2xl p-5 mb-8 flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-textMuted block mb-1.5">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none">
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp Status</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-textMuted block mb-1.5">Topic hint (optional)</label>
            <input value={topicHint} onChange={(e) => setTopicHint(e.target.value)}
              placeholder="e.g. Eid collection launch"
              className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
          </div>
          <button onClick={generate} disabled={generating}
            className="bg-gradient-to-br from-twin to-[#8FEEF5] text-bg font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60">
            {generating ? 'Writing...' : 'Generate Draft'}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {items.length === 0 && <div className="text-textMuted text-sm">No drafts yet — generate your first one above.</div>}
          {items.map((item) => (
            <div key={item.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-textMuted uppercase">{item.platform}</span>
                <span className={`text-xs font-mono uppercase ${statusColor[item.status]}`}>{item.status}</span>
              </div>
              <p className="text-sm mb-2">{item.caption}</p>
              <p className="text-xs text-twin">{item.hashtags}</p>
              {item.status === 'draft' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => updateStatus(item.id, 'approved')} className="text-xs bg-twin/15 text-twin border border-twin/30 px-3 py-1.5 rounded-lg">Approve</button>
                  <button onClick={() => updateStatus(item.id, 'rejected')} className="text-xs bg-you/15 text-you border border-you/30 px-3 py-1.5 rounded-lg">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
