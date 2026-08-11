import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const steps = ['Business info', 'Voice & tone', 'First FAQ']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [businessInfo, setBusinessInfo] = useState('')
  const [tone, setTone] = useState('')
  const [faqQ, setFaqQ] = useState('')
  const [faqA, setFaqA] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const finish = async () => {
    setSaving(true)
    try {
      await client.put('/api/persona', { business_info: businessInfo, tone_description: tone })
      if (faqQ.trim() && faqA.trim()) {
        await client.post('/api/persona/knowledge', { question: faqQ, answer: faqA })
      }
      navigate('/dashboard/settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 font-body">
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8 justify-center">
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 w-16 rounded-full ${i <= step ? 'bg-twin' : 'bg-surface2'}`} />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="font-mono text-xs text-gold mb-2">STEP {step + 1} OF {steps.length}</div>
          <h1 className="font-display text-2xl mb-6">{steps[step]}</h1>

          {step === 0 && (
            <div>
              <p className="text-textMuted text-sm mb-4">Tell Twinly about your products, pricing, and policies — this is what grounds every reply.</p>
              <textarea rows={6} value={businessInfo} onChange={(e) => setBusinessInfo(e.target.value)}
                placeholder="e.g. We sell unstitched lawn suits, Rs 2,000-4,500. Delivery in 3-5 days across Pakistan. Free delivery on orders above Rs 3,000. No returns on sale items."
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-textMuted text-sm mb-4">How do you usually talk to customers? Twinly will match this tone.</p>
              <textarea rows={4} value={tone} onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. Friendly and warm, Roman Urdu, sometimes use emojis, keep replies short"
                className="w-full bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-textMuted text-sm mb-1">Add one common question you get, to start your FAQ base (you can add more later).</p>
              <input value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="Question"
                className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
              <input value={faqA} onChange={(e) => setFaqA(e.target.value)} placeholder="Answer"
                className="bg-surface2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-twin" />
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm text-textMuted">Back</button>
            ) : <span />}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="bg-twin text-bg font-semibold text-sm px-5 py-2.5 rounded-lg">Next</button>
            ) : (
              <button onClick={finish} disabled={saving} className="bg-twin text-bg font-semibold text-sm px-5 py-2.5 rounded-lg disabled:opacity-60">
                {saving ? 'Saving...' : 'Finish setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
