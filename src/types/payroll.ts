export interface SalaryStructure {
  id: string;
  branch_id: string;
  designation: string;
  basic_salary: number;
  hra_percent: number | null;
  da_percent: number | null;
  other_allowances: number | null;
  pf_percent: number | null;
  esi_percent: number | null;
  professional_tax: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryRecord {
  id: string;
  branch_id: string;
  staff_id: string;
  salary_month: string;
  days_worked: number;
  days_in_month: number;
  
  // Earnings
  basic_salary: number;
  hra: number | null;
  da: number | null;
  other_allowances: number | null;
  overtime_hours: number | null;
  overtime_amount: number | null;
  bonus: number | null;
  commission: number | null;
  gross_salary: number;
  
  // Deductions
  pf_deduction: number | null;
  esi_deduction: number | null;
  professional_tax: number | null;
  tds: number | null;
  loan_deduction: number | null;
  other_deductions: number | null;
  total_deductions: number | null;
  
  // Net
  net_salary: number;
  
  // Payment
  payment_mode: string | null;
  payment_date: string | null;
  payment_reference: string | null;
  status: 'pending' | 'processed' | 'paid' | 'cancelled';
  
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  staff?: {
    id: string;
    full_name: string;
    designation: string;
  };
}

export interface PettyCashFund {
  id: string;
  branch_id: string;
  fund_name: string;
  opening_balance: number;
  current_balance: number;
  custodian_id: string | null;
  max_single_expense: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PettyCashTransaction {
  id: string;
  fund_id: string;
  branch_id: string;
  transaction_type: 'receipt' | 'payment' | 'replenishment';
  amount: number;
  balance_after: number;
  description: string | null;
  expense_id: string | null;
  reference_number: string | null;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  branch_id: string;
  category_id: string | null;
  budget_name: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  budgeted_amount: number;
  spent_amount: number | null;
  remaining_amount: number;
  utilization_percent: number;
  alert_threshold_percent: number | null;
  is_active: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  category?: {
    id: string;
    name: string;
  };
}

export interface StaffAdvance {
  id: string;
  branch_id: string;
  staff_id: string;
  advance_type: 'salary_advance' | 'loan';
  amount: number;
  outstanding_amount: number;
  monthly_deduction: number | null;
  interest_rate: number | null;
  disbursement_date: string;
  expected_completion_date: string | null;
  status: 'active' | 'completed' | 'written_off';
  reason: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  staff?: {
    id: string;
    full_name: string;
  };
}

export interface SalaryFormData {
  staff_id: string;
  salary_month: string;
  days_worked: number;
  days_in_month: number;
  basic_salary: number;
  hra?: number;
  da?: number;
  other_allowances?: number;
  overtime_hours?: number;
  overtime_amount?: number;
  bonus?: number;
  commission?: number;
  pf_deduction?: number;
  esi_deduction?: number;
  professional_tax?: number;
  tds?: number;
  loan_deduction?: number;
  other_deductions?: number;
  notes?: string;
}

export interface BudgetFormData {
  category_id?: string;
  budget_name: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  budgeted_amount: number;
  alert_threshold_percent?: number;
  notes?: string;
}

export interface PettyCashFormData {
  fund_name: string;
  opening_balance: number;
  max_single_expense?: number;
}

export interface PettyCashTransactionFormData {
  fund_id: string;
  transaction_type: 'receipt' | 'payment' | 'replenishment';
  amount: number;
  description?: string;
  reference_number?: string;
  transaction_date: string;
}
