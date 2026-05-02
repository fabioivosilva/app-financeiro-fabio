import unittest
from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Category, Person, Transaction
from app.services.dashboard_service import get_dashboard_data


class DashboardServiceTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        self.Session = sessionmaker(bind=engine)

    def test_dashboard_month_uses_27_to_26_financial_cycle(self):
        db = self.Session()
        try:
            person = Person(name="Voce")
            income_cat = Category(name="Salario", kind="income")
            expense_cat = Category(name="Mercado", kind="variable", monthly_limit=500)
            db.add_all([person, income_cat, expense_cat])
            db.flush()

            db.add_all([
                Transaction(
                    date=date(2026, 4, 26),
                    description="Before cycle",
                    amount=999,
                    transaction_type="income",
                    source="bank_statement",
                    category_id=income_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
                Transaction(
                    date=date(2026, 4, 27),
                    description="Salario Maio",
                    amount=10000,
                    transaction_type="income",
                    source="bank_statement",
                    category_id=income_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
                Transaction(
                    date=date(2026, 5, 26),
                    description="Mercado",
                    amount=-300,
                    transaction_type="expense",
                    source="bank_statement",
                    category_id=expense_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
                Transaction(
                    date=date(2026, 5, 27),
                    description="After cycle",
                    amount=-100,
                    transaction_type="expense",
                    source="bank_statement",
                    category_id=expense_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
            ])
            db.commit()

            result = get_dashboard_data(db, "2026-05")

            self.assertEqual(result.period_start, date(2026, 4, 27))
            self.assertEqual(result.period_end, date(2026, 5, 26))
            self.assertEqual(result.total_income, 10000)
            self.assertEqual(result.total_expenses, 300)
            self.assertEqual(result.monthly_balance, 9700)
        finally:
            db.close()

    def test_dashboard_excludes_internal_invoice_payment_category(self):
        db = self.Session()
        try:
            person = Person(name="Voce")
            food_cat = Category(name="Restaurante", kind="variable", monthly_limit=1000)
            invoice_payment_cat = Category(
                name="Pagamento de Fatura",
                kind="transfer",
                exclude_from_totals=True,
            )
            db.add_all([person, food_cat, invoice_payment_cat])
            db.flush()

            db.add_all([
                Transaction(
                    date=date(2026, 5, 10),
                    description="Compra na fatura",
                    amount=-100,
                    transaction_type="expense",
                    source="credit_card",
                    category_id=food_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
                Transaction(
                    date=date(2026, 5, 11),
                    description="Pagamento fatura cartao",
                    amount=-100,
                    transaction_type="expense",
                    source="bank_statement",
                    category_id=invoice_payment_cat.id,
                    person_id=person.id,
                    is_reviewed=True,
                ),
            ])
            db.commit()

            result = get_dashboard_data(db, "2026-05")

            self.assertEqual(result.total_expenses, 100)
            self.assertEqual(result.credit_card_total, 100)
            self.assertEqual(result.bank_expenses_total, 0)
            self.assertEqual(result.monthly_balance, -100)
            self.assertEqual(result.spending_by_person[0].total, 100)
            self.assertEqual(
                [row.category_name for row in result.spending_by_category],
                ["Restaurante"],
            )
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
