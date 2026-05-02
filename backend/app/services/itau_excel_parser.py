"""
Itau credit card Excel parser.

Supports the legacy BIFF8 .xls export used by Itau and a small .xlsx fallback
using only the Python standard library.
"""
from __future__ import annotations

import io
import re
import struct
import unicodedata
import zipfile
from datetime import date, datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional, Tuple
from xml.etree import ElementTree


_CARD_SECTION_PATTERN = re.compile(r"\bfinal\s+(\d{4})\b", re.IGNORECASE)
_INSTALLMENT_PATTERN = re.compile(r"(\d{2})/(\d{2})\s*$")
_DATE_PATTERN = re.compile(r"^\d{2}/\d{2}/\d{4}$")
_OLE_HEADER = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"


class ItauExcelParseError(ValueError):
    """Raised when the Itau Excel statement cannot be parsed."""


def parse_itau_excel(file_content: bytes) -> List[Dict[str, Any]]:
    """
    Parse an Itau credit card Excel statement.

    Returns list of transaction dicts compatible with the PDF parser:
        - date: date
        - description: str
        - amount: float (negative = purchase, positive = credit/refund)
        - transaction_type: 'expense'
        - source: 'credit_card'
        - card_last_digits: str or None
        - installment_current: int or None
        - installment_total: int or None
    """
    if file_content.startswith(b"PK"):
        rows = _parse_xlsx_rows(file_content)
    else:
        workbook = _extract_workbook_stream(file_content)
        rows = _parse_biff_rows(workbook)

    return _rows_to_transactions(rows)


def _rows_to_transactions(rows: Dict[int, Dict[int, Any]]) -> List[Dict[str, Any]]:
    transactions: List[Dict[str, Any]] = []
    current_card_digits: Optional[str] = None

    for row_idx in sorted(rows):
        row = rows[row_idx]
        first = _cell_text(row.get(0))
        second = _cell_text(row.get(1))
        normalized_first = _normalize(first)
        normalized_second = _normalize(second)

        if not any(_cell_text(value) for value in row.values()):
            continue

        card_match = _CARD_SECTION_PATTERN.search(first)
        if card_match:
            current_card_digits = card_match.group(1)
            continue

        if "encargos e servicos" in normalized_first:
            current_card_digits = None
            continue

        if _is_non_transaction_row(normalized_first, normalized_second):
            continue

        transaction_date = _parse_date_cell(row.get(0))
        if not transaction_date:
            continue

        description = second.strip()
        if not description:
            continue

        amount = _parse_amount_cell(row)
        if amount is None or amount == 0:
            continue

        description, inst_current, inst_total = _extract_installment(description)

        transactions.append({
            "date": transaction_date,
            "description": description,
            "amount": -amount,
            "transaction_type": "expense",
            "source": "credit_card",
            "card_last_digits": current_card_digits,
            "installment_current": inst_current,
            "installment_total": inst_total,
        })

    return transactions


def _extract_workbook_stream(file_content: bytes) -> bytes:
    if not file_content.startswith(_OLE_HEADER):
        return file_content

    try:
        return _extract_cfb_stream(file_content, {"Workbook", "Book"})
    except Exception as exc:
        raise ItauExcelParseError("Failed to read Excel workbook stream") from exc


