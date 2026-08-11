import ssl
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Use the pure-Python pg8000 driver instead of psycopg2 — psycopg2 needs a C
# compiler and PostgreSQL build tools on the machine, which frequently fails
# on Windows. pg8000 needs nothing but pip install.
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

# pg8000 doesn't understand the "sslmode" query param that Neon/most Postgres
# providers put in their connection string (that's a psycopg2-ism) — it needs
# an actual ssl_context passed as a connect arg instead. Strip it out here and
# supply SSL a different way below.
parsed = urlparse(db_url)
query = parse_qs(parsed.query)
had_ssl = "sslmode" in query
query.pop("sslmode", None)
query.pop("channel_binding", None)  # another psycopg2-only param Neon adds
clean_query = urlencode(query, doseq=True)
db_url = urlunparse(parsed._replace(query=clean_query))

connect_args = {}
if had_ssl or "neon.tech" in (parsed.hostname or ""):
    connect_args["ssl_context"] = ssl.create_default_context()

engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()