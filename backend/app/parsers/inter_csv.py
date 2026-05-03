"""
Parser para extratos do Banco Inter (conta corrente).
Formato: CSV separado por ponto-e-vírgula exportado pelo app/internet banking.
Colunas esperadas: Data Lançamento;Histórico;Valor;Saldo
"""
import csv
import io
from datetime import date, datetime
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

_HEADER_KEYWORDS = {"histórico", "historico", "lançamento", "lancamento"}


class InterCSVParser(BaseParser):

    def can_parse(self, filename: str, content: bytes) -> float:
        fname = filename.lower()
        if not fname.endswith(".csv"):
            return 0.0
        if "inter" in fname:
            return 0.92
        try:
            text = content[:2048].decode("utf-8", errors="replace")
            first = text.split("\n")[0].lower()
            if ";" in first and any(kw in first for kw in _HEADER_KEYWORDS):
                return 0.82
        except Exception:
            pass
        return 0.0

    def parse(self, filename: str, content: bytes) -> ImportResult:
        result = ImportResult(bank="Inter", format="CSV")
        try:
            text = content.decode("utf-8", errors="replace")
        except Exception as e:
            result.errors.append(f"Falha ao decodificar: {e}")
            return result

        try:
            reader = csv.DictReader(io.StringIO(text), delimiter=";")
            for row in reader:
                row_n = {k.lower().strip(): v.strip() for k, v in row.items() if k}

                date_str = (
                    row_n.get("data lançamento")
                    or row_n.get("data lancamento")
                    or row_n.get("data", "")
                ).strip()
                desc = (
                    row_n.get("histórico")
                    or row_n.get("historico")
                    or row_n.get("descrição", "")
                ).strip()
                amount_str = row_n.get("valor", "0").replace(".", "").replace(",", ".")

                if not date_str or not desc:
                    continue

                try:
                    tx_date = datetime.strptime(date_str, "%d/%m/%Y").date()
                    amount = float(amount_str)
                except (ValueError, TypeError) as e:
                    result.warnings.append(f"Linha ignorada: {e}")
                    continue

                origin = _detect_origin(desc, amount)
                result.transactions.append(ParsedTransaction(
                    date=tx_date,
                    description=desc,
                    amount=amount,
                    origin=origin,
                ))
                _update_period(result, tx_date)

        except Exception as e:
            result.errors.append(f"Falha ao parsear CSV: {e}")

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada.")
        return result


def _detect_origin(desc: str, amount: float) -> str:
    dl = desc.lower()
    if "pix" in dl:
        return "PIX"
    return "Crédito" if amount > 0 else "Débito"


def _update_period(result: ImportResult, tx_date: date) -> None:
    if result.period_start is None or tx_date < result.period_start:
        result.period_start = tx_date
    if result.period_end is None or tx_date > result.period_end:
        result.period_end = tx_date
