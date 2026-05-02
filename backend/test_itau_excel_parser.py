import struct
import unittest
from datetime import date

from app.services.itau_excel_parser import parse_itau_excel


def _record(record_id, payload=b""):
    return struct.pack("<HH", record_id, len(payload)) + payload


def _bof(record_type):
    return _record(0x0809, struct.pack("<HHHHII", 0x0600, record_type, 0x0DBB, 0x07CC, 0, 0))


def _sst(strings):
    payload = struct.pack("<II", len(strings), len(strings))
    for value in strings:
        raw = value.encode("latin1")
        payload += struct.pack("<HB", len(value), 0) + raw
    return _record(0x00FC, payload)


def _label_sst(row, col, string_index):
    return _record(0x00FD, struct.pack("<HHHI", row, col, 0, string_index))


def _number(row, col, value):
    return _record(0x0203, struct.pack("<HHHd", row, col, 0, value))


def _minimal_biff_workbook():
    strings = [
        "FABIO IVO SILVA - final 1234 (titular)",
        "data",
        "lancamento",
        "valor",
        "01/05/2026",
        "Loja Teste 02/03",
        "02/05/2026",
        "Credito Teste",
        "total nacional do cartao - final 1234",
        "encargos e servicos",
        "03/05/2026",
        "Envio Mens.automatica",
    ]
    return b"".join([
        _bof(0x0005),
        _sst(strings),
        _record(0x000A),
        _bof(0x0010),
        _label_sst(0, 0, 0),
        _label_sst(2, 0, 1),
        _label_sst(2, 1, 2),
        _label_sst(2, 3, 3),
        _label_sst(3, 0, 4),
        _label_sst(3, 1, 5),
        _number(3, 3, 100.0),
        _label_sst(4, 0, 6),
        _label_sst(4, 1, 7),
        _number(4, 3, -25.5),
        _label_sst(5, 0, 8),
        _number(5, 3, 74.5),
        _label_sst(6, 0, 9),
        _label_sst(8, 0, 10),
        _label_sst(8, 1, 11),
        _number(8, 3, 7.99),
        _record(0x000A),
    ])


class ItauExcelParserTest(unittest.TestCase):
    def test_parse_biff_statement_rows(self):
        transactions = parse_itau_excel(_minimal_biff_workbook())

        self.assertEqual(len(transactions), 3)

        purchase = transactions[0]
        self.assertEqual(purchase["date"], date(2026, 5, 1))
        self.assertEqual(purchase["description"], "Loja Teste")
        self.assertEqual(purchase["amount"], -100.0)
        self.assertEqual(purchase["card_last_digits"], "1234")
        self.assertEqual(purchase["installment_current"], 2)
        self.assertEqual(purchase["installment_total"], 3)

        credit = transactions[1]
        self.assertEqual(credit["amount"], 25.5)
        self.assertEqual(credit["card_last_digits"], "1234")

        fee = transactions[2]
        self.assertEqual(fee["date"], date(2026, 5, 3))
        self.assertEqual(fee["amount"], -7.99)
        self.assertIsNone(fee["card_last_digits"])


if __name__ == "__main__":
    unittest.main()
