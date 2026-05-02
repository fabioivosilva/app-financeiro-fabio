"""
SQLAlchemy ORM models for the finance application.
"""
import hashlib
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime,
    ForeignKey, Text, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from .database import Base


# ---------------------------------------------------------------------------
# Persons
# ---------------------------------------------------------------------------
class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    cards = relationship("Card", back_populates="person")
    transactions = relationship("Transaction", back_populates="person")
    rules = relationship("Rule", back_populates="person")


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------
class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    last_digits = Column(String(4), nullable=False)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    description = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="cards")
    transactions = relationship("Transaction", back_populates="card")


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    kind = Column(String(20), nullable=False, default="variable")  # fixed, variable, income, other
    monthly_limit = Column(Float, nullable=True)
    color = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    exclude_from_totals = Column(Boolean, default=False, nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="category")
    rules = relationship("Rule", back_populates="category")
    goal = relationship("Goal", back_populates="categories")


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # income, expense
    source = Column(String(30), nullable=False)  # bank_statement, credit_card
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=True)
    file_import_id = Column(Integer, ForeignKey("imports.id"), nullable=True)
    external_id = Column(String(200), nullable=True)  # FITID from OFX
    installment_current = Column(Integer, nullable=True)
    installment_total = Column(Integer, nullable=True)
    is_reviewed = Column(Boolean, default=False)
    hash = Column(String(64), nullable=True, index=True)  # deduplication hash
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="transactions")
    person = relationship("Person", back_populates="transactions")
    card = relationship("Card", back_populates="transactions")
    file_import = relationship("FileImport", back_populates="transactions")

    @staticmethod
    def compute_hash(dt: date, description: str, amount: float, source: str, card_id: int = None) -> str:
        """Generate deduplication hash."""
        raw = f"{dt.isoformat()}|{description.strip().upper()}|{amount:.2f}|{source}|{card_id or ''}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------
class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    source = Column(String(30), nullable=True)  # bank_statement, credit_card, or null (both)
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="rules")
    person = relationship("Person", back_populates="rules")


# ---------------------------------------------------------------------------
# File Imports
# ---------------------------------------------------------------------------
class FileImport(Base):
    __tablename__ = "imports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(30), nullable=False)  # credit_card_pdf, bank_statement_ofx
    imported_at = Column(DateTime, default=datetime.utcnow)
    total_transactions = Column(Integer, default=0)
    auto_categorized = Column(Integer, default=0)
    pending_review = Column(Integer, default=0)

    transactions = relationship("Transaction", back_populates="file_import")


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="goal")


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
