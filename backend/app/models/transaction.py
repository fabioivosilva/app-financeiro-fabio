from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class CategoryType(str, enum.Enum):
    fixa = "fixa"
    variavel = "variavel"


class TransactionOrigin(str, enum.Enum):
    debito = "Débito"
    credito = "Crédito"
    pix = "PIX"
    aporte = "Aporte Manual"


class TransactionStatus(str, enum.Enum):
    confirmado = "confirmado"
    pendente = "pendente"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    color = Column(String, default="#888888")
    limit_value = Column(Float, nullable=True)
    type = Column(SAEnum(CategoryType), default=CategoryType.variavel)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    transactions = relationship("Transaction", back_populates="category")
    rules = relationship("Rule", back_populates="category")


class Rule(Base):
    __tablename__ = "rules"

    id = Column(Integer, primary_key=True)
    keyword = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    origin = Column(String, nullable=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)

    category = relationship("Category", back_populates="rules")
    person = relationship("Person", back_populates="rules")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=True)
    origin = Column(SAEnum(TransactionOrigin), default=TransactionOrigin.debito)
    status = Column(SAEnum(TransactionStatus), default=TransactionStatus.confirmado)
    installment_current = Column(Integer, nullable=True)
    installment_total = Column(Integer, nullable=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    external_id = Column(String, nullable=True, unique=True)

    category = relationship("Category", back_populates="transactions")
    person = relationship("Person", back_populates="transactions")
    card = relationship("Card", back_populates="transactions")
