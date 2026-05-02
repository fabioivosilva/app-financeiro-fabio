"""
Database configuration — SQLAlchemy + SQLite local.
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import text

if getattr(sys, 'frozen', False):
    # If the application is run as a bundle, the PyInstaller bootloader
    # extends the sys module by a flag frozen=True and sets the app 
    # path into variable _MEIPASS.
    # The actual executable is in sys.executable.
    _BASE_DIR = os.path.dirname(sys.executable)
else:
    # Running locally
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


def ensure_database_schema() -> None:
    """Apply lightweight SQLite migrations for existing local databases."""
    with engine.begin() as conn:
        category_columns = {
            row[1] for row in conn.execute(text("PRAGMA table_info(categories)")).fetchall()
        }
        if "exclude_from_totals" not in category_columns:
            conn.execute(text(
                "ALTER TABLE categories "
                "ADD COLUMN exclude_from_totals BOOLEAN NOT NULL DEFAULT 0"
            ))
        if "goal_id" not in category_columns:
            conn.execute(text(
                "ALTER TABLE categories "
                "ADD COLUMN goal_id INTEGER REFERENCES goals(id)"
            ))


def get_db():
    """FastAPI dependency — yields a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
