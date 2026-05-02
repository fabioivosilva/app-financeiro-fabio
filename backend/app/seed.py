"""
Seed initial data: persons, categories, rules, goals.
Run once on first startup or manually.
"""
from sqlalchemy.orm import Session
from .models import Person, Category, Rule, Goal


def seed_database(db: Session) -> None:
    """Populate database with initial data if empty."""
    # Skip if already seeded
    if db.query(Person).first():
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
        Category(name="MBA", kind="fixed", color="#42A5F5"),
        Category(name="Seguro / Prudential", kind="fixed", color="#26A69A"),
        Category(name="Assinaturas", kind="fixed", monthly_limit=200, color="#AB47BC"),
        Category(name="Internet / Luz / Celular", kind="fixed", color="#78909C"),
        Category(name="Cozinheira", kind="fixed", color="#8D6E63"),
        Category(name="Faxineira", kind="fixed", color="#A1887F"),
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
    db.add(Goal(
        name="Reserva de emergência",
        target_amount=10000.0,
        current_amount=0.0,
        target_date=None,
    ))

    db.commit()
    print("[SEED] Database seeded with initial data.")
