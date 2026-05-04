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

    # Adiciona exclude_totals em categories se não existir
    if 'categories' in inspector.get_table_names():
        cat_cols = [c['name'] for c in inspector.get_columns('categories')]
        if 'exclude_totals' not in cat_cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE categories ADD COLUMN exclude_totals BOOLEAN DEFAULT 0"))
                conn.commit()
        if 'icon' not in cat_cols:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE categories ADD COLUMN icon VARCHAR DEFAULT 'label'"))
                conn.commit()
        _seed_missing_categories()

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
            if changed:
                conn.commit()

    # Corrige tipo das categorias existentes (SAEnum → String permite novos tipos)
    with engine.connect() as conn:
        conn.execute(text("UPDATE categories SET type='receita' WHERE name IN ('Receitas','Salário','Freelance','CLT','13°/Bônus','Projetos')"))
        conn.execute(text("UPDATE categories SET type='interna', exclude_totals=1 WHERE name IN ('Transferência','Entre contas','Cofrinho')"))
        conn.commit()

    # Atualiza ícones das categorias conhecidas (icon='label' = padrão sem escolha)
    _migrate_icons()

    # Torna person_id nullable em cards (recria tabela se necessário)
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


_ICON_MAP: dict[str, str] = {
    # Principais
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
    # Receitas
    'Receitas':       'attach_money',
    'Salário':        'attach_money',
    'CLT':            'work',
    '13°/Bônus':      'card_giftcard',
    'Freelance':      'work',
    'Projetos':       'work',
    # Internas
    'Transferência':  'account_balance',
    'Entre contas':   'account_balance',
    'Cofrinho':       'savings',
    # Subcategorias Moradia
    'Aluguel':        'home',
    'Condomínio':     'apartment',
    'Luz':            'bolt',
    'Internet/TV':    'wifi',
    # Subcategorias Saúde
    'Plano de saúde': 'medical_services',
    'Academia':       'fitness_center',
    # Subcategorias Educação
    'Cursos online':  'menu_book',
    # Assinaturas
    'Assinaturas':    'credit_card',
    'Streaming':      'movie',
    'Música':         'music_note',
    'Software':       'devices',
    # Subcategorias Alimentação
    'Restaurante':    'lunch_dining',
    'Delivery':       'fastfood',
    'Café/Lanche':    'coffee',
    # Subcategorias Mercado
    'Supermercado':   'shopping_basket',
    'Feira':          'shopping_basket',
    'Padaria':        'coffee',
    # Subcategorias Transporte
    'Apps':           'local_taxi',
    'Combustível':    'local_gas_station',
    'Estacionamento': 'local_parking',
    # Subcategorias Lazer
    'Cinema/Teatro':  'movie',
    'Viagem':         'flight',
    'Hobbies':        'park',
}


def _migrate_icons():
    from sqlalchemy import text
    with engine.connect() as conn:
        for name, icon in _ICON_MAP.items():
            conn.execute(
                text("UPDATE categories SET icon=:icon WHERE name=:name AND (icon IS NULL OR icon='label')"),
                {'icon': icon, 'name': name},
            )
        conn.commit()


def _seed_missing_categories():
    """Insere categorias faltantes (Receitas, Internas e subcategorias) sem duplicar."""
    from sqlalchemy import text
    with engine.connect() as conn:
        existing = {row[0] for row in conn.execute(text("SELECT name FROM categories")).fetchall()}

        def add(name, color, type_, limit=None, parent_name=None, exclude=False):
            if name in existing:
                return
            parent_id = None
            if parent_name:
                row = conn.execute(text("SELECT id FROM categories WHERE name=:n"), {"n": parent_name}).fetchone()
                if row:
                    parent_id = row[0]
            icon = _ICON_MAP.get(name, 'label')
            conn.execute(text(
                "INSERT INTO categories (name, color, type, limit_value, parent_id, exclude_totals, icon) "
                "VALUES (:name, :color, :type, :limit, :parent, :excl, :icon)"
            ), {"name": name, "color": color, "type": type_, "limit": limit, "parent": parent_id, "excl": 1 if exclude else 0, "icon": icon})
            existing.add(name)

        # ── Receitas ──────────────────────────────────────────────────────────
        add("Salário",     "#22c55e", "receita")
        add("Freelance",   "#10b981", "receita")
        add("CLT",           "#22c55e", "receita", parent_name="Salário")
        add("13°/Bônus",     "#22c55e", "receita", parent_name="Salário")
        add("Projetos",      "#10b981", "receita", parent_name="Freelance")

        # ── Internas ──────────────────────────────────────────────────────────
        add("Transferência", "#94a3b8", "interna", exclude=True)
        add("Entre contas",  "#94a3b8", "interna", parent_name="Transferência", exclude=True)
        add("Cofrinho",      "#94a3b8", "interna", parent_name="Transferência", exclude=True)

        # ── Subcategorias Fixas ───────────────────────────────────────────────
        add("Aluguel",       "#6366f1", "fixa", parent_name="Moradia")
        add("Condomínio",    "#6366f1", "fixa", parent_name="Moradia")
        add("Luz",           "#6366f1", "fixa", parent_name="Moradia")
        add("Internet/TV",   "#6366f1", "fixa", parent_name="Moradia")
        add("Plano de saúde","#ec4899", "fixa", parent_name="Saúde")
        add("Academia",      "#ec4899", "fixa", parent_name="Saúde")
        add("Cursos online", "#14b8a6", "fixa", parent_name="Educação")
        add("Assinaturas",   "#f59e0b", "fixa", limit=150)
        add("Streaming",     "#f59e0b", "fixa", parent_name="Assinaturas")
        add("Música",        "#f59e0b", "fixa", parent_name="Assinaturas")
        add("Software",      "#f59e0b", "fixa", parent_name="Assinaturas")

        # ── Subcategorias Variáveis ───────────────────────────────────────────
        add("Restaurante",   "#f97316", "variavel", limit=600)
        add("Delivery",      "#ef4444", "variavel", parent_name="Restaurante")
        add("Café/Lanche",   "#f97316", "variavel", parent_name="Restaurante")
        add("Supermercado",  "#22c55e", "variavel", parent_name="Mercado")
        add("Feira",         "#22c55e", "variavel", parent_name="Mercado")
        add("Padaria",       "#22c55e", "variavel", parent_name="Mercado")
        add("Apps",          "#8b5cf6", "variavel", parent_name="Transporte")
        add("Combustível",   "#8b5cf6", "variavel", parent_name="Transporte")
        add("Cinema/Teatro", "#a855f7", "variavel", parent_name="Lazer")
        add("Viagem",        "#a855f7", "variavel", parent_name="Lazer")
        add("Hobbies",       "#a855f7", "variavel", parent_name="Lazer")

        conn.commit()
