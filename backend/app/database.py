import enum
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/finance.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app.models import Category, Person, Card, Transaction, Rule, Goal, Provision, Settings
    Base.metadata.create_all(bind=engine)
    
    # Migrações manuais
    inspector = inspect(engine)
    
    # Adiciona behaviors e limites
    if 'categories' in inspector.get_table_names():
        cols = [c['name'] for c in inspector.get_columns('categories')]
        with engine.connect() as conn:
            if 'provision_behavior' not in cols:
                conn.execute(text("ALTER TABLE categories ADD COLUMN provision_behavior VARCHAR DEFAULT 'none'"))
            if 'exclude_totals' not in cols:
                conn.execute(text("ALTER TABLE categories ADD COLUMN exclude_totals BOOLEAN DEFAULT 0"))
            if 'limit_value' not in cols:
                conn.execute(text("ALTER TABLE categories ADD COLUMN limit_value FLOAT"))
            if 'parent_id' not in cols:
                conn.execute(text("ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id)"))
            conn.commit()

    # Adiciona campos extras em Provisões
    if 'provisions' in inspector.get_table_names():
        prov_cols = [c['name'] for c in inspector.get_columns('provisions')]
        with engine.connect() as conn:
            changed = False
            if 'person_id' not in prov_cols:
                conn.execute(text("ALTER TABLE provisions ADD COLUMN person_id INTEGER"))
                changed = True
            if 'installment_current' not in prov_cols:
                conn.execute(text("ALTER TABLE provisions ADD COLUMN installment_current INTEGER"))
                changed = True
            if 'installment_total' not in prov_cols:
                conn.execute(text("ALTER TABLE provisions ADD COLUMN installment_total INTEGER"))
                changed = True
            if 'month' not in prov_cols:
                conn.execute(text("ALTER TABLE provisions ADD COLUMN month INTEGER"))
                changed = True
            if 'year' not in prov_cols:
                conn.execute(text("ALTER TABLE provisions ADD COLUMN year INTEGER"))
                changed = True
            if changed:
                conn.commit()

    # Adiciona provision_id em Transações
    if 'transactions' in inspector.get_table_names():
        tx_cols = [c['name'] for c in inspector.get_columns('transactions')]
        if 'provision_id' not in tx_cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE transactions ADD COLUMN provision_id INTEGER REFERENCES provisions(id)"))
                conn.commit()

    # Corrige tipo das categorias existentes
    with engine.connect() as conn:
        conn.execute(text("UPDATE categories SET type='receita' WHERE name IN ('Receitas','Salário','Freelance','CLT','13°/Bônus','Projetos')"))
        conn.execute(text("UPDATE categories SET type='interna', exclude_totals=1 WHERE name IN ('Transferência','Entre contas','Cofrinho')"))
        conn.commit()

    _migrate_icons()

    if 'goals' in inspector.get_table_names():
        goal_cols = [c['name'] for c in inspector.get_columns('goals')]
        if 'icon' not in goal_cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE goals ADD COLUMN icon VARCHAR"))
                conn.commit()

    # Torna person_id nullable em cards
    if 'cards' in inspector.get_table_names():
        col_info = {c['name']: c for c in inspector.get_columns('cards')}
        if col_info.get('person_id', {}).get('nullable') is False:
            with engine.connect() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS cards_new (
                        id INTEGER PRIMARY KEY,
                        name VARCHAR NOT NULL,
                        last4 VARCHAR,
                        limit_value FLOAT,
                        person_id INTEGER REFERENCES persons(id)
                    )
                """))
                conn.execute(text("INSERT INTO cards_new SELECT id, name, last4, limit_value, person_id FROM cards"))
                conn.execute(text("DROP TABLE cards"))
                conn.execute(text("ALTER TABLE cards_new RENAME TO cards"))
                conn.commit()

def _migrate_icons():
    from app.models import Category
    db = SessionLocal()
    try:
        cats = db.query(Category).all()
        for c in cats:
            if c.icon == 'label' or not c.icon:
                c.icon = _ICON_MAP.get(c.name, 'label')
        db.commit()
    finally:
        db.close()

_ICON_MAP: dict[str, str] = {
    'Moradia':        'home',
    'Transporte':     'directions_car',
    'Saúde':          'health_and_safety',
    'Educação':       'school',
    'Alimentação':    'restaurant',
    'iFood':          'local_pizza',
    'Mercado':        'shopping_basket',
    'Farmácia':       'medication',
    'Lazer':          'sports_esports',
    'Outros':         'help',
    'Assinaturas':    'subscriptions',
    'Pets':           'pets',
    'Roupas':         'checkroom',
    'Presentes':      'redeem',
    'Viagem':         'flight',
    'Cartão':         'credit_card',
    'Transferência':  'sync_alt',
    'Salário':        'payments',
    'Freelance':      'work',
}
