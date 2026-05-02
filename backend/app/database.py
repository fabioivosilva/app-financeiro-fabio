"""
Database configuration — SQLAlchemy + SQLite local.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Resolve path relative to project root (2 levels up from this file)
_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_DATA_DIR = os.path.join(_BASE_DIR, "data")
os.makedirs(_DATA_DIR, exist_ok=True)

DATABASE_URL = f"sqlite:///{os.path.join(_DATA_DIR, 'finance.db')}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # needed for SQLite
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
