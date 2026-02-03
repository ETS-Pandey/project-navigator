-- Phase 11: Complete Expense Tracking Module

-- Petty Cash Management
CREATE TABLE public.petty_cash_funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  fund_name VARCHAR(100) NOT NULL DEFAULT 'Main Petty Cash',
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  custodian_id UUID REFERENCES auth.users(id),
  max_single_expense NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.petty_cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.petty_cash_funds(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('receipt', 'payment', 'replenishment')),
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2) NOT NULL,
  description TEXT,
  expense_id UUID REFERENCES public.expenses(id),
  reference_number VARCHAR(50),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Salary/Payroll Management
CREATE TABLE public.salary_structures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  designation VARCHAR(100) NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra_percent NUMERIC(5,2) DEFAULT 0,
  da_percent NUMERIC(5,2) DEFAULT 0,
  other_allowances NUMERIC(12,2) DEFAULT 0,
  pf_percent NUMERIC(5,2) DEFAULT 0,
  esi_percent NUMERIC(5,2) DEFAULT 0,
  professional_tax NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.salary_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  staff_id UUID NOT NULL,
  salary_month DATE NOT NULL,
  days_worked INTEGER NOT NULL DEFAULT 30,
  days_in_month INTEGER NOT NULL DEFAULT 30,
  
  -- Earnings
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra NUMERIC(12,2) DEFAULT 0,
  da NUMERIC(12,2) DEFAULT 0,
  other_allowances NUMERIC(12,2) DEFAULT 0,
  overtime_hours NUMERIC(6,2) DEFAULT 0,
  overtime_amount NUMERIC(12,2) DEFAULT 0,
  bonus NUMERIC(12,2) DEFAULT 0,
  commission NUMERIC(12,2) DEFAULT 0,
  gross_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Deductions
  pf_deduction NUMERIC(12,2) DEFAULT 0,
  esi_deduction NUMERIC(12,2) DEFAULT 0,
  professional_tax NUMERIC(12,2) DEFAULT 0,
  tds NUMERIC(12,2) DEFAULT 0,
  loan_deduction NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,
  
  -- Net
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  
  -- Payment
  payment_mode VARCHAR(20),
  payment_date DATE,
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'cancelled')),
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(staff_id, salary_month)
);

-- Budget Management
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  category_id UUID REFERENCES public.expense_categories(id),
  budget_name VARCHAR(100) NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  budgeted_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(14,2) DEFAULT 0,
  remaining_amount NUMERIC(14,2) GENERATED ALWAYS AS (budgeted_amount - COALESCE(spent_amount, 0)) STORED,
  utilization_percent NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN budgeted_amount > 0 THEN (COALESCE(spent_amount, 0) / budgeted_amount * 100) ELSE 0 END
  ) STORED,
  alert_threshold_percent NUMERIC(5,2) DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Advances/Loans
CREATE TABLE public.staff_advances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  staff_id UUID NOT NULL,
  advance_type VARCHAR(20) NOT NULL CHECK (advance_type IN ('salary_advance', 'loan')),
  amount NUMERIC(12,2) NOT NULL,
  outstanding_amount NUMERIC(12,2) NOT NULL,
  monthly_deduction NUMERIC(12,2),
  interest_rate NUMERIC(5,2) DEFAULT 0,
  disbursement_date DATE NOT NULL,
  expected_completion_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'written_off')),
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.petty_cash_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petty_cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_advances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Petty Cash Funds
CREATE POLICY "Users can view petty cash funds for their branches" ON public.petty_cash_funds
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Managers can manage petty cash funds" ON public.petty_cash_funds
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[]));

-- RLS Policies for Petty Cash Transactions
CREATE POLICY "Users can view petty cash transactions for their branches" ON public.petty_cash_transactions
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can insert petty cash transactions" ON public.petty_cash_transactions
  FOR INSERT WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

-- RLS Policies for Salary Structures
CREATE POLICY "Users can view salary structures" ON public.salary_structures
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Admins can manage salary structures" ON public.salary_structures
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- RLS Policies for Salary Records
CREATE POLICY "Users can view salary records for their branches" ON public.salary_records
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Admins can manage salary records" ON public.salary_records
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

-- RLS Policies for Budgets
CREATE POLICY "Users can view budgets for their branches" ON public.budgets
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Managers can manage budgets" ON public.budgets
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[]));

-- RLS Policies for Staff Advances
CREATE POLICY "Users can view staff advances for their branches" ON public.staff_advances
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Admins can manage staff advances" ON public.staff_advances
  FOR ALL USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- Triggers for updated_at
CREATE TRIGGER update_petty_cash_funds_updated_at BEFORE UPDATE ON public.petty_cash_funds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_structures_updated_at BEFORE UPDATE ON public.salary_structures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_records_updated_at BEFORE UPDATE ON public.salary_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_advances_updated_at BEFORE UPDATE ON public.staff_advances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update petty cash balance
CREATE OR REPLACE FUNCTION public.update_petty_cash_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.transaction_type = 'payment' THEN
    UPDATE petty_cash_funds 
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.fund_id;
  ELSE
    UPDATE petty_cash_funds 
    SET current_balance = current_balance + NEW.amount
    WHERE id = NEW.fund_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_petty_cash_balance
  AFTER INSERT ON public.petty_cash_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_petty_cash_balance();

-- Function to update budget spent amount
CREATE OR REPLACE FUNCTION public.update_budget_spent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE budgets b
  SET spent_amount = (
    SELECT COALESCE(SUM(e.amount), 0)
    FROM expenses e
    WHERE e.category_id = b.category_id
      AND e.branch_id = b.branch_id
      AND e.expense_date BETWEEN b.period_start AND b.period_end
      AND e.status != 'cancelled'
  )
  WHERE b.category_id = NEW.category_id
    AND b.branch_id = NEW.branch_id
    AND NEW.expense_date BETWEEN b.period_start AND b.period_end;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_budget_spent
  AFTER INSERT OR UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_spent();