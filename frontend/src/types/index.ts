export interface Person {
  id: number;
  name: string;
  created_at: string;
}

export interface Card {
  id: number;
  last_digits: string;
  person_id: number | null;
  person_name: string | null;
  description: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  kind: string;
  monthly_limit: number | null;
  color: string | null;
  is_active: boolean;
  exclude_from_totals: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  transaction_type: string;
  source: string;
  category_id: number | null;
  person_id: number | null;
  card_id: number | null;
  installment_current: number | null;
  installment_total: number | null;
  is_reviewed: boolean;
  created_at: string;
  category_name: string | null;
  person_name: string | null;
}

export interface Rule {
  id: number;
  keyword: string;
  category_id: number | null;
  person_id: number | null;
  source: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  category_name: string | null;
  person_name: string | null;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  created_at: string;
}

export interface FileImport {
  id: number;
  filename: string;
  file_type: string;
  imported_at: string;
  total_transactions: number;
  auto_categorized: number;
  pending_review: number;
}

export interface ImportResult {
  filename: string;
  total_read: number;
  total_imported: number;
  duplicates_skipped: number;
  pending_review: number;
  auto_categorized: number;
}

export interface SpendingByPerson {
  person_id: number;
  person_name: string;
  total: number;
  percentage: number;
}

export interface SpendingByCategory {
  category_id: number;
  category_name: string;
  total: number;
}

export interface CategoryLimit {
  category_id: number;
  category_name: string;
  spent: number;
  limit: number;
  percentage: number;
  over_budget: boolean;
}

export interface Dashboard {
  month: string;
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  credit_card_total: number;
  bank_expenses_total: number;
  monthly_balance: number;
  planned_savings: number;
  reserve_current: number;
  reserve_goal: number;
  reserve_percentage: number;
  spending_by_person: SpendingByPerson[];
  spending_by_category: SpendingByCategory[];
  category_limits: CategoryLimit[];
  pending_review_count: number;
}
