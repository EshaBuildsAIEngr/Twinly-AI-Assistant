import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import client from '../api/client'

export default function Settings() {
  const [persona, setPersona] = useState(null)
  const [knowledge, setKnowledge] = useState([])
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [saving, setSaving] = useState(false)
  const [catalogText, setCatalogText] = useState('')
  const [generatingCatalog, setGeneratingCatalog] = useState(false)

  const load = async () => {
    const [pRes, kRes] = await Promise.all([
      client.get('/api/persona'),
      client.get('/api/persona/knowledge'),
    ])
    setPersona(pRes.data)
    setKnowledge(kRes.data)
  }

  useEffect(() => { load() }, [])

  const savePersona = async () => {
    setSaving(true)
    try {
      await client.put('/api/persona', persona)
    } finally {
      setSaving(false)
    }
  }

  const addFaq = async () => {
    if (!newQ.trim() || !newA.trim()) return
    await client.post('/api/persona/knowledge', { question: newQ, answer: newA })
    setNewQ(''); setNewA('')
    load()
  }

  const deleteFaq = async (id) => {
    await client.delete(`/api/persona/knowledge/${id}`)
    load()
  }

  const generateFromCatalog = async () => {
    if (!catalogText.trim()) return
    setGeneratingCatalog(true)
    try {
      await client.post('/api/persona/knowledge/bulk-from-catalog', { raw_text: catalogText })
      setCatalogText('')
      await load()
    } finally {
      setGeneratingCatalog(false)
    }
  }

  if (!persona) return <DashboardLayout><div className="p-8 text-textMuted">Loading...</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl flex flex-col gap-10">
        <div>
          <h1 className="font-display text-2xl mb-1">Settings</h1>
          <p className="text-textMuted text-sm">Everything here shapes how your twin talks and what it knows.</p>
        </div>

        {/* Platform connections */}
        {/* Platform connections */}
        <section>
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wide mb-3">Connected Platforms</h2>
          <div className="flex flex-col gap-3 mb-4">
            <ConnectRow label="WhatsApp Business" connected={persona.whatsapp_connected} />
            <ConnectRow label="Instagram" connected={persona.instagram_connected} />
          </div>

          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-4">
            <div>
              <div className="text-sm font-medium mb-1">Connect your WhatsApp Business</div>
              <p className="text-xs text-textMuted">
                Get these from your Meta Developer App → WhatsApp → Production Setup.
                Don't have a Meta App yet? <a href="/docs/whatsapp-setup" className="text-twin underline">See the setup guide</a>.
              </p>
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">Phone Number ID</label>
              <input value={persona.whatsapp_phone_number_id || ''}
                onChange={(e) => setPersona({ ...persona, whatsapp_phone_number_id: e.target.value })}
                placeholder="e.g. 1293689120494992"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">Access Token</label>
              <input type="password" value={persona.whatsapp_access_token || ''}
                onChange={(e) => setPersona({ ...persona, whatsapp_access_token: e.target.value })}
                placeholder="System User permanent token"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-sm font-medium mb-1">Connect your Instagram</div>
              <p className="text-xs text-textMuted">Get these from your Meta App → Instagram API setup page.</p>
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">Instagram Business Account ID</label>
              <input value={persona.instagram_business_account_id || ''}
                onChange={(e) => setPersona({ ...persona, instagram_business_account_id: e.target.value })}
                placeholder="e.g. 17841441829682113"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">Access Token</label>
              <input type="password" value={persona.instagram_access_token || ''}
                onChange={(e) => setPersona({ ...persona, instagram_access_token: e.target.value })}
                placeholder="Instagram User access token"
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            </div>

            <button onClick={savePersona} disabled={saving}
              className="self-start text-sm bg-gradient-to-br from-twin to-[#8FEEF5] text-bg font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Save connection'}
            </button>
            <p className="text-xs text-textMuted">
              Your credentials are stored securely and only used to send replies through your own number/account.
            </p>
          </div>
        </section>

        {/* Persona */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wide">Persona &amp; Voice</h2>
          <div>
            <label className="text-xs text-textMuted block mb-1.5">Tone description</label>
            <textarea rows={2} value={persona.tone_description}
              onChange={(e) => setPersona({ ...persona, tone_description: e.target.value })}
              placeholder="e.g. Friendly, warm, uses a bit of humor, always adds a 🙂"
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1.5">Business info, pricing &amp; policies</label>
            <textarea rows={5} value={persona.business_info}
              onChange={(e) => setPersona({ ...persona, business_info: e.target.value })}
              placeholder="Products, prices, delivery time, return policy, etc."
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
          </div>
          <div>
            <label className="text-xs text-textMuted block mb-1.5">Reply language</label>
            <select value={persona.preferred_language}
              onChange={(e) => setPersona({ ...persona, preferred_language: e.target.value })}
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none">
              <option value="roman_urdu">Roman Urdu (default), match English if customer does</option>
              <option value="english">Always English</option>
              <option value="auto">Auto-detect and match customer</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={persona.bargaining_allowed}
              onChange={(e) => setPersona({ ...persona, bargaining_allowed: e.target.checked })} />
            <label className="text-sm">Allow the agent to negotiate price</label>
          </div>
          {persona.bargaining_allowed && (
            <div>
              <label className="text-xs text-textMuted block mb-1.5">Max discount agent can offer (%)</label>
              <input type="number" min={0} max={50} value={persona.bargaining_min_percent}
                onChange={(e) => setPersona({ ...persona, bargaining_min_percent: parseFloat(e.target.value) })}
                className="w-32 bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
          )}
          <button onClick={savePersona} disabled={saving}
            className="self-start bg-gradient-to-br from-twin to-[#8FEEF5] text-bg font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </section>

        {/* Knowledge base */}
        <section>
          <h2 className="text-sm font-semibold text-textMuted uppercase tracking-wide mb-3">FAQs &amp; Policies (grounds the Support Agent)</h2>

          <div className="bg-surface2/50 border border-dashed border-border rounded-lg p-4 mb-4">
            <div className="text-sm font-medium mb-1">Paste your full product/price list</div>
            <p className="text-xs text-textMuted mb-3">
              Paste it however you normally write it — sizes, colors, prices, messy is fine.
              Twinly will turn it into detailed FAQs automatically, so it can answer specific
              customer questions (not just general ones).
            </p>
            <textarea rows={5} value={catalogText} onChange={(e) => setCatalogText(e.target.value)}
              placeholder={"e.g.\nLawn suit regular size S-XL: Rs 2000-3500\n2XL-3XL: Rs 2500-4000\nColors: red, blue, black\nMaria B collection: Rs 3500"}
              className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin mb-3" />
            <button onClick={generateFromCatalog} disabled={generatingCatalog}
              className="text-xs bg-gradient-to-br from-twin to-[#8FEEF5] text-bg font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
              {generatingCatalog ? 'Generating FAQs...' : 'Generate FAQs from this'}
            </button>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {knowledge.map((k) => (
              <div key={k.id} className="bg-surface border border-border rounded-lg p-4 flex justify-between gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">{k.question}</div>
                  <div className="text-sm text-textMuted">{k.answer}</div>
                </div>
                <button onClick={() => deleteFaq(k.id)} className="text-xs text-you shrink-0">Remove</button>
              </div>
            ))}
            {knowledge.length === 0 && <div className="text-textMuted text-sm">No FAQs added yet.</div>}
          </div>
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-2">
            <input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="Question, e.g. 'Kya 2XL available hai?'"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            <input value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Answer"
              className="bg-surface2 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-twin" />
            <button onClick={addFaq} className="self-start text-xs bg-twin/15 text-twin border border-twin/30 px-4 py-2 rounded-lg mt-1">
              Add FAQ
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

function ConnectRow({ label, connected }) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <span className="text-sm">{label}</span>
      {connected ? (
        <span className="text-xs font-mono text-twin">● Connected</span>
      ) : (
        <span className="text-xs font-mono text-textMuted">○ Not connected</span>
      )}
    </div>
  )
}