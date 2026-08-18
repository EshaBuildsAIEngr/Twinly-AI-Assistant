from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, persona, conversations, content, analytics, webhooks, push
from app.database import Base, engine
from app.config import settings
from app.routers import auth, persona, conversations, content, analytics, webhooks

# Creates tables if they don't exist yet. For real production changes later,
# switch to Alembic migrations — this is fine for getting an MVP running fast.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Twinly API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "https://twinly-ai-assistant.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(persona.router)
app.include_router(conversations.router)
app.include_router(content.router)
app.include_router(analytics.router)
app.include_router(webhooks.router)
app.include_router(webhooks.router)
app.include_router(push.router)

@app.get("/")
def root():
    return {"status": "ok", "service": "Twinly API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
