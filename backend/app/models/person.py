from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Person(Base):
    __tablename__ = "persons"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)

    cards = relationship("Card", back_populates="person")
    transactions = relationship("Transaction", back_populates="person")
    rules = relationship("Rule", back_populates="person")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    last4 = Column(String, nullable=True)
    limit_value = Column(Float, nullable=True)
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)

    person = relationship("Person", back_populates="cards")
    transactions = relationship("Transaction", back_populates="card")
