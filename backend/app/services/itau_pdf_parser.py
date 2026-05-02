"""
Itaú Credit Card PDF Parser.
Extracts transactions from Itaú credit card statements (fatura).

Uses pdfplumber to read the PDF and regex patterns to extract:
- Card holder sections (by card last digits)
- Individual transactions (date, description, amount)
- Installment info (e.g., "02/10")
"""
import re
import unicodedata
from datetime import date, datetime
from typing import List, Dict, Any, Optional, Tuple
import pdfplumber


# Regex patterns for Itaú PDF format
_DATE_PATTERN = re.compile(r"^(\d{2}/\d{2})\s+")
_AMOUNT_PATTERN = re.compile(r"([\d.,]+)\s*$")
_INSTALLMENT_PATTERN = re.compile(r"(\d{2})/(\d{2})\s*$")
_CARD_SECTION_PATTERN = re.compile(
    r"(?:cartão|cartao|cart[aã]o)\s+.*?final\s+(\d{4})",
    re.IGNORECASE,
)
_TOTAL_PATTERN = re.compile(
    r"(?:total|valor\s+da\s+fatura|total\s+da\s+fatura)",
    re.IGNORECASE,
)
_SKIP_PATTERNS = [
    re.compile(r"^pagamento\s+m[ií]nimo", re.IGNORECASE),
    re.compile(r"^cr[eé]dito\s+anterior", re.IGNORECASE),
    re.compile(r"^encargos", re.IGNORECASE),
    re.compile(r"^IOF", re.IGNORECASE),
    re.compile(r"^saldo\s+anterior", re.IGNORECASE),
    re.compile(r"^pagamento\s+efetuado", re.IGNORECASE),
    re.compile(r"^anuidade", re.IGNORECASE),
]


def _normalize_text(text: str) -> str:
    """Clean up text from PDF extraction."""
    # Replace multiple spaces with single
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _parse_amount(text: str) -> Optional[float]:
    """Extract amount from end of line. Returns negative (expense)."""
    match = _AMOUNT_PATTERN.search(text)
    if not match:
        return None
    raw = match.group(1).strip()
    # Handle Brazilian number format: 1.234,56 → 1234.56
    raw = raw.replace(".", "").replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def _parse_date(text: str, reference_year: int, reference_month: int) -> Optional[date]:
    """
    Parse DD/MM from transaction line.
    Uses reference year from statement. Handles Dec→Jan transition.
    """
    match = _DATE_PATTERN.search(text)
    if not match:
        return None
    day_month = match.group(1)
    try:
        day, month = map(int, day_month.split("/"))
        year = reference_year
        # If statement is Jan but transaction is Dec, use previous year
        if reference_month <= 2 and month >= 11:
            year -= 1
        # If statement is Dec but transaction is Jan, use next year
        if reference_month >= 11 and month <= 2:
            year += 1
        return date(year, month, day)
    except (ValueError, TypeError):
        return None


def _extract_installment(description: str) -> Tuple[str, Optional[int], Optional[int]]:
    """
    Extract installment info from description.
    E.g., "LOJA XYZ 02/10" → ("LOJA XYZ", 2, 10)
    """
    match = _INSTALLMENT_PATTERN.search(description)
    if match:
        current = int(match.group(1))
        total = int(match.group(2))
        clean_desc = description[:match.start()].strip()
        return clean_desc, current, total
    return description, None, None


def _should_skip_line(text: str) -> bool:
    """Check if line should be skipped (totals, headers, etc.)."""
    for pattern in _SKIP_PATTERNS:
        if pattern.search(text):
            return True
    if _TOTAL_PATTERN.search(text):
        return True
    return False


def _detect_reference_date(full_text: str) -> Tuple[int, int]:
    """
    Try to detect the statement reference year and month.
    Looks for patterns like "vencimento 10/11/2026" or "NOV/2026".
    """
    # Try "vencimento DD/MM/YYYY"
    venc = re.search(r"vencimento[:\s]+(\d{2})/(\d{2})/(\d{4})", full_text, re.IGNORECASE)
    if venc:
        return int(venc.group(3)), int(venc.group(2))

    # Try "MMM/YYYY" or "MES YYYY"
    months_pt = {
        "jan": 1, "fev": 2, "mar": 3, "abr": 4, "mai": 5, "jun": 6,
        "jul": 7, "ago": 8, "set": 9, "out": 10, "nov": 11, "dez": 12,
    }
    for abbr, m in months_pt.items():
        pattern = re.compile(rf"{abbr}\w*[/\s]+(\d{{4}})", re.IGNORECASE)
        match = pattern.search(full_text)
        if match:
            return int(match.group(1)), m

    # Fallback: current date
    now = datetime.now()
    return now.year, now.month


def parse_itau_pdf(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Parse an Itaú credit card PDF statement.

    Returns list of transaction dicts:
        - date: date
        - description: str
        - amount: float (negative = expense)
        - transaction_type: 'expense'
        - source: 'credit_card'
        - card_last_digits: str or None
        - installment_current: int or None
        - installment_total: int or None
    """
    import io

    transactions = []
    current_card_digits = None

    with pdfplumber.open(io.BytesIO(file_content)) as pdf:
        # Detect reference date from first pages
        full_text_sample = ""
        for page in pdf.pages[:3]:
            full_text_sample += (page.extract_text() or "") + "\n"

        ref_year, ref_month = _detect_reference_date(full_text_sample)

        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            lines = text.split("\n")

            for line in lines:
                line = _normalize_text(line)
                if not line or len(line) < 5:
                    continue

                # Check for card section header
                card_match = _CARD_SECTION_PATTERN.search(line)
                if card_match:
                    current_card_digits = card_match.group(1)
                    continue

                # Skip non-transaction lines
                if _should_skip_line(line):
                    continue

                # Try to parse as transaction (must start with date)
                txn_date = _parse_date(line, ref_year, ref_month)
                if not txn_date:
                    continue

                # Extract amount from end of line
                amount = _parse_amount(line)
                if amount is None or amount == 0:
                    continue

                # Extract description (between date and amount)
                desc_start = _DATE_PATTERN.search(line).end()
                desc_end = _AMOUNT_PATTERN.search(line).start()
                description = line[desc_start:desc_end].strip()

                if not description:
                    continue

                # Extract installment info
                description, inst_current, inst_total = _extract_installment(description)

                transactions.append({
                    "date": txn_date,
                    "description": description,
                    "amount": -abs(amount),  # Credit card = always expense (negative)
                    "transaction_type": "expense",
                    "source": "credit_card",
                    "card_last_digits": current_card_digits,
                    "installment_current": inst_current,
                    "installment_total": inst_total,
                })

    return transactions
