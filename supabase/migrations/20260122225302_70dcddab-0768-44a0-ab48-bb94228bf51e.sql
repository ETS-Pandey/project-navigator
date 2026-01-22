-- Phase 16: Savings Schemes Module
-- Enum for scheme status
CREATE TYPE public.scheme_status AS ENUM ('active', 'inactive', 'discontinued');

-- Enum for enrollment status
CREATE TYPE public.enrollment_status AS ENUM ('active', 'completed', 'cancelled', 'defaulted', 'matured');

-- Enum for scheme payment status
CREATE TYPE public.scheme_payment_status AS ENUM ('pending', 'paid', 'overdue', 'waived');

-- Schemes configuration table
CREATE TABLE public.schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  
  -- Scheme details
  scheme_code TEXT NOT NULL,
  scheme_name TEXT NOT NULL,
  description TEXT,
  
  -- Terms
  duration_months INTEGER NOT NULL DEFAULT 11,
  monthly_amount NUMERIC NOT NULL,
  total_amount NUMERIC GENERATED ALWAYS AS (duration_months * monthly_amount) STORED,
  
  -- Benefits
  bonus_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed', 'percentage', 'gold_bonus'
  bonus_value NUMERIC NOT NULL DEFAULT 0, -- Amount or percentage
  bonus_month INTEGER, -- Which month's installment is bonus (e.g., 12th month free)
  
  -- Gold scheme specific
  is_gold_scheme BOOLEAN DEFAULT false,
  gold_rate_lock_type TEXT DEFAULT 'enrollment', -- 'enrollment', 'average', 'maturity'
  
  -- Penalty
  late_payment_penalty_percent NUMERIC DEFAULT 0,
  grace_period_days INTEGER DEFAULT 7,
  
  -- Limits
  min_enrollments INTEGER DEFAULT 1,
  max_enrollments INTEGER,
  
  -- Status
  status scheme_status NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  
  -- Terms
  terms_conditions TEXT,
  
  -- Metadata
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(branch_id, scheme_code)
);

-- Scheme enrollments table
CREATE TABLE public.scheme_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  scheme_id UUID NOT NULL REFERENCES public.schemes(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  
  -- Enrollment details
  enrollment_number TEXT NOT NULL,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  
  -- Amount tracking
  monthly_amount NUMERIC NOT NULL,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  total_due NUMERIC NOT NULL DEFAULT 0,
  installments_paid INTEGER NOT NULL DEFAULT 0,
  installments_remaining INTEGER NOT NULL,
  
  -- Bonus/benefits
  bonus_amount NUMERIC DEFAULT 0,
  bonus_earned BOOLEAN DEFAULT false,
  
  -- Gold scheme specific
  locked_gold_rate NUMERIC,
  gold_weight_earned NUMERIC DEFAULT 0,
  
  -- Status
  status enrollment_status NOT NULL DEFAULT 'active',
  matured_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Payout
  payout_amount NUMERIC DEFAULT 0,
  payout_date DATE,
  payout_mode TEXT,
  payout_reference TEXT,
  
  -- Metadata
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(branch_id, enrollment_number)
);

-- Scheme payments table
CREATE TABLE public.scheme_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  enrollment_id UUID NOT NULL REFERENCES public.scheme_enrollments(id),
  
  -- Payment details
  payment_number TEXT NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  
  -- Amounts
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  penalty_amount NUMERIC DEFAULT 0,
  
  -- Payment mode
  payment_mode payment_mode,
  reference_number TEXT,
  bank_name TEXT,
  cheque_number TEXT,
  cheque_date DATE,
  upi_id TEXT,
  
  -- Status
  status scheme_payment_status NOT NULL DEFAULT 'pending',
  
  -- Metadata
  notes TEXT,
  receipt_printed BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_schemes_branch_status ON public.schemes(branch_id, status);
CREATE INDEX idx_scheme_enrollments_branch ON public.scheme_enrollments(branch_id);
CREATE INDEX idx_scheme_enrollments_customer ON public.scheme_enrollments(customer_id);
CREATE INDEX idx_scheme_enrollments_status ON public.scheme_enrollments(status);
CREATE INDEX idx_scheme_enrollments_maturity ON public.scheme_enrollments(maturity_date);
CREATE INDEX idx_scheme_payments_enrollment ON public.scheme_payments(enrollment_id);
CREATE INDEX idx_scheme_payments_due_date ON public.scheme_payments(due_date);
CREATE INDEX idx_scheme_payments_status ON public.scheme_payments(status);

-- Enable RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schemes
CREATE POLICY "Users can view schemes in accessible branches"
  ON public.schemes FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage schemes"
  ON public.schemes FOR ALL
  USING (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
  )
  WITH CHECK (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
  );

-- RLS Policies for scheme_enrollments
CREATE POLICY "Users can view scheme enrollments in accessible branches"
  ON public.scheme_enrollments FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage scheme enrollments"
  ON public.scheme_enrollments FOR ALL
  USING (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  )
  WITH CHECK (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  );

-- RLS Policies for scheme_payments
CREATE POLICY "Users can view scheme payments in accessible branches"
  ON public.scheme_payments FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage scheme payments"
  ON public.scheme_payments FOR ALL
  USING (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  )
  WITH CHECK (
    has_branch_access(auth.uid(), branch_id) AND 
    has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  );

-- Triggers for updated_at
CREATE TRIGGER update_schemes_updated_at
  BEFORE UPDATE ON public.schemes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheme_enrollments_updated_at
  BEFORE UPDATE ON public.scheme_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();