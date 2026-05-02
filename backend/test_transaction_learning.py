import unittest
from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Category, Transaction
from app.services.transaction_learning import categorize_with_learning


class TransactionLearningTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        self.Session = sessionmaker(bind=engine)

    def test_manual_categorization_creates_rule_and_updates_same_pending_items(self):
        db = self.Session()
        try:
            category = Category(name="iFood / Keeta", kind="variable")
            db.add(category)
            db.flush()

            selected = Transaction(
                date=date(2026, 5, 1),
                description="Ifd*lanchonete Mello",
                amount=-94.28,
                transaction_type="expense",
                source="credit_card",
                is_reviewed=False,
            )
            same_pending = Transaction(
                date=date(2026, 5, 2),
                description="  ifd*lanchonete   mello ",
                amount=-92.29,
                transaction_type="expense",
                source="credit_card",
                is_reviewed=False,
            )
            already_reviewed = Transaction(
                date=date(2026, 5, 3),
                description="Ifd*lanchonete Mello",
                amount=-90,
                transaction_type="expense",
                source="credit_card",
                is_reviewed=True,
            )
            different_source = Transaction(
                date=date(2026, 5, 4),
                description="Ifd*lanchonete Mello",
                amount=-91,
                transaction_type="expense",
                source="bank_statement",
                is_reviewed=False,
            )
            db.add_all([selected, same_pending, already_reviewed, different_source])
            db.commit()

            selected, rule, similar_updated = categorize_with_learning(
                db,
                transaction=selected,
                category_id=category.id,
            )

            db.refresh(same_pending)
            db.refresh(already_reviewed)
            db.refresh(different_source)

            self.assertIsNotNone(rule)
            self.assertEqual(rule.keyword, "IFD*LANCHONETE MELLO")
            self.assertEqual(rule.source, "credit_card")
            self.assertEqual(similar_updated, 1)
            self.assertEqual(selected.category_id, category.id)
            self.assertTrue(selected.is_reviewed)
            self.assertEqual(same_pending.category_id, category.id)
            self.assertTrue(same_pending.is_reviewed)
            self.assertIsNone(already_reviewed.category_id)
            self.assertIsNone(different_source.category_id)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