def _extract_cfb_stream(file_content: bytes, stream_names: set[str]) -> bytes:
    if len(file_content) < 512:
        raise ItauExcelParseError("Invalid OLE file")

    sector_size = 1 << struct.unpack_from("<H", file_content, 30)[0]
    mini_sector_size = 1 << struct.unpack_from("<H", file_content, 32)[0]
    mini_cutoff = struct.unpack_from("<I", file_content, 56)[0]
    first_dir_sector = struct.unpack_from("<I", file_content, 48)[0]
    first_minifat_sector = struct.unpack_from("<I", file_content, 60)[0]
    num_minifat_sectors = struct.unpack_from("<I", file_content, 64)[0]
    difat_entries = [
        entry for entry in struct.unpack_from("<109I", file_content, 76)
        if entry not in (0xFFFFFFFF, 0xFFFFFFFE)
    ]

    fat: List[int] = []
    for sector in difat_entries:
        sector_data = _read_sector(file_content, sector, sector_size)
        fat.extend(struct.unpack("<" + "I" * (sector_size // 4), sector_data))

    def read_chain(start_sector: int, use_fat: List[int], size: int) -> bytes:
        if start_sector in (0xFFFFFFFF, 0xFFFFFFFE):
            return b""
        chunks = []
        sector = start_sector
        seen = set()
        while sector not in (0xFFFFFFFF, 0xFFFFFFFE):
            if sector in seen or sector >= len(use_fat):
                break
            seen.add(sector)
            chunks.append(_read_sector(file_content, sector, size))
            sector = use_fat[sector]
        return b"".join(chunks)

    directory = read_chain(first_dir_sector, fat, sector_size)
    entries = []
    root_entry = None
    for pos in range(0, len(directory), 128):
        entry = directory[pos:pos + 128]
        if len(entry) < 128:
            continue
        name_len = struct.unpack_from("<H", entry, 64)[0]
        if name_len < 2:
            continue
        name = entry[:name_len - 2].decode("utf-16le", errors="ignore")
        obj_type = entry[66]
        start_sector = struct.unpack_from("<I", entry, 116)[0]
        stream_size = struct.unpack_from("<Q", entry, 120)[0]
        entries.append((name, obj_type, start_sector, stream_size))
        if obj_type == 5:
            root_entry = (name, obj_type, start_sector, stream_size)

    workbook_entry = next((entry for entry in entries if entry[0] in stream_names), None)
    if not workbook_entry:
        raise ItauExcelParseError("Workbook stream not found")

    _, _, start_sector, stream_size = workbook_entry
    if stream_size < mini_cutoff and root_entry:
        minifat = []
        if num_minifat_sectors:
            minifat_data = read_chain(first_minifat_sector, fat, sector_size)
            minifat = list(struct.unpack("<" + "I" * (len(minifat_data) // 4), minifat_data))
        root_stream = read_chain(root_entry[2], fat, sector_size)
        stream = _read_ministream(root_stream, start_sector, minifat, mini_sector_size)
    else:
        stream = read_chain(start_sector, fat, sector_size)

    return stream[:stream_size]


def _read_sector(file_content: bytes, sector: int, sector_size: int) -> bytes:
    offset = (sector + 1) * sector_size
    return file_content[offset:offset + sector_size]


def _read_ministream(root_stream: bytes, start_sector: int, minifat: List[int], mini_sector_size: int) -> bytes:
    chunks = []
    sector = start_sector
    seen = set()
    while sector not in (0xFFFFFFFF, 0xFFFFFFFE):
        if sector in seen or sector >= len(minifat):
            break
        seen.add(sector)
        offset = sector * mini_sector_size
        chunks.append(root_stream[offset:offset + mini_sector_size])
        sector = minifat[sector]
    return b"".join(chunks)


def _parse_biff_rows(workbook: bytes) -> Dict[int, Dict[int, Any]]:
    start = workbook.find(b"\x09\x08")
    if start < 0:
        raise ItauExcelParseError("BIFF workbook header not found")

    shared_strings = _parse_shared_strings(workbook, start)
    rows: Dict[int, Dict[int, Any]] = {}
    in_sheet = False

    for _, record_id, payload in _iter_biff_records(workbook, start):
        if record_id == 0x0809:
            record_type = struct.unpack_from("<H", payload, 2)[0] if len(payload) >= 4 else None
            in_sheet = record_type == 0x0010
            continue

        if in_sheet and record_id == 0x000A:
            break
        if not in_sheet:
            continue

        if record_id == 0x00FD and len(payload) >= 10:
            row, col, _, string_index = struct.unpack_from("<HHHI", payload, 0)
            value = shared_strings[string_index] if string_index < len(shared_strings) else ""
            rows.setdefault(row, {})[col] = value
        elif record_id == 0x0203 and len(payload) >= 14:
            row, col, _ = struct.unpack_from("<HHH", payload, 0)
            value = struct.unpack_from("<d", payload, 6)[0]
            rows.setdefault(row, {})[col] = value

    return rows


def _iter_biff_records(data: bytes, start: int) -> Iterable[Tuple[int, int, bytes]]:
    pos = start
    while pos + 4 <= len(data):
        record_id, length = struct.unpack_from("<HH", data, pos)
        payload_start = pos + 4
        payload_end = payload_start + length
        if payload_end > len(data):
            break
        yield pos, record_id, data[payload_start:payload_end]
        pos = payload_end


def _parse_shared_strings(workbook: bytes, start: int) -> List[str]:
    for pos, record_id, payload in _iter_biff_records(workbook, start):
        if record_id != 0x00FC:
            continue

        continuation_pos = pos + 4 + len(payload)
        chunks = [payload]
        while continuation_pos + 4 <= len(workbook):
            next_id, next_len = struct.unpack_from("<HH", workbook, continuation_pos)
            if next_id != 0x003C:
                break
            chunks.append(workbook[continuation_pos + 4:continuation_pos + 4 + next_len])
            continuation_pos += 4 + next_len

        sst_data = b"".join(chunks)
        if len(sst_data) < 8:
            return []
        _, unique_count = struct.unpack_from("<II", sst_data, 0)
        strings: List[str] = []
        offset = 8
        for _ in range(unique_count):
            value, offset = _read_biff_string(sst_data, offset)
            strings.append(value)
        return strings
    return []


def _read_biff_string(data: bytes, offset: int) -> Tuple[str, int]:
    char_count = struct.unpack_from("<H", data, offset)[0]
    offset += 2
    flags = data[offset]
    offset += 1
    is_16bit = bool(flags & 0x01)
    has_phonetic = bool(flags & 0x04)
    has_rich_text = bool(flags & 0x08)

    rich_runs = 0
    if has_rich_text:
        rich_runs = struct.unpack_from("<H", data, offset)[0]
        offset += 2

    phonetic_size = 0
    if has_phonetic:
        phonetic_size = struct.unpack_from("<I", data, offset)[0]
        offset += 4

    byte_count = char_count * (2 if is_16bit else 1)
    raw = data[offset:offset + byte_count]
    offset += byte_count
    offset += rich_runs * 4
    offset += phonetic_size

    encoding = "utf-16le" if is_16bit else "latin1"
    return raw.decode(encoding, errors="replace"), offset


def _parse_xlsx_rows(file_content: bytes) -> Dict[int, Dict[int, Any]]:
    with zipfile.ZipFile(io.BytesIO(file_content)) as workbook_zip:
        shared_strings = _read_xlsx_shared_strings(workbook_zip)
        sheet_name = _first_sheet_name(workbook_zip)
        sheet_xml = workbook_zip.read(sheet_name)

    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    root = ElementTree.fromstring(sheet_xml)
    rows: Dict[int, Dict[int, Any]] = {}

    for row in root.findall(".//x:sheetData/x:row", ns):
        row_number = int(row.attrib.get("r", "1")) - 1
        for cell in row.findall("x:c", ns):
            cell_ref = cell.attrib.get("r", "")
            col = _column_index(cell_ref)
            value = _read_xlsx_cell(cell, shared_strings, ns)
            rows.setdefault(row_number, {})[col] = value

    return rows


def _read_xlsx_shared_strings(workbook_zip: zipfile.ZipFile) -> List[str]:
    try:
        data = workbook_zip.read("xl/sharedStrings.xml")
    except KeyError:
        return []

    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    root = ElementTree.fromstring(data)
    strings = []
    for item in root.findall("x:si", ns):
        strings.append("".join(text.text or "" for text in item.findall(".//x:t", ns)))
    return strings


def _first_sheet_name(workbook_zip: zipfile.ZipFile) -> str:
    names = workbook_zip.namelist()
    worksheets = sorted(name for name in names if name.startswith("xl/worksheets/sheet") and name.endswith(".xml"))
    if not worksheets:
        raise ItauExcelParseError("No worksheet found in xlsx file")
    return worksheets[0]


def _read_xlsx_cell(cell: ElementTree.Element, shared_strings: List[str], ns: Dict[str, str]) -> Any:
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        return "".join(text.text or "" for text in cell.findall(".//x:t", ns))

    value_node = cell.find("x:v", ns)
    if value_node is None or value_node.text is None:
        return ""

    raw_value = value_node.text
    if cell_type == "s":
        index = int(raw_value)
        return shared_strings[index] if index < len(shared_strings) else ""

    try:
        return float(raw_value)
    except ValueError:
        return raw_value


def _column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    value = 0
    for letter in letters:
        value = value * 26 + ord(letter.upper()) - ord("A") + 1
    return max(value - 1, 0)


def _parse_date_cell(value: Any) -> Optional[date]:
    if isinstance(value, date):
        return value
    if isinstance(value, (int, float)) and value > 20000:
        return date(1899, 12, 30) + timedelta(days=float(value))

    text = _cell_text(value)
    if not _DATE_PATTERN.match(text):
        return None
    try:
        return datetime.strptime(text, "%d/%m/%Y").date()
    except ValueError:
        return None


def _parse_amount_cell(row: Dict[int, Any]) -> Optional[float]:
    candidates = [row.get(3), row.get(2)]
    candidates.extend(value for col, value in sorted(row.items(), reverse=True) if col not in (0, 1, 2, 3))

    for value in candidates:
        if isinstance(value, (int, float)):
            return float(value)
        text = _cell_text(value)
        if not text:
            continue
        parsed = _parse_amount_text(text)
        if parsed is not None:
            return parsed
    return None


def _parse_amount_text(text: str) -> Optional[float]:
    normalized = text.replace("R$", "").replace(" ", "").strip()
    if not normalized:
        return None
    normalized = normalized.replace(".", "").replace(",", ".")
    try:
        return float(normalized)
    except ValueError:
        return None


def _extract_installment(description: str) -> Tuple[str, Optional[int], Optional[int]]:
    match = _INSTALLMENT_PATTERN.search(description)
    if not match:
        return description, None, None
    clean_desc = description[:match.start()].strip()
    return clean_desc, int(match.group(1)), int(match.group(2))


def _is_non_transaction_row(first: str, second: str) -> bool:
    if first in {"data", ""}:
        return True
    if first.startswith("total"):
        return True
    if second in {"lancamento", ""}:
        return True
    if second.startswith("pagamento efetuado"):
        return True
    return False


def _cell_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def _normalize(text: str) -> str:
    clean = unicodedata.normalize("NFKD", text)
    clean = "".join(ch for ch in clean if not unicodedata.combining(ch))
    return re.sub(r"\s+", " ", clean).strip().lower()
