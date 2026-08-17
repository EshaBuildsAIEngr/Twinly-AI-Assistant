export default function SetupGuide() {
  const steps = [
    {
      title: 'Create a Meta Business Manager account',
      body: 'Go to business.facebook.com, sign up with your Facebook account, and create a Business Portfolio for your business.',
    },
    {
      title: 'Create a Facebook Page',
      body: 'In Business Settings → Accounts → Pages, create a Page for your business (needed to link Instagram).',
    },
    {
      title: 'Switch Instagram to a Professional account',
      body: 'In the Instagram app: Settings → Account type → switch to Business, then link it to the Facebook Page you just created.',
    },
    {
      title: 'Create a Meta Developer App',
      body: 'Go to developers.facebook.com → My Apps → Create App → type "Business", and link it to your Business Portfolio.',
    },
    {
      title: 'Set up WhatsApp',
      body: 'In your App → WhatsApp use case → Production Setup, register your business phone number (must not already be on WhatsApp) and verify it via SMS/call.',
    },
    {
      title: 'Get a permanent WhatsApp token',
      body: 'Business Settings → Users → System Users → create one, assign it your WhatsApp account with full access, then Generate New Token (expiry: Never) with whatsapp_business_messaging + whatsapp_business_management permissions.',
    },
    {
      title: 'Set up Instagram messaging',
      body: 'In your App → Instagram API use case, add your Instagram account and generate an access token for it.',
    },
    {
      title: 'Paste your credentials into Twinly',
      body: 'Copy your Phone Number ID, WhatsApp token, Instagram Business Account ID, and Instagram token into the Settings page in your Twinly dashboard.',
    },
  ]

  return (
    <div className="min-h-screen font-body px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-2">Connect Your Own WhatsApp &amp; Instagram</h1>
        <p className="text-textMuted text-sm mb-10">
          Twinly needs its own connection to your WhatsApp Business and Instagram accounts to send replies on your
          behalf. This is a one-time setup through Meta — here's exactly what to do.
        </p>

        <div className="flex flex-col gap-0">
          {steps.map((s, i) => (
            <div key={s.title} className={`grid grid-cols-[40px_1fr] gap-4 py-5 border-t border-border ${i === steps.length - 1 ? 'border-b' : ''}`}>
              <div className="font-mono text-sm text-gold pt-0.5">{String(i + 1).padStart(2, '0')}</div>
              <div>
                <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-textMuted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-textMuted mt-8">
          Stuck on any step? Message us and we'll walk you through it directly.
        </p>
      </div>
    </div>
  )
}