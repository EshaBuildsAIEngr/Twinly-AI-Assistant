import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import client from '../api/client'

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    client.get('/api/analytics/summary?days=7').then((res) => setData(res.data))
  }, [])

  const stats = data ? [
    { label: 'Messages handled', value: data.messages_handled },
    { label: 'Replies sent', value: data.replies_sent },
    { label: 'Escalated to you', value: data.escalations },
    { label: 'Posts published', value: data.posts_published },
  ] : []

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="font-display text-2xl mb-1">Analytics</h1>
        <p className="text-textMuted text-sm mb-8">Last {data?.period_days || 7} days.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface border border-border rounded-2xl p-5">
              <div className="font-display text-3xl text-twin mb-1">{s.value}</div>
              <div className="text-xs text-textMuted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
