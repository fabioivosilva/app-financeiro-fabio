"""
Parser para extratos do Nubank.
Suporta dois formatos exportados pelo app:
  - Cartão de crédito: date,title,amount  (algumas versões usam 'description' no lugar de 'title')
  - Conta corrente:    Data,Valor,Identificador,Descrição (pt-BR, dd/mm/yyyy)
"""
import csv
import io
from datetime import date, datetime
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

# Nubank crédito: obrigatórios date + amount; desc pode ser 'title' ou 'description'
_CREDIT_REQUIRED = {"date", "amount"}
_CREDIT_DESC_COLS = ["title", "description"]
_ACCOUNT_HEADERS = {"data", "valor", "identificador"}


def _decode(content: bytes) -> str:
    try:
        return content.decode("utf-8-sig")
    except (UnicodeDecodeError, ValueError):
        return content.decode("latin-1")


class NubankCSVParser(BaseParser):

    def can_parse(self, filename: str, content: bytes) -> float:
        if not filename.lower().endswith(".csv"):
            return 0.0
        if "nubank" in filename.lower():
            return 0.95
        try:
            text = _decode(content[:2048])
            first = {h.strip().strip('"').lower() for h in text.split("\n")[0].split(",")}
            # crédito: date + amount + (title ou description)
            if _CREDIT_REQUIRED.issubset(first) and (first & set(_CREDIT_DESC_COLS)):
                return 0.85
            if _ACCOUNT_HEADERS.issubset(first):
                return 0.80
        except Exception:
            pass
        return 0.0

    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        result = ImportResult(bank="Nubank", format="CSV")
        text = _decode(content)

        try:
            reader = csv.DictReader(io.StringIO(text))
            headers = {h.lower().strip() for h in (reader.fieldnames or [])}
            if _CREDIT_REQUIRED.issubset(headers):
                self._parse_credit(result, reader, headers)
            elif _ACCOUNT_HEADERS.issubset(headers):
                self._parse_account(result, reader)
            else:
                result.errors.append("Formato CSV Nubank não reconhecido.")
        except Exception as e:
            result.errors.append(f"Falha ao parsear CSV: {e}")

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada.")
        return result

    def _parse_credit(self, result: ImportResult, reader: csv.DictReader, headers: set) -> None:
        desc_col = next((c for c in _CREDIT_DESC_COLS if c in headers), None)
        for row in reader:
            try:
                row_n = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                tx_date = datetime.strptime(row_n["date"], "%Y-%m-%d").date()
                desc = row_n.get(desc_col or "", "") if desc_col else ""
                amount = float(row_n["amount"])
                result.transactions.append(ParsedTransaction(
                    date=tx_date,
                    description=desc,
                    amount=amount,
                    origin="Crédito",
                ))
                _update_period(result, tx_date)
            except Exception as e:
                result.warnings.append(f"Linha ignorada: {e}")

    def _parse_account(self, result: ImportResult, reader: csv.DictReader) -> None:
        for row in reader:
            try:
                row_n = {k.lower().strip(): v.strip() for k, v in row.items() if k}
                tx_date = datetime.strptime(row_n.get("data", ""), "%d/%m/%Y").date()
                desc = row_n.get("descrição", row_n.get("descricao", ""))
                amount_str = row_n.get("valor", "0").replace(".", "").replace(",", ".")
                amount = float(amount_str)
                origin = _detect_origin(desc, amount)
                result.transactions.append(ParsedTransaction(
                    date=tx_date,
                    description=desc,
                    amount=amount,
                    origin=origin,
                ))
                _update_period(result, tx_date)
            except Exception as e:
                result.warnings.append(f"Linha ignorada: {e}")


def _detect_origin(desc: str, amount: float) -> str:
    if "pix" in desc.lower():
        return "PIX"
    return "Crédito" if amount > 0 else "Débito"


def _update_period(result: ImportResult, tx_date: date) -> None:
    if result.period_start is None or tx_date < result.period_start:
        result.period_start = tx_date
    if result.period_end is None or tx_date > result.period_end:
        result.period_end = tx_date
