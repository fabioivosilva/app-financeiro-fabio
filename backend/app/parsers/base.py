"""
Contrato base para todos os parsers de importação.
Cada parser expõe can_parse() e parse() — nunca acoplado a um banco específico.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date
from typing import Optional
import hashlib


@dataclass
class ParsedTransaction:
    date: date
    description: str
    amount: float                    # positivo = crédito, negativo = débito
    origin: str = "Débito"           # Débito | Crédito | PIX
    external_id: Optional[str] = None
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None
    raw: Optional[dict] = None       # dados originais para debug

    def canonical_hash(self, bank: str, account: str = "") -> str:
        """Hash determinístico para deduplicação quando não há external_id."""
        key = f"{bank}|{account}|{self.date}|{self.description}|{self.amount:.2f}"
        return hashlib.sha256(key.encode()).hexdigest()[:32]


@dataclass
class ImportResult:
    bank: str
    format: str
    account: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    transactions: list[ParsedTransaction] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


class BaseParser(ABC):
    """Interface que todo parser deve implementar."""
    bank_id: str = "generic"

    @abstractmethod
    def can_parse(self, filename: str, content: bytes) -> float:
        """
        Retorna score 0.0–1.0 indicando confiança de que este parser
        consegue processar o arquivo. 0 = não consigo, 1 = certeza.
        """

    @abstractmethod
    def parse(self, filename: str, content: bytes, password: str | None = None) -> ImportResult:
        """Processa o arquivo e retorna ImportResult."""
