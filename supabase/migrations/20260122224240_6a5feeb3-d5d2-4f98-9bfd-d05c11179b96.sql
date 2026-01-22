-- Loans Module Tables

-- Enum for loan status
CREATE TYPE public.loan_status AS ENUM (
  'pending',
  'active',
  'closed',
  'defaulted',
  'auctioned',
  'renewed'
);

-- Enum for loan payment type
CREATE TYPE public.loan_payment_type AS ENUM (
  'interest',
  'principal',
  'part_release',
  'full_redemption',
  'renewal_fee'
);

-- Main loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  loan_number TEXT NOT NULL UNIQUE,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Loan amounts
  collateral_value NUMERIC NOT NULL,
  loan_amount NUMERIC NOT NULL,
  ltv_percent NUMERIC NOT NULL,
  
  -- Interest terms
  interest_rate NUMERIC NOT NULL, -- Annual rate
  interest_type TEXT NOT NULL DEFAULT 'simple', -- simple or compound
  tenure_months INTEGER NOT NULL DEFAULT 12,
  due_date DATE NOT NULL,
  
  -- Running totals
  principal_paid NUMERIC NOT NULL DEFAULT 0,
  interest_paid NUMERIC NOT NULL DEFAULT 0,
  interest_accrued NUMERIC NOT NULL DEFAULT 0,
  outstanding_principal NUMERIC NOT NULL,
  outstanding_interest NUMERIC NOT NULL DEFAULT 0,
  outstanding_total NUMERIC NOT NULL,
  
  -- Status
  status loan_status NOT NULL DEFAULT 'active',
  closed_date DATE,
  closed_by UUID REFERENCES auth.users(id),
  
  -- Renewal tracking
  renewed_from_loan_id UUID REFERENCES public.loans(id),
  renewed_to_loan_id UUID REFERENCES public.loans(id),
  
  -- Metadata
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loan collaterals (gold items pledged)
CREATE TABLE public.loan_collaterals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  
  -- Item details
  item_description TEXT NOT NULL,
  metal_type metal_type NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL,
  gross_weight NUMERIC NOT NULL,
  net_weight NUMERIC NOT NULL,
  stone_weight NUMERIC DEFAULT 0,
  
  -- Valuation
  rate_per_gram NUMERIC NOT NULL,
  item_value NUMERIC NOT NULL,
  
  -- Storage
  storage_location TEXT,
  packet_number TEXT,
  
  -- Images
  image_url TEXT,
  
  -- Status
  is_released BOOLEAN NOT NULL DEFAULT false,
  released_at TIMESTAMP WITH TIME ZONE,
  released_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Loan payments
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  
  payment_number TEXT NOT NULL UNIQUE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type loan_payment_type NOT NULL,
  
  -- Amount breakdown
  amount NUMERIC NOT NULL,
  principal_amount NUMERIC NOT NULL DEFAULT 0,
  interest_amount NUMERIC NOT NULL DEFAULT 0,
  penalty_amount NUMERIC DEFAULT 0,
  
  -- Payment mode
  payment_mode payment_mode NOT NULL,
  reference_number TEXT,
  bank_name TEXT,
  cheque_number TEXT,
  cheque_date DATE,
  upi_id TEXT,
  
  -- For part release
  collateral_ids UUID[],
  
  notes TEXT,
  receipt_printed BOOLEAN NOT NULL DEFAULT false,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interest accrual tracking
CREATE TABLE public.loan_interest_accruals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id),
  
  accrual_date DATE NOT NULL,
  days_count INTEGER NOT NULL DEFAULT 1,
  principal_balance NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  interest_amount NUMERIC NOT NULL,
  cumulative_interest NUMERIC NOT NULL,
  
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_in_payment_id UUID REFERENCES public.loan_payments(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_collaterals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_interest_accruals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loans
CREATE POLICY "Users can view loans in accessible branches"
ON public.loans FOR SELECT
USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage loans"
ON public.loans FOR ALL
USING (
  has_branch_access(auth.uid(), branch_id) AND 
  has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
)
WITH CHECK (
  has_branch_access(auth.uid(), branch_id) AND 
  has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
);

-- RLS Policies for loan_collaterals
CREATE POLICY "Users can view loan collaterals"
ON public.loan_collaterals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_collaterals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
  )
);

CREATE POLICY "Authorized users can manage loan collaterals"
ON public.loan_collaterals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_collaterals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_collaterals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
  )
);

-- RLS Policies for loan_payments
CREATE POLICY "Users can view loan payments in accessible branches"
ON public.loan_payments FOR SELECT
USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage loan payments"
ON public.loan_payments FOR ALL
USING (
  has_branch_access(auth.uid(), branch_id) AND 
  has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer', 'accountant']::app_role[])
)
WITH CHECK (
  has_branch_access(auth.uid(), branch_id) AND 
  has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer', 'accountant']::app_role[])
);

-- RLS Policies for loan_interest_accruals
CREATE POLICY "Users can view loan interest accruals"
ON public.loan_interest_accruals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_interest_accruals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
  )
);

CREATE POLICY "Authorized users can manage loan interest accruals"
ON public.loan_interest_accruals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_interest_accruals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_interest_accruals.loan_id
    AND has_branch_access(auth.uid(), l.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'loan_officer']::app_role[])
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();