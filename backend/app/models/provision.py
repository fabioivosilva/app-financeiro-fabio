from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Provision(Base):
    __tablename__ = "provisions"

    id = Column(Integer, primary_key=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)          # negativo=despesa, positivo=receita
    day = Column(Integer, nullable=False)           # dia do mês 1-28
    type = Column(String, default="mensal")         # "mensal" | "parcela"
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    active = Column(Boolean, default=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    installment_current = Column(Integer, nullable=True)
    installment_total = Column(Integer, nullable=True)
    month = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)

    transactions = relationship("Transaction", back_populates="provision")
