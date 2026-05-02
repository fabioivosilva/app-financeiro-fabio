from __future__ import annotations

import hashlib
from datetime import date
from typing import Any, Mapping


def transaction_hash(item: Mapping[str, Any], parser: str) -> str:
    external_id = item.get("external_id")
    if external_id:
        raw = f"{parser}|external|{external_id}"
    else:
        raw_date = item.get("date")
        if isinstance(raw_date, date):
            date_value = raw_date.isoformat()
        else:
            date_value = str(raw_date)
        raw = "|".join(
            [
                parser,
                date_value,
                str(item.get("description", "")).strip().upper(),
                f"{float(item.get('amount', 0.0)):.2f}",
                str(item.get("source", "")),
                str(item.get("card_last_digits", "")),
            ]
        )
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()
