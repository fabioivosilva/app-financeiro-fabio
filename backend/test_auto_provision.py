import unittest
from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Category, Provision, Transaction
from app.services.auto_provision import maybe_upsert_income_provision


class AutoProvisionTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
        )
        Base.metadata.create_all(bind=engine)
        self.Session = sessionmaker(bind=engine)
        self.db = self.Session()

    def tearDown(self):
        self.db.close()

    def _category(self, name: str, type_: str) -> Category:
        category = Category(name=name, type=type_)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def _transaction(
        self,
        category: Category,
        amount: float,
        tx_date: date,
        person_id: int | None = None,
    ) -> Transaction:
        transaction = Transaction(
            date=tx_date,
            description=f"{category.name} {tx_date.isoformat()}",
            amount=amount,
            category_id=category.id,
            person_id=person_id,
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def test_preserves_income_auto_provision(self):
        category = self._category("Salario", "receita")
        self._transaction(category, 5000, date(2026, 1, 5), person_id=1)
        current = self._transaction(category, 5200, date(2026, 2, 7), person_id=1)

        provision = maybe_upsert_income_provision(self.db, current)

        self.assertIsNotNone(provision)
        self.assertEqual(provision.amount, 5100)
        self.assertEqual(provision.day, 6)
        self.assertEqual(provision.category_id, category.id)
        self.assertEqual(provision.person_id, 1)
        self.assertTrue(provision.active)

    def test_creates_fixed_expense_auto_provision(self):
        category = self._category("Aluguel", "fixa")
        self._transaction(category, -1800, date(2026, 1, 10), person_id=2)
        current = self._transaction(category, -1900, date(2026, 2, 12), person_id=2)

        provision = maybe_upsert_income_provision(self.db, current)

        self.assertIsNotNone(provision)
        self.assertEqual(provision.description, "Aluguel")
        self.assertEqual(provision.amount, -1850)
        self.assertEqual(provision.day, 11)
        self.assertEqual(provision.type, "mensal")
        self.assertEqual(provision.category_id, category.id)
        self.assertEqual(provision.person_id, 2)
        self.assertTrue(provision.active)

    def test_updates_existing_fixed_expense_auto_provision(self):
        category = self._category("Internet", "fixa")
        existing = Provision(
            description="Internet",
            amount=-100,
            day=1,
            type="mensal",
            category_id=category.id,
            person_id=None,
            active=False,
        )
        self.db.add(existing)
        self.db.commit()

        self._transaction(category, -120, date(2026, 1, 8))
        current = self._transaction(category, -150, date(2026, 2, 10))

        provision = maybe_upsert_income_provision(self.db, current)

        self.assertEqual(provision.id, existing.id)
        self.assertEqual(provision.amount, -135)
        self.assertEqual(provision.day, 9)
        self.assertTrue(provision.active)

    def test_ignores_internal_and_variable_categories(self):
        for type_ in ("interna", "variavel"):
            with self.subTest(type=type_):
                category = self._category(f"Categoria {type_}", type_)
                self._transaction(category, -50, date(2026, 1, 4))
                current = self._transaction(category, -60, date(2026, 2, 5))

                provision = maybe_upsert_income_provision(self.db, current)

                self.assertIsNone(provision)


if __name__ == "__main__":
    unittest.main()
