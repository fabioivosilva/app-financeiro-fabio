"""
Parser OFX genérico — funciona para qualquer banco que exporte OFX/QFX.
Testado com: Itaú conta corrente.
"""
import io
from datetime import date
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction


class OFXParser(BaseParser):

    def can_parse(self, filename: str, content: bytes) -> float:
        ext = filename.lower()
        if ext.endswith(".ofx") or ext.endswith(".qfx"):
            return 0.95
        # Detecta por conteúdo mesmo sem extensão correta
        sample = content[:512].upper()
        if b"OFXHEADER" in sample or b"<OFX>" in sample:
            return 0.80
        return 0.0

    def parse(self, filename: str, content: bytes) -> ImportResult:
        from ofxparse import OfxParser as LibOfxParser

        result = ImportResult(bank="Generic", format="OFX")

        try:
            ofx = LibOfxParser().parse(io.BytesIO(content))
        except Exception as e:
            result.errors.append(f"Falha ao parsear OFX: {e}")
            return result

        account = getattr(ofx, "account", None)
        if account:
            result.account = getattr(account, "account_id", None)
            institution = getattr(account, "institution", None)
            if institution:
                result.bank = getattr(institution, "organization", "Generic") or "Generic"

        # ofxparse: transações ficam em account.statement, não em ofx.statements
        statements = []
        if account and hasattr(account, "statement") and account.statement:
            statements = [account.statement]
        elif hasattr(ofx, "accounts"):
            for acc in (ofx.accounts or []):
                if hasattr(acc, "statement") and acc.statement:
                    statements.append(acc.statement)

        for stmt in statements:
            txs = getattr(stmt, "transactions", []) or []
            for tx in txs:
                raw_date = getattr(tx, "date", None)
                if raw_date is None:
                    continue
                tx_date = raw_date.date() if hasattr(raw_date, "date") else raw_date

                amount = float(getattr(tx, "amount", 0) or 0)
                desc = str(getattr(tx, "memo", "") or getattr(tx, "payee", "") or "")
                ext_id = str(getattr(tx, "id", "") or "")

                origin = "Débito" if amount < 0 else "Crédito"
                tx_type = str(getattr(tx, "type", "") or "").upper()
                if "TRANSFER" in tx_type or "PIX" in desc.upper():
                    origin = "PIX"

                parsed = ParsedTransaction(
                    date=tx_date,
                    description=desc.strip(),
                    amount=amount,
                    origin=origin,
                    external_id=ext_id if ext_id else None,
                )
                result.transactions.append(parsed)

                if result.period_start is None or tx_date < result.period_start:
                    result.period_start = tx_date
                if result.period_end is None or tx_date > result.period_end:
                    result.period_end = tx_date

        return result
