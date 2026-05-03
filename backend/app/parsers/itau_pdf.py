"""
Parser para fatura Itaú em formato PDF.
Extrai texto via pdfplumber, identifica seções por cartão e pessoa.
"""
import re
import io
from datetime import date
from app.parsers.base import BaseParser, ImportResult, ParsedTransaction

_MONTHS_PT = {
    "jan": 1, "fev": 2, "mar": 3, "abr": 4, "mai": 5, "jun": 6,
    "jul": 7, "ago": 8, "set": 9, "out": 10, "nov": 11, "dez": 12,
}

# "23 / abr Hot Beach Resort 01/10 R$ 479,42"
# "07 / mar Mercadolivre*mercadol - R$ 0,01"
_TX_RE = re.compile(
    r"^(\d{2})\s*/\s*(\w{3})\s+(.+?)\s+(-\s*)?R\$\s*([\d.,]+)\s*$",
    re.IGNORECASE,
)

# Parcela no final da descrição: "Amazon Br 05/06" → (5, 6)
_INSTALLMENT_RE = re.compile(r"\s+(\d{2})/(\d{2})\s*$")

# Seção de cartão: "fabio ivo silva - final 5761 (titular)"
_CARD_RE = re.compile(r"final\s+(\d{4})", re.IGNORECASE)

# Mês da fatura: "fatura de\nmais" ou "fatura de maio"
_FATURA_MES_RE = re.compile(r"fatura\s+de\s+(\w+)", re.IGNORECASE)

# Emissão do documento: "emitido em 02/05/2026"
_EMITIDO_RE = re.compile(r"emitido\s+em\s+(\d{2}/\d{2}/\d{4})", re.IGNORECASE)

# Linhas a ignorar
_SKIP_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r"^data\s+lan[çc]amento",
        r"^total\s+(nacional|internacional|da\s+fatura|do\s+cart)",
        r"^lan[çc]amentos\s+(nacionais|internacionais)",
        r"^fatura\s+(de|cadastrada|anterior)",
        r"^emitido\s+em",
        r"pagamento\s+efetuado",
        r"^\s*$",
    ]
]


def _should_skip(line: str) -> bool:
    for pat in _SKIP_PATTERNS:
        if pat.search(line):
            return True
    return False


def _parse_amount(value_str: str) -> float:
    """Converte 'R$ 1.234,56' → 1234.56"""
    return float(value_str.replace(".", "").replace(",", "."))


def _infer_year(month_num: int, fatura_month: int, fatura_year: int) -> int:
    """
    Faturas de cartão cobrem múltiplos meses de parcelas.
    Se o mês da transação é posterior ao mês da fatura → ano anterior.
    """
    if month_num > fatura_month:
        return fatura_year - 1
    return fatura_year


class ItauPDFParser(BaseParser):
    bank_id = "itau"

    def can_parse(self, filename: str, content: bytes) -> float:
        if not filename.lower().endswith(".pdf"):
            return 0.0
        try:
            import pdfplumber
            pdf = pdfplumber.open(io.BytesIO(content))
            text = (pdf.pages[0].extract_text() or "").lower()
            keywords = ["fatura", "itau", "lançamentos", "lancamentos", "total da fatura"]
            hits = sum(1 for kw in keywords if kw in text)
            if hits >= 2:
                return 0.90
            if hits >= 1:
                return 0.50
            return 0.15
        except Exception as e:
            # PDF criptografado: ainda pode ser um PDF Itaú — retorna score médio
            msg = str(e).lower()
            if any(w in msg for w in ("password", "encrypt", "decrypt", "incorrect")):
                return 0.80
            return 0.0

    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        result = ImportResult(bank="Itaú", format="PDF")

        try:
            import pdfplumber
            pdf = pdfplumber.open(io.BytesIO(content), password=password or "")
            all_lines = []
            for page in pdf.pages:
                text = page.extract_text() or ""
                all_lines.extend(text.split("\n"))
        except Exception as e:
            msg = str(e).lower()
            if any(w in msg for w in ("password", "encrypt", "decrypt", "incorrect")):
                result.errors.append("PDF_ENCRYPTED")
            else:
                result.errors.append(f"Falha ao abrir PDF: {e}")
            return result

        # Detectar mês/ano da fatura a partir do texto completo
        full_text = "\n".join(all_lines)
        fatura_year = 2026  # fallback
        fatura_month = 1

        emitido_match = _EMITIDO_RE.search(full_text)
        if emitido_match:
            parts = emitido_match.group(1).split("/")
            fatura_month = int(parts[1])
            fatura_year = int(parts[2])
        else:
            mes_match = _FATURA_MES_RE.search(full_text)
            if mes_match:
                mes_str = mes_match.group(1).lower()[:3]
                fatura_month = _MONTHS_PT.get(mes_str, 1)

        current_card: str | None = None

        for line in all_lines:
            line = line.strip()
            if not line:
                continue

            # Detecta seção de cartão
            card_match = _CARD_RE.search(line)
            if card_match and not _TX_RE.match(line):
                current_card = card_match.group(1)
                continue

            if _should_skip(line):
                continue

            # Tenta parsear como transação
            m = _TX_RE.match(line)
            if not m:
                continue

            day_str, month_str, desc_raw, credit_flag, value_str = m.groups()

            month_num = _MONTHS_PT.get(month_str.lower(), None)
            if month_num is None:
                result.warnings.append(f"Mês desconhecido ignorado: {month_str!r}")
                continue

            year = _infer_year(month_num, fatura_month, fatura_year)
            try:
                tx_date = date(year, month_num, int(day_str))
            except ValueError as e:
                result.warnings.append(f"Data inválida ignorada: {day_str}/{month_str}/{year} — {e}")
                continue

            amount = _parse_amount(value_str)
            is_credit = bool(credit_flag)

            # Extrai parcela da descrição
            inst_match = _INSTALLMENT_RE.search(desc_raw)
            inst_cur = inst_total = None
            desc = desc_raw
            if inst_match:
                inst_cur = int(inst_match.group(1))
                inst_total = int(inst_match.group(2))
                desc = desc_raw[:inst_match.start()].strip()

            # Fatura PDF: cobrança = negativo, crédito/estorno = positivo
            normalized = amount if is_credit else -amount

            parsed = ParsedTransaction(
                date=tx_date,
                description=desc.strip(),
                amount=normalized,
                origin="Crédito",
                installment_current=inst_cur,
                installment_total=inst_total,
                raw={"card_last4": current_card, "is_credit": is_credit},
            )
            result.transactions.append(parsed)

            if result.period_start is None or tx_date < result.period_start:
                result.period_start = tx_date
            if result.period_end is None or tx_date > result.period_end:
                result.period_end = tx_date

        if not result.transactions:
            result.warnings.append("Nenhuma transação encontrada no PDF.")

        return result
