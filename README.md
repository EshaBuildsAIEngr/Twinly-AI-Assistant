# Twinly — AI Digital Twin for Business Owners

Full-stack: FastAPI + LangGraph-style agentic tool-calling backend, React + Tailwind frontend,
PostgreSQL database. Support Agent and Content Agent both run as real OpenAI tool-calling loops —
the LLM decides which tools to call and when; there is no hardcoded if/else routing logic.

---

## 1. What's in this project

```
twinly/
├── backend/           FastAPI app, agents, database models
│   ├── app/
│   │   ├── agents/     orchestrator.py (the real agent loop) + tools.py
│   │   ├── routers/    auth, persona, conversations, content, analytics, webhooks
│   │   ├── services/   openai_service, embeddings_service, whatsapp_service, instagram_service
│   │   ├── models.py   database tables
│   │   └── main.py     app entrypoint
│   ├── requirements.txt
│   └── .env.example
└── frontend/           React + Vite + Tailwind
    ├── src/
    │   ├── pages/       Landing, Login, Signup, Onboarding, Inbox, ContentCalendar, Analytics, Settings
    │   └── ...
    └── .env.example
```

---

## 2. Run it locally first (before touching Meta/deployment)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL and OPENAI_API_KEY at minimum
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173 — signup, onboarding, dashboard sab kaam karengi
(WhatsApp/Instagram messages abhi nahi aayengi jab tak webhook connect na ho — neeche dekho).

---

## 3. Accounts banane hain — is order mein

### Step 1 — Neon.tech (Database)
1. neon.tech pe signup karo (free tier)
2. New Project banao
3. "Connection string" copy karo (pooled connection wala) → `backend/.env` mein `DATABASE_URL` mein daalo

### Step 2 — OpenAI (Agents ke liye)
1. platform.openai.com pe account banao
2. Billing add karo (chota sa balance, $5-10 kaafi hai shuru ke liye — GPT-4o-mini bohot sasta hai)
3. API Keys section se naya key generate karo → `backend/.env` mein `OPENAI_API_KEY`

### Step 3 — Meta Developer Account (WhatsApp + Instagram ke liye)
1. developers.facebook.com pe apne Facebook account se login karo, developer account activate karo
2. business.facebook.com pe Business Manager account banao
3. Ek Facebook Page banao (Instagram isse link hogi)
4. Apna Instagram account Professional (Business/Creator) banao, us Page se link karo
5. developers.facebook.com → My Apps → Create App → type "Business"
6. App ke andar "Add Product" → WhatsApp → yahan se milega:
   - Temporary access token (24hr) — testing ke liye
   - Phone Number ID
   - WhatsApp Business Account ID
   - Permanent token ke liye: Business Settings → System Users → naya system user banao → WhatsApp permission do → token generate karo (ye expire nahi hota)
   - Ye sab `backend/.env` mein `WHATSAPP_*` fields mein daalo
7. "Add Product" → Instagram Graph API → apna linked account authorize karo
   - Access token + Business Account ID milega Graph API Explorer se
   - `backend/.env` mein `INSTAGRAM_*` fields mein daalo
8. Apna khud ka number/account use karo abhi (Standard Access, koi review nahi chahiye)
9. Jab clients onboard karne hon: Business Verification submit karo (Business Manager → Settings), phir App Review submit karo (permissions: `whatsapp_business_messaging`, `instagram_manage_messages`) — is mein 2-4 weeks lagti hain, isay jitni jaldi ho sake shuru kar dena

### Step 4 — Domain (Porkbun)
1. porkbun.com pe .com domain register karo (~$10-12/year)
2. Vercel/Railway deploy hone ke baad, domain ke DNS mein A/CNAME records point karo unke instructions ke mutabiq

---

## 4. WhatsApp/Instagram ko apne app se connect karna (Webhook Setup)

1. Pehle backend ko Railway pe deploy karo (Step 5) taake tumhare paas ek public URL ho
2. Meta App Dashboard → WhatsApp/Instagram product → Webhooks
3. Callback URL: `https://<tumhara-railway-url>/api/webhooks/whatsapp` (Instagram ke liye `/api/webhooks/instagram`)
4. Verify Token: wahi daalo jo `.env` mein `WHATSAPP_VERIFY_TOKEN` / `INSTAGRAM_VERIFY_TOKEN` hai
5. "Verify and Save" click karo — Meta khud tumhare `/api/webhooks/whatsapp` (GET) ko call kar ke verify karega
6. Webhook fields subscribe karo: `messages` (WhatsApp), `messages` (Instagram)
7. Ab jab bhi koi customer message bheje, seedha tumhare backend pe aayega aur Support Agent khud reply karega

---

## 5. Deployment

### Backend → Railway
```bash
railway login
railway init
railway up
```
Railway dashboard mein saari `.env` variables add karo (Variables tab).
Ek PostgreSQL bhi Railway se add kar sakte ho, ya Neon.tech ka connection string use karo (dono chalta hai).

### Frontend → Vercel
```bash
cd frontend
vercel
```
Environment variable set karo: `VITE_API_URL` = tumhara Railway backend URL.
**Important**: jaise hi ek bhi paying customer aaye, Vercel Hobby (free) se Pro ($20/month) pe upgrade karna hoga — Hobby commercial use allow nahi karta.

### Domain
Vercel/Railway dono apne dashboard mein "Custom Domain" add karne ka option dete hain — wahan apna Porkbun domain daal do, unke diye hue DNS records Porkbun mein add kar do.

---

## 6. Important Notes

- **Trial system**: signup pe automatically 7-day trial start hota hai (`trial_ends_at` field). Payment gateway (JazzCash/Easypaisa) integration abhi is codebase mein nahi hai — ye agla milestone hai jab tum ready ho.
- **Multi-tenant ready**: har client apna WhatsApp/Instagram connect kar sake, is ke liye `PersonaProfile` table mein already `whatsapp_phone_number_id`, `instagram_business_account_id` jaisi fields hain — bas ek proper OAuth "Connect" flow UI mein add karna hoga (abhi Settings page sirf status dikhata hai).
- **Voice notes**: WhatsApp voice notes automatically Whisper se transcribe ho kar agent tak jaate hain — koi extra setup nahi chahiye, bas `OPENAI_API_KEY` kaam kar rahi ho.
- **Database tables**: pehli baar backend chalane pe khud-ba-khud ban jate hain (`Base.metadata.create_all`). Production mein aage jaake Alembic migrations pe move karna behtar hoga.
