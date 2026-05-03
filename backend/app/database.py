from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "..", "data", "finance.db")
DATABASE_URL = f"sqlite:///{os.path.abspath(DB_PATH)}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import Transaction, Category, Rule, Person, Card, Goal, Settings  # noqa
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    Base.metadata.create_all(bind=engine)
    _migrate()


def _migrate():
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if 'categories' in inspector.get_table_names():
        cols = [c['name'] for c in inspector.get_columns('categories')]
        if 'parent_id' not in cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE categories ADD COLUMN parent_id INTEGER"))
                conn.commit()
