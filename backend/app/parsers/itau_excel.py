"""
Parser para fatura Itaú em formato .xls (Excel).
Detecta seções por cartão (final XXXX), extrai parcelas do campo descrição.
"""
import re
import io
from datetime import date, datetime
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

_DATE_RE = re.compile(r"^\d{2}/\d{2}/\d{4}$")
_CARD_RE = re.compile(r"final\s+(\d{4})", re.IGNORECASE)
_INSTALLMENT_RE = re.compile(r"\s+(\d{2})/(\d{2})\s*$")


def _parse_date(s: str) -> date | None:
    try:
        return datetime.strptime(s.strip(), "%d/%m/%Y").date()
    except Exception:
        return None


def _parse_installment(desc: str) -> tuple[str, int | None, int | None]:
    """Extrai parcela do final da descrição. Ex: 'Amazon Br  03/05' → ('Amazon Br', 3, 5)"""
    m = _INSTALLMENT_RE.search(desc)
    if m:
        cur, total = int(m.group(1)), int(m.group(2))
        clean = desc[:m.start()].strip()
        return clean, cur, total
    return desc.strip(), None, None


class ItauExcelParser(BaseParser):
    bank_id = "itau"

    def can_parse(self, filename: str, content: bytes) -> float:
        fname = filename.lower()
        if not (fname.endswith(".xls") or fname.endswith(".xlsx")):
            return 0.0
        # Detecta assinatura Itaú no conteúdo binário
        # Aumentamos o sample para 16KB para garantir que pegamos o texto em arquivos .xls grandes
        sample = content[:16384].lower()
        if b"ita" in sample or b"fatura" in sample or b"itau" in sample:
            return 0.85
        
        # Se for .xls ou .xlsx mas sem marca óbvia do Itaú, ainda damos score 0.3
        # para vencer o GenericCSV (que só aceita .csv)
        return 0.3

    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        result = ImportResult(bank="Itaú", format="Excel")

        try:
            rows = self._read_rows(filename, content)
        except Exception as e:
            result.errors.append(f"Falha ao abrir arquivo: {e}")
            return result

        current_card: str | None = None

        for row in rows:
            col0 = str(row[0]).strip() if row[0] is not None else ""
            col1 = str(row[1]).strip() if len(row) > 1 and row[1] is not None else ""
            col3 = row[3] if len(row) > 3 else None

            # Detecta header de seção de cartão
            card_match = _CARD_RE.search(col0 + " " + col1)
            if card_match and not _DATE_RE.match(col0):
                current_card = card_match.group(1)
                continue

            # Linha de transação: col0 é data, col3 é valor numérico
            if not _DATE_RE.match(col0):
                continue
            if col3 is None or col1 == "lançamento":
                continue

            tx_date = _parse_date(col0)
            if tx_date is None:
                result.warnings.append(f"Data inválida ignorada: {col0}")
                continue

            try:
                amount = float(col3)
            except (TypeError, ValueError):
                result.warnings.append(f"Valor inválido ignorado: {col3}")
                continue

            desc, inst_cur, inst_total = _parse_installment(col1)

            # Fatura de cartão: valores positivos = despesas (invertemos para negativo)
            # Valores negativos = créditos/estornos (mantemos como positivo)
            normalized_amount = -amount if amount > 0 else abs(amount)

            parsed = ParsedTransaction(
                date=tx_date,
                description=desc,
                amount=normalized_amount,
                origin="Crédito",
                installment_current=inst_cur,
                installment_total=inst_total,
                raw={"card_last4": current_card, "raw_amount": amount},
            )
            result.transactions.append(parsed)

            if result.period_start is None or tx_date < result.period_start:
                result.period_start = tx_date
            if result.period_end is None or tx_date > result.period_end:
                result.period_end = tx_date

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada no arquivo.")

        return result

    def _read_rows(self, filename: str, content: bytes) -> list[list]:
        """Lê linhas do .xls ou .xlsx e retorna lista de linhas (valores)."""
        fname = filename.lower()
        if fname.endswith(".xlsx"):
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            ws = wb.active
            return [list(row) for row in ws.iter_rows(values_only=True)]
        else:
            import xlrd
            wb = xlrd.open_workbook(file_contents=content)
            ws = wb.sheet_by_index(0)
            return [ws.row_values(i) for i in range(ws.nrows)]
