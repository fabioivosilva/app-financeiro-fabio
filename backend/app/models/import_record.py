from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text
from app.database import Base


class ImportRecord(Base):
    __tablename__ = "import_records"

    id = Column(Integer, primary_key=True)
    fingerprint = Column(String, unique=True, index=True, nullable=False)
    filename = Column(String, nullable=False)
    source_path = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    modified_at = Column(DateTime, nullable=True)
    imported_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    bank = Column(String, nullable=True)
    format = Column(String, nullable=True)
    account = Column(String, nullable=True)
    total_found = Column(Integer, default=0)
    imported = Column(Integer, default=0)
    duplicates = Column(Integer, default=0)
    status = Column(String, default="ok")
    warnings = Column(Text, nullable=True)
    errors = Column(Text, nullable=True)
