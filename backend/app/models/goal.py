from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    target = Column(Float, nullable=False)
    current = Column(Float, default=0.0)
    deadline = Column(Date, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    keyword = Column(String, nullable=True)
    icon = Column(String, nullable=True)

    transactions = relationship("Transaction", foreign_keys="Transaction.goal_id")
    rules = relationship("Rule", foreign_keys="Rule.goal_id")
