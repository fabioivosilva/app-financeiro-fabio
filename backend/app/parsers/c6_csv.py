"""
Parser para fatura do C6 Bank em formato CSV.
Colunas: Data de Compra;Nome no Cartão;Final do Cartão;Categoria;Descrição;Parcela;Valor (em US$);Cotação (em R$);Valor (em R$)
Separador: ponto-e-vírgula. Encoding: UTF-8 com ou sem BOM, ou Latin-1.
"""
import csv
import io
import re
from datetime import date, datetime
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

_INSTALLMENT_RE = re.compile(r"^(\d+)/(\d+)$")


def _decode(content: bytes) -> str:
    try:
        return content.decode("utf-8-sig")
    except (UnicodeDecodeError, ValueError):
        return content.decode("latin-1")


def _parse_br_amount(s: str) -> float:
    """Converte valor BR (1.234,56 ou -1234,56) → float."""
    s = s.strip()
    negative = s.startswith("-")
    s = s.lstrip("-").strip()
    if re.search(r",\d{1,2}$", s):
        val = float(s.replace(".", "").replace(",", "."))
    else:
        val = float(s.replace(",", ""))
    return -val if negative else val


def _has_c6_headers(first_line: str) -> bool:
    low = first_line.lower()
    return "data de compra" in low and ("final do cart" in low) and "valor (em r$)" in low


class C6CSVParser(BaseParser):
    bank_id = "c6"

    def can_parse(self, filename: str, content: bytes) -> float:
        if not filename.lower().endswith(".csv"):
            return 0.0
        try:
            text = _decode(content[:1024])
            first = text.split("\n")[0]
            if _has_c6_headers(first):
                return 0.97
        except Exception:
            pass
        fname = filename.lower()
        if "c6" in fname or "fatura_" in fname:
            return 0.60
        return 0.0

    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        result = ImportResult(bank="C6 Bank", format="CSV")
        text = _decode(content)

        try:
            reader = csv.DictReader(io.StringIO(text), delimiter=";")
            for row in reader:
                row_n = {k.lower().strip(): v.strip() for k, v in row.items() if k}

                date_str = row_n.get("data de compra", "")
                desc = (row_n.get("descrição") or row_n.get("descricao") or "").strip()
                amount_str = row_n.get("valor (em r$)", "")
                card_str = (row_n.get("final do cartão") or row_n.get("final do cartao") or "")
                parcela_str = row_n.get("parcela", "")

                if not date_str or not amount_str:
                    continue

                try:
                    tx_date = datetime.strptime(date_str, "%d/%m/%Y").date()
                    amount_raw = _parse_br_amount(amount_str)
                except (ValueError, TypeError) as e:
                    result.warnings.append(f"Linha ignorada: {e}")
                    continue

                inst_cur = inst_total = None
                m = _INSTALLMENT_RE.match(parcela_str)
                if m:
                    inst_cur = int(m.group(1))
                    inst_total = int(m.group(2))

                # Compras são débitos (positivo no CSV → negativo no sistema)
                # Pagamentos/estornos são negativos no CSV → positivo no sistema
                amount = amount_raw if amount_raw < 0 else -amount_raw
                origin = "Crédito" if amount > 0 else "Débito"
                if "pix" in desc.lower():
                    origin = "PIX"

                result.transactions.append(ParsedTransaction(
                    date=tx_date,
                    description=desc,
                    amount=amount,
                    origin=origin,
                    installment_current=inst_cur,
                    installment_total=inst_total,
                    raw={"card_last4": card_str, "bank_category": row_n.get("categoria", "")},
                ))

                if result.period_start is None or tx_date < result.period_start:
                    result.period_start = tx_date
                if result.period_end is None or tx_date > result.period_end:
                    result.period_end = tx_date

        except Exception as e:
            result.errors.append(f"Falha ao parsear CSV C6: {e}")

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada.")
        return result
