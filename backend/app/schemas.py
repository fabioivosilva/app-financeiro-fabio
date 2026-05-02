"""
Pydantic schemas for request/response validation.
"""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Persons
# ---------------------------------------------------------------------------
class PersonBase(BaseModel):
    name: str

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    pass

class PersonOut(PersonBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------
class CardBase(BaseModel):
    last_digits: str
    person_id: Optional[int] = None
    description: Optional[str] = None

class CardCreate(CardBase):
    pass

class CardUpdate(CardBase):
    pass

class CardOut(CardBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------
class CategoryBase(BaseModel):
    name: str
    kind: str = "variable"
    monthly_limit: Optional[float] = None
    color: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    kind: Optional[str] = None
    monthly_limit: Optional[float] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryOut(CategoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Transactions
# ---------------------------------------------------------------------------
class TransactionBase(BaseModel):
    date: date
    description: str
    amount: float
    transaction_type: str  # income, expense
    source: str  # bank_statement, credit_card

class TransactionCreate(TransactionBase):
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    card_id: Optional[int] = None
    file_import_id: Optional[int] = None
    external_id: Optional[str] = None
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None
    is_reviewed: bool = False

class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    is_reviewed: Optional[bool] = None
    description: Optional[str] = None

class TransactionOut(TransactionBase):
    id: int
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    card_id: Optional[int] = None
    file_import_id: Optional[int] = None
    external_id: Optional[str] = None
    installment_current: Optional[int] = None
    installment_total: Optional[int] = None
    is_reviewed: bool
    created_at: datetime
    # Nested names for display
    category_name: Optional[str] = None
    person_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------
class RuleBase(BaseModel):
    keyword: str
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    source: Optional[str] = None
    priority: int = 0
    is_active: bool = True

class RuleCreate(RuleBase):
    pass

class RuleUpdate(BaseModel):
    keyword: Optional[str] = None
    category_id: Optional[int] = None
    person_id: Optional[int] = None
    source: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None

class RuleOut(RuleBase):
    id: int
    created_at: datetime
    category_name: Optional[str] = None
    person_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Goals
# ---------------------------------------------------------------------------
class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    target_date: Optional[date] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None

class GoalOut(GoalBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# File Imports
# ---------------------------------------------------------------------------
class FileImportOut(BaseModel):
    id: int
    filename: str
    file_type: str
    imported_at: datetime
    total_transactions: int
    auto_categorized: int
    pending_review: int
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
class SettingBase(BaseModel):
    key: str
    value: Optional[str] = None

class SettingOut(SettingBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class SpendingByPerson(BaseModel):
    person_id: int
    person_name: str
    total: float
    percentage: float

class SpendingByCategory(BaseModel):
    category_id: int
    category_name: str
    total: float

class CategoryLimit(BaseModel):
    category_id: int
    category_name: str
    spent: float
    limit: float
    percentage: float
    over_budget: bool

class DashboardOut(BaseModel):
    month: str
    total_income: float
    total_expenses: float
    credit_card_total: float
    bank_expenses_total: float
    monthly_balance: float
    planned_savings: float
    reserve_current: float
    reserve_goal: float
    reserve_percentage: float
    spending_by_person: List[SpendingByPerson]
    spending_by_category: List[SpendingByCategory]
    category_limits: List[CategoryLimit]
    pending_review_count: int


# ---------------------------------------------------------------------------
# Import Result
# ---------------------------------------------------------------------------
class ImportResult(BaseModel):
    filename: str
    total_read: int
    total_imported: int
    duplicates_skipped: int
    pending_review: int
    auto_categorized: int
