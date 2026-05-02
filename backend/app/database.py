from __future__ import annotations

import os
import sqlite3
import sys
from contextlib import contextmanager
from datetime import date, datetime
from typing import Iterator


if getattr(sys, "frozen", False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "finance.db")


def _adapt_date(value: date) -> str:
    return value.isoformat()


def _adapt_datetime(value: datetime) -> str:
    return value.isoformat(timespec="seconds")


sqlite3.register_adapter(date, _adapt_date)
sqlite3.register_adapter(datetime, _adapt_datetime)


@contextmanager
def get_connection() -> Iterator[sqlite3.Connection]:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS imports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                parser TEXT NOT NULL,
                imported_at TEXT NOT NULL,
                total_transactions INTEGER NOT NULL DEFAULT 0,
                duplicates INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                transaction_type TEXT NOT NULL,
                source TEXT NOT NULL,
                parser TEXT NOT NULL,
                external_id TEXT,
                card_last_digits TEXT,
                cardholder_first_name TEXT,
                installment_current INTEGER,
                installment_total INTEGER,
                import_id INTEGER,
                hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL,
                FOREIGN KEY(import_id) REFERENCES imports(id)
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
            CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
            """
        )
