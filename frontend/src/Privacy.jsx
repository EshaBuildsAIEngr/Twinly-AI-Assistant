export default function Privacy() {
  return (
    <div className="min-h-screen font-body px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl mb-2">Privacy Policy</h1>
        <p className="text-textMuted text-sm mb-10">Last updated: August 2026</p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-text">
          <section>
            <h2 className="font-display text-lg mb-2">What Twinly Does</h2>
            <p className="text-textMuted">
              Twinly is an AI assistant that helps small business owners manage customer
              conversations on WhatsApp and Instagram, and draft social media content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Information We Collect</h2>
            <p className="text-textMuted">
              When you connect your WhatsApp Business or Instagram account, we process
              messages sent to and from your connected accounts, your business information
              (products, pricing, policies) that you provide to us, and account details
              (email, business name) used for login.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">How We Use It</h2>
            <p className="text-textMuted">
              Message content and business information are used only to generate replies
              and content on your behalf, grounded in the information you provide. We do
              not sell your data or your customers' data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Third-Party Services</h2>
            <p className="text-textMuted">
              We use OpenAI to generate replies and content, and Meta's WhatsApp/Instagram
              APIs to send and receive messages on your behalf. Data passed to these
              services is used solely to fulfill your requests.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Data Retention &amp; Deletion</h2>
            <p className="text-textMuted">
              Conversation history and content drafts are stored so you can review them in
              your dashboard. To request deletion of your account and all associated data,
              contact us using the email below — we will delete your data within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Contact</h2>
            <p className="text-textMuted">
              For questions about this policy, your data, or to request deletion, contact
              us through the support channel listed on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}