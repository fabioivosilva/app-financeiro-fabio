"""
Seed initial data: persons, categories, rules, goals.
Run once on first startup or manually.
"""
from sqlalchemy.orm import Session
from .models import Person, Category, Rule, Goal


ACCOUNTING_INTERNAL_CATEGORY = "Pagamento de Fatura"
ACCOUNTING_INTERNAL_RULES = [
    "PAGAMENTO FATURA",
    "PAGAMENTO DE FATURA",
    "PAGTO FATURA",
    "PAGTO CARTAO",
    "PAGAMENTO CARTAO",
    "DEBITO AUTOMATICO CARTAO",
    "DEB AUTOMATICO CARTAO",
]


def seed_database(db: Session) -> None:
    """Populate database with initial data if empty."""
    # Create the original seed only once, then always ensure accounting defaults.
    if db.query(Person).first():
        ensure_accounting_defaults(db)
        return

    # -----------------------------------------------------------------------
    # Persons
    # -----------------------------------------------------------------------
    voce = Person(name="Você")
    fernanda = Person(name="Fernanda")
    db.add_all([voce, fernanda])
    db.flush()  # get IDs

    # -----------------------------------------------------------------------
    # Categories — Fixed
    # -----------------------------------------------------------------------
    fixed_categories = [
        Category(name="Aluguel", kind="fixed", color="#7E57C2"),
        Category(name="Escola", kind="fixed", color="#5C6BC0"),
        Category(name="MBA", kind="fixed", monthly_limit=960, color="#42A5F5"),
        Category(name="Seguro / Prudential", kind="fixed", color="#26A69A"),
        Category(name="Assinaturas", kind="fixed", monthly_limit=200, color="#AB47BC"),
        Category(name="Internet / Luz / Celular", kind="fixed", color="#78909C"),
        Category(name="Cozinheira", kind="fixed", color="#8D6E63"),
        Category(name="Faxineira", kind="fixed", color="#A1887F"),
        Category(name="Previdência Gustavo", kind="fixed", color="#820AD1"),
        Category(name="Cartão de Crédito", kind="fixed", color="#d10a9c"),
        Category(name="Parentes emprestimo", kind="fixed", color="#820AD1"),
        Category(name="Reserva de Emergência", kind="fixed", color="#17d10a"),
    ]
    db.add_all(fixed_categories)

    # -----------------------------------------------------------------------
    # Categories — Variable
    # -----------------------------------------------------------------------
    variable_categories = [
        Category(name="Mercado", kind="variable", monthly_limit=1800, color="#E57373"),
        Category(name="iFood / Keeta", kind="variable", monthly_limit=800, color="#81C784"),
        Category(name="Farmácia", kind="variable", monthly_limit=400, color="#64B5F6"),
        Category(name="Combustível / Carro", kind="variable", monthly_limit=1000, color="#FFD54F"),
        Category(name="Transporte", kind="variable", color="#FF8A65"),
        Category(name="Outros", kind="variable", monthly_limit=500, color="#BDBDBD"),
        Category(name="Lazer", kind="variable", color="#afdb0f"),
        Category(name="Restaurantes", kind="variable", color="#0a71d1"),
        Category(name="Reserva de ", kind="variable", color="#820AD1"),
    ]
    db.add_all(variable_categories)

    # -----------------------------------------------------------------------
    # Categories — Income
    # -----------------------------------------------------------------------
    income_categories = [
        Category(name="Salário", kind="income", color="#4CAF50"),
        Category(name="Salário Fernanda", kind="income", color="#66BB6A"),
        Category(name="Reembolso", kind="income", color="#81C784"),
        Category(name="PLR", kind="income", color="#A5D6A7"),
        Category(name="13º", kind="income", color="#C8E6C9"),
        Category(name="IR", kind="income", color="#E8F5E9"),
        Category(name="Pagto Diversos", kind="income", color="#820AD1"),
    ]
    db.add_all(income_categories)
    db.flush()

    # Build category lookup for rules
    cat_map = {}
    for c in db.query(Category).all():
        cat_map[c.name] = c.id

    # -----------------------------------------------------------------------
    # Rules
    # -----------------------------------------------------------------------
    rules_data = [
        # keyword, category_name, person, source, priority
        ("IFOOD", "iFood / Keeta", None, None, 10),
        ("KEETA", "iFood / Keeta", None, None, 10),
        ("VILA DAS FRUTAS", "Mercado", None, None, 10),
        ("SAMS CLUB", "Mercado", None, None, 10),
        ("PAO DE ACUCAR", "Mercado", None, None, 10),
        ("CARREFOUR", "Mercado", None, None, 10),
        ("HIROTA", "Mercado", None, None, 10),
        ("DROGARIA", "Farmácia", None, None, 10),
        ("RAIA", "Farmácia", None, None, 10),
        ("UBER", "Transporte", None, None, 10),
        ("PRUDENTIAL", "Seguro / Prudential", None, None, 10),
        ("NETFLIX", "Assinaturas", None, None, 10),
        ("SPOTIFY", "Assinaturas", None, None, 10),
        ("PARAMOUNT", "Assinaturas", None, None, 10),
        ("PRIME", "Assinaturas", None, None, 5),
        ("TOTALPASS", "Assinaturas", None, None, 10),
        ("SALARIO", "Salário", None, "bank_statement", 10),
        ("PIX RECEBIDO", "Reembolso", None, "bank_statement", 5),
        ("ZUL 2 CARTOES 22C4D9", "Combustível / Carro", None, "credit_card", 20),
        ("APPLE.COM/BILL.", "Assinaturas", None, "credit_card", 20),
        ("POSTO MELIDE", "Combustível / Carro", None, "credit_card", 20),
        ("IFD*DIMED S/A - DISTRI", "iFood / Keeta", None, "credit_card", 20),
        ("CINEMARK ELDORADO", "Lazer", None, "credit_card", 20),
        ("OSHIROPASTEISREIS", "iFood / Keeta", None, "credit_card", 20),
        ("NEW MARKET PLACE", "Mercado", None, "credit_card", 20),
        ("ESTAPAR*ZAD*SAO***PAUL", "Combustível / Carro", None, "credit_card", 20),
        ("SHOPPING CENTER ELDORA", "Combustível / Carro", None, "credit_card", 20),
        ("GRUPO MADERO", "Restaurantes", None, "credit_card", 20),
        ("AUTOGLASS", "Combustível / Carro", None, "credit_card", 20),
        ("VILADASBOLINHAS", "Lazer", None, "credit_card", 20),
        ("EC *MELIMAIS", "Assinaturas", None, "credit_card", 20),
        ("SALA VIPIPIRANGA", "Restaurantes", None, "credit_card", 20),
        ("ENVIO MENS.AUTOMATICA", "Cartão de Crédito", None, "credit_card", 20),
        ("ITAU MC 1509 3347", "Pagamento de Fatura", None, "bank_statement", 20),
        ("IFD*LANCHONETE MELLO", "Restaurantes", None, "credit_card", 20),
        ("SARAH", "Outros", None, "credit_card", 20),
        ("RICARDO JAFET DELIVERY", "iFood / Keeta", None, "credit_card", 20),
        ("HOT BEACH RESORT", "Parentes emprestimo", None, "credit_card", 20),
        ("FIORELLA", "iFood / Keeta", None, "credit_card", 20),
        ("FINI - MOOCA PLAZA SHO", "iFood / Keeta", None, "credit_card", 20),
        ("JUSTPARK", "Combustível / Carro", None, "credit_card", 20),
        ("CONTA VIVO", "Internet / Luz / Celular", None, "credit_card", 20),
        ("CHURRASCO DO KAKA", "Restaurantes", None, "credit_card", 20),
        ("APLICACAO COFRINHOS", "Reserva de ", None, "bank_statement", 20),
        ("FMU", "MBA", None, "credit_card", 20),
        ("TENNESSEE VERGUEIRO", "Mercado", None, "credit_card", 20),
        ("FLIPWASH JABAQUARA", "Combustível / Carro", None, "credit_card", 20),
        ("DAKI", "Mercado", None, "credit_card", 20),
        ("DA SANTA", "Mercado", None, "credit_card", 20),
    ]

    for keyword, cat_name, person_id, source, priority in rules_data:
        db.add(Rule(
            keyword=keyword,
            category_id=cat_map.get(cat_name),
            person_id=person_id,
            source=source,
            priority=priority,
            is_active=True,
        ))

    # -----------------------------------------------------------------------
    # Goal — Reserva de emergência
    # -----------------------------------------------------------------------
    reserva_goal = Goal(
        name="Reserva de emergência",
        target_amount=10000.0,
        current_amount=0.0,
        target_date=None,
    )
    db.add(reserva_goal)
    db.flush()

    # Link "Reserva de Emergência" category to this goal
    reserva_cat = db.query(Category).filter(Category.name == "Reserva de Emergência").first()
    if reserva_cat:
        reserva_cat.goal_id = reserva_goal.id

    db.commit()
    ensure_accounting_defaults(db)
    print("[SEED] Database seeded with 56 rules and goal-category links.")


def ensure_accounting_defaults(db: Session) -> None:
    """Ensure categories/rules that protect dashboard accounting exist."""
    category = (
        db.query(Category)
        .filter(Category.name == ACCOUNTING_INTERNAL_CATEGORY)
        .first()
    )
    if not category:
        category = Category(
            name=ACCOUNTING_INTERNAL_CATEGORY,
            kind="transfer",
            color="#607D8B",
            exclude_from_totals=True,
        )
        db.add(category)
        db.flush()
    else:
        category.kind = "transfer"
        category.exclude_from_totals = True

    for keyword in ACCOUNTING_INTERNAL_RULES:
        existing = (
            db.query(Rule)
            .filter(
                Rule.keyword == keyword,
                Rule.source == "bank_statement",
            )
            .first()
        )
        if existing:
            existing.category_id = category.id
            existing.priority = max(existing.priority or 0, 100)
            existing.is_active = True
            continue

        db.add(Rule(
            keyword=keyword,
            category_id=category.id,
            person_id=None,
            source="bank_statement",
            priority=100,
            is_active=True,
        ))

    db.commit()

