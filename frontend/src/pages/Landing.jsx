import { Link } from 'react-router-dom'

const features = [
  { icon: '💬', title: 'Support Agent', desc: "Reads incoming DMs, checks your FAQs and policies, and replies in your tone. Escalates anything sensitive straight to you." },
  { icon: '✍️', title: 'Content Agent', desc: "Studies what performed well before, checks what's trending in your niche, and drafts a week of captions and hashtags." },
  { icon: '📊', title: 'Analytics Agent', desc: "Tracks every reply and post, then tells you plainly what's working — no dashboards to decode, just next steps." },
]

const steps = [
  { n: '01', title: 'Connect & teach', desc: 'Link your Instagram or WhatsApp Business, share past chats or a few sample replies, and add your FAQs and pricing.' },
  { n: '02', title: 'Review the first drafts', desc: 'Twinly drafts replies and posts for you to approve. Every edit you make teaches it your voice a little better.' },
  { n: '03', title: 'Hand over the inbox', desc: 'Once you trust it, switch simple replies to auto-send and let the content calendar run itself.' },
]

export default function Landing() {
  return (
    <div className="font-body">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="max-w-[1140px] mx-auto px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display text-xl font-semibold">
            <span className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-you to-twin flex items-center justify-center font-mono text-[11px] font-bold text-bg">TW</span>
            Twinly
          </div>
          <div className="hidden md:flex gap-8 text-sm text-textMuted">
            <a href="#features" className="hover:text-text">Features</a>
            <a href="#how" className="hover:text-text">How it works</a>
            <a href="#pricing" className="hover:text-text">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-textMuted hover:text-text">Login</Link>
            <Link to="/signup" className="text-sm font-semibold text-bg bg-gradient-to-br from-twin to-[#7FE8F0] px-5 py-2.5 rounded-lg hover:-translate-y-0.5 transition-transform">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="pt-24 pb-16">
        <div className="max-w-[1140px] mx-auto px-8">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-twin bg-twinDim border border-twin/25 px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-twin shadow-[0_0_8px_#4DD9E8]"></span>
            NOW LEARNING YOUR BRAND VOICE
          </div>
          <h1 className="font-display text-4xl md:text-6xl leading-tight max-w-2xl mb-5">
            An AI employee that replies, posts, and sounds <span className="text-twin">exactly</span> like you.
          </h1>
          <p className="text-lg text-textMuted max-w-xl mb-9">
            Twinly learns your tone from real conversations, then handles customer DMs and social content while you run the business — not the inbox.
          </p>
          <div className="flex gap-3.5 mb-3.5">
            <Link to="/signup" className="text-[15px] font-semibold text-bg bg-gradient-to-br from-twin to-[#8FEEF5] px-6.5 py-3.5 rounded-[10px] px-6 py-3.5">
              Start Free Trial
            </Link>
            <a href="#how" className="text-[15px] font-semibold text-text bg-surface border border-border px-6 py-3.5 rounded-[10px]">
              See how it learns
            </a>
          </div>
          <div className="text-[13px] text-textMuted">No credit card needed · 7 days full access, then choose your plan</div>

          {/* Twin demo */}
          <div className="mt-16 grid md:grid-cols-[1fr_auto_1fr] gap-0 items-stretch max-w-4xl">
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-youDim text-you border border-you/30 flex items-center justify-center text-xs font-bold">YOU</div>
                <div className="text-[13px] text-textMuted"><b className="text-text font-semibold">You</b> · usually online 9pm–1am</div>
              </div>
              <div className="text-[13.5px] p-2.5 rounded-xl bg-surface2 max-w-[88%] rounded-bl-sm bubble-anim">Customer: "Kya aap 2XL size mein bhi available hain?"</div>
              <div className="text-[13.5px] p-2.5 rounded-xl bg-you/10 border border-you/25 max-w-[88%] self-end rounded-br-sm bubble-anim" style={{animationDelay: '.25s'}}>Ji bilkul, 2XL stock mein hai. Rs 2,400 + delivery. Kal tak bhej dete hain 🙂</div>
              <div className="font-mono text-[10.5px] text-textMuted mt-0.5">— sent by you, 11:42 PM</div>
            </div>
            <div className="hidden md:block w-px mx-5 bg-gradient-to-b from-transparent via-border to-transparent relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full bg-bgAlt border border-border flex items-center justify-center text-[13px] text-gold">⇄</span>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 mt-4 md:mt-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-twinDim text-twin border border-twin/30 flex items-center justify-center text-xs font-bold">TW</div>
                <div className="text-[13px] text-textMuted"><b className="text-text font-semibold">Twinly</b> · replies in 8 seconds</div>
              </div>
              <div className="text-[13.5px] p-2.5 rounded-xl bg-surface2 max-w-[88%] rounded-bl-sm bubble-anim">Customer: "Kya aap 2XL size mein bhi available hain?"</div>
              <div className="text-[13.5px] p-2.5 rounded-xl bg-twin/10 border border-twin/25 max-w-[88%] self-end rounded-br-sm bubble-anim" style={{animationDelay: '.5s'}}>Ji bilkul, 2XL stock mein hai. Rs 2,400 + delivery. Kal tak bhej dete hain 🙂</div>
              <div className="font-mono text-[10.5px] text-textMuted mt-0.5">— sent by Twinly, 3:07 PM · same voice, real time</div>
            </div>
          </div>
        </div>
      </header>

      {/* PROBLEM STRIP */}
      <section className="bg-bgAlt border-y border-border py-16">
        <div className="max-w-[1140px] mx-auto px-8 grid md:grid-cols-3 gap-8">
          <div><b className="font-display text-4xl text-twin block">60–70%</b><span className="text-textMuted text-sm">of a small seller's day lost to repetitive DMs and captions</span></div>
          <div><b className="font-display text-4xl text-twin block">8 sec</b><span className="text-textMuted text-sm">average reply time once Twinly learns your FAQs</span></div>
          <div><b className="font-display text-4xl text-twin block">0</b><span className="text-textMuted text-sm">generic chatbot replies — every message is grounded in your policies</span></div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="max-w-[1140px] mx-auto px-8">
          <div className="max-w-xl mb-12">
            <span className="font-mono text-xs text-gold tracking-wide block mb-3">WHAT IT DOES</span>
            <h2 className="font-display text-3xl mb-3.5">Three agents, one voice.</h2>
            <p className="text-textMuted text-[15.5px]">Each agent runs on real reasoning, not scripts — it decides what to do, not just what you told it to do.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5.5">
            {features.map((f) => (
              <div key={f.title} className="bg-surface border border-border rounded-2xl p-7 hover:border-twin/35 transition-colors">
                <div className="w-10 h-10 rounded-[10px] mb-5 flex items-center justify-center text-[17px] bg-surface2 border border-border">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2.5">{f.title}</h3>
                <p className="text-sm text-textMuted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-bgAlt border-y border-border py-20">
        <div className="max-w-[1140px] mx-auto px-8">
          <div className="max-w-xl mb-12">
            <span className="font-mono text-xs text-gold tracking-wide block mb-3">GETTING STARTED</span>
            <h2 className="font-display text-3xl">Your twin takes shape in three steps.</h2>
          </div>
          <div>
            {steps.map((s, i) => (
              <div key={s.n} className={`grid grid-cols-[56px_1fr] gap-5 py-5.5 border-t border-border ${i === steps.length - 1 ? 'border-b' : ''}`}>
                <div className="font-mono text-[13px] text-gold pt-0.5">{s.n}</div>
                <div><h4 className="text-base font-semibold mb-1.5">{s.title}</h4><p className="text-sm text-textMuted max-w-lg">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20">
        <div className="max-w-[1140px] mx-auto px-8">
          <div className="max-w-xl mb-12">
            <span className="font-mono text-xs text-gold tracking-wide block mb-3">PRICING</span>
            <h2 className="font-display text-3xl">Try it free for 7 days. Then pick what fits.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
            <PriceCard tier="FREE TRIAL" price="7 days" caption="Full access, no card needed" cta="Start free trial" to="/signup" items={[
              'Unlimited replies during trial', 'Unlimited content drafts', 'Instagram + WhatsApp', 'Full performance summary'
            ]} />
            <PriceCard tier="STARTER" price="Rs 800" per="/month" caption="For sellers dipping a toe into automation" cta="Start Starter" to="/signup" items={[
              '250 replies / month, auto-send', '12 content drafts / month', '1 platform (Instagram or WhatsApp)', 'Weekly performance summary'
            ]} />
            <PriceCard tier="PRO" price="Rs 2,000" per="/month" caption="For sellers ready to let go of the inbox" cta="Go Pro" to="/signup" featured items={[
              'Unlimited replies, auto-send', 'Unlimited content, auto-post', 'Instagram + WhatsApp + LinkedIn', 'Deep insights & competitor view'
            ]} />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-[1140px] mx-auto px-8 flex justify-between items-center text-[13px] text-textMuted">
          <div className="flex items-center gap-2 font-display text-[15px]">
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-you to-twin flex items-center justify-center font-mono text-[9px] font-bold text-bg">TW</span>
            Twinly
          </div>
          <div>© 2026 Twinly · Built for Pakistan's sellers &amp; creators</div>
        </div>
      </footer>
    </div>
  )
}

function PriceCard({ tier, price, per, caption, items, cta, to, featured }) {
  return (
    <div className={`relative bg-surface border rounded-[18px] p-8 ${featured ? 'border-gold/40 bg-gradient-to-b from-gold/5 to-surface' : 'border-border'}`}>
      {featured && <div className="absolute -top-2.5 right-6 font-mono text-[10.5px] bg-gold text-[#1A1508] px-2.5 py-1 rounded-full font-semibold">MOST POPULAR</div>}
      <div className="text-[13px] text-textMuted mb-2">{tier}</div>
      <div className="font-display text-[32px] mb-1">{price}{per && <span className="text-[15px] text-textMuted font-body">{per}</span>}</div>
      <div className="text-[13px] text-textMuted mb-6">{caption}</div>
      <ul className="flex flex-col gap-2.5 mb-7">
        {items.map((it) => (
          <li key={it} className="text-[13.5px] flex gap-2 items-start">
            <span className={featured ? 'text-gold font-bold' : 'text-twin font-bold'}>✓</span>{it}
          </li>
        ))}
      </ul>
      <Link to={to} className={`block text-center py-3 rounded-[9px] text-sm font-semibold ${featured ? 'bg-gradient-to-br from-gold to-[#F2DA96] text-[#1A1508]' : 'bg-surface2 border border-border text-text'}`}>
        {cta}
      </Link>
    </div>
  )
}
