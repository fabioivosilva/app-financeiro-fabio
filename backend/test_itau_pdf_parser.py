import unittest
from unittest.mock import patch

from app.services.itau_pdf_parser import _parse_amount, parse_itau_pdf


class _FakePage:
    def __init__(self, text):
        self._text = text

    def extract_text(self):
        return self._text


class _FakePdf:
    def __init__(self, text):
        self.pages = [_FakePage(text)]

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False


class ItauPdfParserTest(unittest.TestCase):
    def test_parse_amount_preserves_credit_marker(self):
        self.assertEqual(_parse_amount("Compra R$ 479,42"), 479.42)
        self.assertEqual(_parse_amount("Credito Parc Indevida - R$ 39,38"), -39.38)

    def test_latam_pass_card_sections_are_not_shifted_by_totals(self):
        text = """
fatura de maio 2026
lancamentos nacionais
fabio ivo silva - final 1609 (titular)
data lancamento valor
23 / abr Hot Beach Resort 01/10 R$ 479,42
total nacional do cartao - final 1609 (titular) R$ 479,42
fernanda y checchia ingrav - final 4346 (adicional)
data lancamento valor
23 / abr Credito Parc Indevida - R$ 39,38
24 / abr Compra Normal R$ 10,00
total nacional do cartao - final 4346 (adicional) R$ 49,38
"""

        with patch("app.services.itau_pdf_parser.pdfplumber.open", return_value=_FakePdf(text)):
            transactions = parse_itau_pdf(b"pdf bytes")

        self.assertEqual(len(transactions), 3)
        self.assertEqual(transactions[0]["card_last_digits"], "1609")
        self.assertEqual(transactions[0]["amount"], -479.42)
        self.assertEqual(transactions[0]["installment_current"], 1)
        self.assertEqual(transactions[0]["installment_total"], 10)

        self.assertEqual(transactions[1]["card_last_digits"], "4346")
        self.assertEqual(transactions[1]["amount"], 39.38)
        self.assertEqual(transactions[1]["description"], "Credito Parc Indevida")

        self.assertEqual(transactions[2]["card_last_digits"], "4346")
        self.assertEqual(transactions[2]["amount"], -10.0)


if __name__ == "__main__":
    unittest.main()
