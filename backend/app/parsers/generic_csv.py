"""
Parser CSV genérico — fallback para bancos sem parser dedicado.
Detecta automaticamente colunas de data, descrição e valor por nome.
Score baixo (0.25-0.40) para nunca vencer parsers específicos.
"""
import csv
import io
import re
from datetime import date, datetime
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

_DATE_KEYS = {"data", "date", "dt", "data lancamento", "data lançamento", "data pagamento", "data movimento"}
_DESC_KEYS = {"descrição", "descricao", "description", "histórico", "historico",
              "memo", "estabelecimento", "titulo", "título", "detalhe"}
_AMOUNT_KEYS = {"valor", "value", "amount", "quantia", "montante", "debito",
                "crédito", "credito", "entrada/saída", "entrada/saida"}

_DATE_FMTS = ["%Y-%m-%d", "%d/%m/%Y", "%d/%m/%y", "%m/%d/%Y"]


def _decode(content: bytes) -> str:
    try:
        return content.decode("utf-8-sig")
    except (UnicodeDecodeError, ValueError):
        return content.decode("latin-1")


def _parse_date(s: str) -> date | None:
    s = s.strip()
    for fmt in _DATE_FMTS:
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def _parse_amount(s: str) -> float:
    s = re.sub(r"[R$\s]", "", s).strip()
    # Formato BR: 1.234,56 ou 1234,56
    if re.search(r",\d{1,2}$", s):
        return float(s.replace(".", "").replace(",", "."))
    # Formato US: 1,234.56 ou 1234.56
    return float(s.replace(",", ""))


def _find_col(fields: list[str], keywords: set[str]) -> str | None:
    for f in fields:
        if f in keywords:
            return f
    return None


class GenericCSVParser(BaseParser):

    def can_parse(self, filename: str, content: bytes) -> float:
        if not filename.lower().endswith(".csv"):
            return 0.0
        try:
            text = _decode(content[:2048])
            lines = [l for l in text.split("\n") if l.strip()]
            if len(lines) < 2:
                return 0.0
            sep = ";" if text.count(";") > text.count(",") else ","
            headers = {h.strip().strip('"').lower() for h in lines[0].split(sep)}
            has_date = bool(_find_col(list(headers), _DATE_KEYS))
            has_desc = bool(_find_col(list(headers), _DESC_KEYS))
            has_amount = bool(_find_col(list(headers), _AMOUNT_KEYS))
            if has_date and has_desc and has_amount:
                return 0.40
            if has_date and (has_desc or has_amount):
                return 0.25
        except Exception:
            pass
        return 0.0

    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        result = ImportResult(bank="Genérico", format="CSV")
        text = _decode(content)

        sep = ";" if text.count(";") > text.count(",") else ","

        try:
            reader = csv.DictReader(io.StringIO(text), delimiter=sep)
            fields = [f.lower().strip() for f in (reader.fieldnames or [])]

            date_col = _find_col(fields, _DATE_KEYS)
            desc_col = _find_col(fields, _DESC_KEYS)
            amount_col = _find_col(fields, _AMOUNT_KEYS)

            if not date_col or not amount_col:
                result.errors.append("Não foi possível identificar colunas de data/valor.")
                return result

            for row in reader:
                row_n = {k.lower().strip(): v for k, v in row.items() if k}
                date_str = row_n.get(date_col, "").strip()
                desc = row_n.get(desc_col or "", "").strip() if desc_col else ""
                amount_str = row_n.get(amount_col, "").strip()

                if not date_str or not amount_str:
                    continue

                tx_date = _parse_date(date_str)
                if tx_date is None:
                    result.warnings.append(f"Data não reconhecida ignorada: {date_str!r}")
                    continue

                try:
                    amount = _parse_amount(amount_str)
                except (ValueError, TypeError):
                    result.warnings.append(f"Valor não reconhecido ignorado: {amount_str!r}")
                    continue

                origin = "PIX" if "pix" in desc.lower() else ("Crédito" if amount > 0 else "Débito")
                result.transactions.append(ParsedTransaction(
                    date=tx_date,
                    description=desc,
                    amount=amount,
                    origin=origin,
                ))

                if result.period_start is None or tx_date < result.period_start:
                    result.period_start = tx_date
                if result.period_end is None or tx_date > result.period_end:
                    result.period_end = tx_date

        except Exception as e:
            result.errors.append(f"Falha ao parsear CSV: {e}")

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada.")
        return result
