import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Category
from app.seed import seed_database
from app.services.categorizer import categorize


class AccountingRulesTest(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        self.Session = sessionmaker(bind=engine)

    def test_invoice_payment_is_seeded_as_internal_category(self):
        db = self.Session()
        try:
            seed_database(db)

            category = (
                db.query(Category)
                .filter(Category.name == "Pagamento de Fatura")
                .one()
            )
            self.assertEqual(category.kind, "transfer")
            self.assertTrue(category.exclude_from_totals)

            cat_id, person_id, is_reviewed = categorize(
                db,
                description="PAGAMENTO FATURA CARTAO",
                source="bank_statement",
            )

            self.assertEqual(cat_id, category.id)
            self.assertIsNone(person_id)
            self.assertTrue(is_reviewed)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
