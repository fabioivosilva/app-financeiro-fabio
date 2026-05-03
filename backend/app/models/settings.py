from sqlalchemy import Column, Integer, String
from app.database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True)
    cycle_start_day = Column(Integer, default=27)
    default_import_folder = Column(String, nullable=True)
