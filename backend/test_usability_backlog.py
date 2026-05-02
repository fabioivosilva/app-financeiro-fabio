import unittest
from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Card, Category, Person, Transaction
from app.routers.categories import delete_category, list_categories
from app.routers.imports import _import_credit_card_transactions
from app.routers.transactions import list_transactions


class UsabilityBacklogTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        self.Session = sessionmaker(bind=engine)

    def test_excel_import_links_cardholder_person_card_and_transactions(self):
        db = self.Session()
        try:
            existing = Person(name="Fabio Silva")
            db.add(existing)
            db.commit()

            result = _import_credit_card_transactions(
                db=db,
                filename="fatura.xls",
                file_type="credit_card_excel",
                raw_transactions=[
                    {
                        "date": date(2026, 5, 1),
                        "description": "Loja Teste",
                        "amount": -100.0,
                        "transaction_type": "expense",
                        "source": "credit_card",
                        "card_last_digits": "1234",
                        "cardholder_first_name": "Fabio",
                    },
                    {
                        "date": date(2026, 5, 2),
                        "description": "Mercado Teste",
                        "amount": -42.0,
                        "transaction_type": "expense",
                        "source": "credit_card",
                        "card_last_digits": "5678",
                        "cardholder_first_name": "Fernanda",
                    },
                    {
                        "date": date(2026, 5, 3),
                        "description": "Envio Mens.automatica",
                        "amount": -7.99,
                        "transaction_type": "expense",
                        "source": "credit_card",
                        "card_last_digits": None,
                        "cardholder_first_name": None,
                    },
                ],
            )

            self.assertEqual(result.total_imported, 3)

            fabio = db.query(Person).filter(Person.name == "Fabio Silva").one()
            fernanda = db.query(Person).filter(Person.name == "Fernanda").one()

            card_1234 = db.query(Card).filter(Card.last_digits == "1234").one()
            card_5678 = db.query(Card).filter(Card.last_digits == "5678").one()
            self.assertEqual(card_1234.person_id, fabio.id)
            self.assertEqual(card_5678.person_id, fernanda.id)

            loja = db.query(Transaction).filter(Transaction.description == "Loja Teste").one()
            mercado = db.query(Transaction).filter(Transaction.description == "Mercado Teste").one()
            fee = db.query(Transaction).filter(Transaction.description == "Envio Mens.automatica").one()
            self.assertEqual(loja.person_id, fabio.id)
            self.assertEqual(mercado.person_id, fernanda.id)
            self.assertIsNone(fee.person_id)
        finally:
            db.close()

    def test_excel_reimport_backfills_duplicate_transaction_person(self):
        db = self.Session()
        try:
            card = Card(last_digits="1234")
            db.add(card)
            db.flush()
            existing = Transaction(
                date=date(2026, 4, 29),
                description="Loja Teste",
                amount=-100.0,
                transaction_type="expense",
                source="credit_card",
                card_id=card.id,
                hash=Transaction.compute_hash(
                    date(2026, 4, 29),
                    "Loja Teste",
                    -100.0,
                    "credit_card",
                    card.id,
                ),
            )
            db.add(existing)
            db.commit()

            result = _import_credit_card_transactions(
                db=db,
                filename="fatura.xls",
                file_type="credit_card_excel",
                raw_transactions=[
                    {
                        "date": date(2026, 4, 29),
                        "description": "Loja Teste",
                        "amount": -100.0,
                        "transaction_type": "expense",
                        "source": "credit_card",
                        "card_last_digits": "1234",
                        "cardholder_first_name": "Fabio",
                    },
                ],
            )

            db.refresh(card)
            db.refresh(existing)
            person = db.query(Person).filter(Person.name == "Fabio").one()
            self.assertEqual(result.duplicates_skipped, 1)
            self.assertEqual(card.person_id, person.id)
            self.assertEqual(existing.person_id, person.id)
        finally:
            db.close()

    def test_transaction_cycle_filter_uses_financial_period(self):
        db = self.Session()
        try:
            included = Transaction(
                date=date(2026, 4, 27),
                description="Compra Ciclo Maio",
                amount=-50.0,
                transaction_type="expense",
                source="credit_card",
                is_reviewed=True,
            )
            excluded = Transaction(
                date=date(2026, 4, 26),
                description="Compra Ciclo Abril",
                amount=-60.0,
                transaction_type="expense",
                source="credit_card",
                is_reviewed=True,
            )
            db.add_all([included, excluded])
            db.commit()

            txns = list_transactions(month="2026-05", source="credit_card", cycle=True, db=db)
            descriptions = [txn.description for txn in txns]

            self.assertEqual(descriptions, ["Compra Ciclo Maio"])
        finally:
            db.close()

    def test_delete_category_marks_inactive_and_default_listing_hides_it(self):
        db = self.Session()
        try:
            keep = Category(name="Mercado", kind="variable", is_active=True)
            remove = Category(name="Delivery", kind="variable", is_active=True)
            db.add_all([keep, remove])
            db.commit()

            deleted = delete_category(remove.id, db=db)

            self.assertFalse(deleted.is_active)
            visible_names = [category.name for category in list_categories(db=db)]
            self.assertEqual(visible_names, ["Mercado"])

            stored = db.query(Category).filter(Category.id == remove.id).one()
            self.assertFalse(stored.is_active)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
