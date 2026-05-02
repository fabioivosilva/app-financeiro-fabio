"""
OFX Parser — Reads bank statement OFX files.
Uses ofxparse to extract transactions.
"""
import io
from datetime import date
from typing import List, Dict, Any
from ofxparse import OfxParser as _OfxParser


def parse_ofx(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Parse an OFX file and return a list of transaction dicts.

    Each dict contains:
        - date: date
        - description: str
        - amount: float
        - transaction_type: 'income' | 'expense'
        - external_id: str (FITID)
        - source: 'bank_statement'
    """
    ofx = _OfxParser.parse(io.BytesIO(file_content))
    transactions = []

    for account in ofx.accounts:
        for txn in account.statement.transactions:
            amount = float(txn.amount)
            txn_type = "income" if amount >= 0 else "expense"

            transactions.append({
                "date": txn.date.date() if hasattr(txn.date, "date") else txn.date,
                "description": (txn.memo or txn.payee or txn.type or "").strip(),
                "amount": amount,
                "transaction_type": txn_type,
                "external_id": txn.id,  # FITID
                "source": "bank_statement",
            })

    return transactions
