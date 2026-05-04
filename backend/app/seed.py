"""
seed.py — fonte da verdade das regras de negócio.
Ciclo financeiro: dia 27 ao dia 26.
"""
from datetime import date
from app.database import SessionLocal, init_db
from app.models import Category, Person, Card, Goal, Settings, Transaction, Rule


def seed():
    init_db()
    db = SessionLocal()

    if db.query(Settings).first():
        print("Seed já executado. Pulando.")
        db.close()
        return

    # Settings
    db.add(Settings(cycle_start_day=27))

    # Pessoas
    fabio = Person(name="Fabio")
    fernanda = Person(name="Fernanda")
    db.add_all([fabio, fernanda])
    db.flush()

    # Cartões
    card_fabio = Card(name="Itaú Mastercard Black", last4="5761", limit_value=15000.0, person_id=fabio.id)
    card_fernanda = Card(name="Itaú Visa Gold", last4="9876", limit_value=8000.0, person_id=fernanda.id)
    db.add_all([card_fabio, card_fernanda])
    db.flush()

    # Categorias fixas
    cats_fixas = [
        Category(name="Moradia",    color="#6366f1", limit_value=3000.0, type="fixa",    icon="home"),
        Category(name="Transporte", color="#8b5cf6", limit_value=800.0,  type="fixa",    icon="directions_car"),
        Category(name="Saúde",      color="#ec4899", limit_value=500.0,  type="fixa",    icon="health_and_safety"),
        Category(name="Educação",   color="#14b8a6", limit_value=600.0,  type="fixa",    icon="school"),
    ]
    # Categorias variáveis
    cats_var = [
        Category(name="Alimentação", color="#f97316", limit_value=1200.0, type="variavel", icon="restaurant"),
        Category(name="iFood",       color="#ef4444", limit_value=400.0,  type="variavel", icon="local_pizza"),
        Category(name="Mercado",     color="#22c55e", limit_value=800.0,  type="variavel", icon="shopping_basket"),
        Category(name="Farmácia",    color="#06b6d4", limit_value=200.0,  type="variavel", icon="medication"),
        Category(name="Lazer",       color="#a855f7", limit_value=500.0,  type="variavel", icon="sports_esports"),
        Category(name="Outros",      color="#78716c", limit_value=None,   type="variavel", icon="help"),
    ]
    db.add_all(cats_fixas + cats_var)
    db.flush()

    cat = {c.name: c for c in db.query(Category).all()}

    # Regras de categorização automática
    regras = [
        Rule(keyword="ifood",        category_id=cat["iFood"].id,       person_id=None),
        Rule(keyword="rappi",        category_id=cat["iFood"].id,       person_id=None),
        Rule(keyword="uber eats",    category_id=cat["iFood"].id,       person_id=None),
        Rule(keyword="supermercado", category_id=cat["Mercado"].id,     person_id=None),
        Rule(keyword="carrefour",    category_id=cat["Mercado"].id,     person_id=None),
        Rule(keyword="extra",        category_id=cat["Mercado"].id,     person_id=None),
        Rule(keyword="farmacia",     category_id=cat["Farmácia"].id,    person_id=None),
        Rule(keyword="drogasil",     category_id=cat["Farmácia"].id,    person_id=None),
        Rule(keyword="uber",         category_id=cat["Transporte"].id,  person_id=None),
        Rule(keyword="99",           category_id=cat["Transporte"].id,  person_id=None),
        Rule(keyword="netflix",      category_id=cat["Lazer"].id,       person_id=None),
        Rule(keyword="spotify",      category_id=cat["Lazer"].id,       person_id=None),
        Rule(keyword="amazon",       category_id=cat["Outros"].id,      person_id=None),
    ]
    db.add_all(regras)

    # Meta de reserva de emergência
    meta_reserva = Goal(
        name="Reserva de Emergência",
        target=30000.0,
        current=12500.0,
        deadline=date(2026, 12, 31),
    )
    db.add(meta_reserva)

    # Transações de exemplo — ciclo atual (Abr 27 → Mai 26 2026)
    hoje = date(2026, 5, 2)
    transacoes = [
        Transaction(date=date(2026, 4, 27), description="Aluguel",             amount=-2800.0, category_id=cat["Moradia"].id,    person_id=fabio.id,    origin="Débito",   status="confirmado"),
        Transaction(date=date(2026, 4, 28), description="Supermercado Extra",  amount=-320.0,  category_id=cat["Mercado"].id,    person_id=fernanda.id, origin="Crédito",  status="confirmado", card_id=card_fernanda.id),
        Transaction(date=date(2026, 4, 29), description="iFood Jantar",        amount=-89.90,  category_id=cat["iFood"].id,      person_id=fabio.id,    origin="Crédito",  status="confirmado", card_id=card_fabio.id),
        Transaction(date=date(2026, 4, 30), description="Uber corrida",        amount=-32.50,  category_id=cat["Transporte"].id, person_id=fabio.id,    origin="PIX",      status="confirmado"),
        Transaction(date=date(2026, 5, 1),  description="Netflix",             amount=-55.90,  category_id=cat["Lazer"].id,      person_id=fabio.id,    origin="Crédito",  status="confirmado", card_id=card_fabio.id),
        Transaction(date=date(2026, 5, 1),  description="Spotify",             amount=-21.90,  category_id=cat["Lazer"].id,      person_id=fernanda.id, origin="Crédito",  status="confirmado", card_id=card_fernanda.id),
        Transaction(date=date(2026, 5, 2),  description="Drogasil",            amount=-45.00,  category_id=cat["Farmácia"].id,   person_id=fernanda.id, origin="Crédito",  status="confirmado", card_id=card_fernanda.id),
        Transaction(date=date(2026, 5, 2),  description="Salário Fabio",       amount=8500.0,  category_id=None,                 person_id=fabio.id,    origin="PIX",      status="confirmado"),
        Transaction(date=date(2026, 5, 2),  description="Aporte Reserva",      amount=-875.0,  category_id=None,                 person_id=fabio.id,    origin="Aporte Manual", status="confirmado", goal_id=1),
    ]
    db.add_all(transacoes)

    db.commit()
    db.close()
    print("Seed concluído com sucesso.")


if __name__ == "__main__":
    seed()
