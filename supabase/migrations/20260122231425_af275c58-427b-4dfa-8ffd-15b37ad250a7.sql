-- =============================================
-- ORDERS MODULE
-- =============================================

-- Order status enum
CREATE TYPE public.order_status AS ENUM (
  'pending', 'in_progress', 'ready', 'delivered', 'cancelled'
);

-- Repair Orders table
CREATE TABLE public.repair_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Item details
  item_description TEXT NOT NULL,
  item_type VARCHAR(100),
  metal_type public.metal_type,
  purity VARCHAR(20),
  weight_received DECIMAL(10,3),
  weight_returned DECIMAL(10,3),
  
  -- Order info
  issue_description TEXT,
  estimated_cost DECIMAL(12,2),
  final_cost DECIMAL(12,2),
  advance_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,
  
  -- Status & dates
  status public.order_status DEFAULT 'pending',
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  completed_date DATE,
  delivered_date DATE,
  
  -- Assignment
  assigned_to VARCHAR(255),
  
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Orders table
CREATE TABLE public.custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Design details
  design_description TEXT NOT NULL,
  design_reference_url TEXT,
  metal_type public.metal_type,
  purity VARCHAR(20),
  estimated_weight DECIMAL(10,3),
  actual_weight DECIMAL(10,3),
  
  -- Pricing
  estimated_cost DECIMAL(12,2),
  final_cost DECIMAL(12,2),
  advance_paid DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) DEFAULT 0,
  
  -- Status & dates
  status public.order_status DEFAULT 'pending',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  completed_date DATE,
  delivered_date DATE,
  
  -- Assignment
  assigned_karigar VARCHAR(255),
  
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EXPENSE MODULE
-- =============================================

-- Expense Categories
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.expense_categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  expense_number VARCHAR(50) NOT NULL UNIQUE,
  category_id UUID REFERENCES public.expense_categories(id),
  
  amount DECIMAL(12,2) NOT NULL,
  payment_mode public.payment_mode DEFAULT 'cash',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  vendor_name VARCHAR(255),
  description TEXT,
  reference_number VARCHAR(100),
  
  -- GST tracking
  is_gst_applicable BOOLEAN DEFAULT FALSE,
  gst_amount DECIMAL(12,2),
  
  -- Approval
  status VARCHAR(20) DEFAULT 'approved',
  approved_by UUID,
  
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACCOUNTING MODULE
-- =============================================

-- Account types enum
CREATE TYPE public.account_type AS ENUM (
  'asset', 'liability', 'equity', 'income', 'expense'
);

-- Chart of Accounts
CREATE TABLE public.chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) NOT NULL UNIQUE,
  account_name VARCHAR(255) NOT NULL,
  account_type public.account_type NOT NULL,
  parent_id UUID REFERENCES public.chart_of_accounts(id),
  
  description TEXT,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  
  is_system_account BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  entry_number VARCHAR(50) NOT NULL UNIQUE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  narration TEXT,
  reference_type VARCHAR(50), -- 'invoice', 'payment', 'expense', 'manual'
  reference_id UUID,
  
  total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  is_posted BOOLEAN DEFAULT TRUE,
  
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entry Lines
CREATE TABLE public.journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
  
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  
  narration TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE RLS
-- =============================================

ALTER TABLE public.repair_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Repair Orders - branch based access
CREATE POLICY "Users can view repair orders in their branches"
  ON public.repair_orders FOR SELECT
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can insert repair orders in their branches"
  ON public.repair_orders FOR INSERT
  TO authenticated
  WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can update repair orders in their branches"
  ON public.repair_orders FOR UPDATE
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

-- Custom Orders - branch based access
CREATE POLICY "Users can view custom orders in their branches"
  ON public.custom_orders FOR SELECT
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can insert custom orders in their branches"
  ON public.custom_orders FOR INSERT
  TO authenticated
  WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can update custom orders in their branches"
  ON public.custom_orders FOR UPDATE
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

-- Expense Categories - all authenticated users can view
CREATE POLICY "Authenticated users can view expense categories"
  ON public.expense_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage expense categories"
  ON public.expense_categories FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

-- Expenses - branch based access
CREATE POLICY "Users can view expenses in their branches"
  ON public.expenses FOR SELECT
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can insert expenses in their branches"
  ON public.expenses FOR INSERT
  TO authenticated
  WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can update expenses in their branches"
  ON public.expenses FOR UPDATE
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

-- Chart of Accounts - all authenticated users can view
CREATE POLICY "Authenticated users can view chart of accounts"
  ON public.chart_of_accounts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage chart of accounts"
  ON public.chart_of_accounts FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

-- Journal Entries - branch based access
CREATE POLICY "Users can view journal entries in their branches"
  ON public.journal_entries FOR SELECT
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Accountants can insert journal entries"
  ON public.journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

CREATE POLICY "Accountants can update journal entries"
  ON public.journal_entries FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

-- Journal Entry Lines - access through journal entry
CREATE POLICY "Users can view journal entry lines"
  ON public.journal_entry_lines FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.journal_entries je 
    WHERE je.id = journal_entry_id 
    AND public.has_branch_access(auth.uid(), je.branch_id)
  ));

CREATE POLICY "Accountants can manage journal entry lines"
  ON public.journal_entry_lines FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'accountant']::app_role[]));

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_repair_orders_updated_at
  BEFORE UPDATE ON public.repair_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON public.custom_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at
  BEFORE UPDATE ON public.chart_of_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED DEFAULT EXPENSE CATEGORIES
-- =============================================

INSERT INTO public.expense_categories (name, description) VALUES
  ('Rent', 'Shop and office rent'),
  ('Utilities', 'Electricity, water, internet'),
  ('Salaries', 'Staff salaries and wages'),
  ('Repairs & Maintenance', 'Equipment and shop maintenance'),
  ('Office Supplies', 'Stationery and office supplies'),
  ('Marketing', 'Advertising and promotions'),
  ('Travel', 'Travel and conveyance'),
  ('Insurance', 'Business and staff insurance'),
  ('Professional Fees', 'Legal, accounting, consulting'),
  ('Miscellaneous', 'Other expenses');

-- =============================================
-- SEED DEFAULT CHART OF ACCOUNTS
-- =============================================

INSERT INTO public.chart_of_accounts (account_code, account_name, account_type, is_system_account) VALUES
  -- Assets
  ('1000', 'Cash', 'asset', true),
  ('1100', 'Bank Account', 'asset', true),
  ('1200', 'Accounts Receivable', 'asset', true),
  ('1300', 'Inventory - Gold', 'asset', true),
  ('1310', 'Inventory - Silver', 'asset', true),
  ('1320', 'Inventory - Diamonds', 'asset', true),
  ('1400', 'Loans Receivable', 'asset', true),
  
  -- Liabilities
  ('2000', 'Accounts Payable', 'liability', true),
  ('2100', 'Customer Advances', 'liability', true),
  ('2200', 'GST Payable', 'liability', true),
  
  -- Equity
  ('3000', 'Owner Capital', 'equity', true),
  ('3100', 'Retained Earnings', 'equity', true),
  
  -- Income
  ('4000', 'Sales - Gold', 'income', true),
  ('4010', 'Sales - Silver', 'income', true),
  ('4020', 'Sales - Diamonds', 'income', true),
  ('4100', 'Making Charges', 'income', true),
  ('4200', 'Interest Income - Loans', 'income', true),
  ('4300', 'Repair Income', 'income', true),
  
  -- Expenses
  ('5000', 'Cost of Goods Sold', 'expense', true),
  ('5100', 'Rent Expense', 'expense', true),
  ('5200', 'Salary Expense', 'expense', true),
  ('5300', 'Utilities Expense', 'expense', true),
  ('5400', 'Marketing Expense', 'expense', true),
  ('5500', 'Office Expense', 'expense', true),
  ('5900', 'Other Expenses', 'expense', true);