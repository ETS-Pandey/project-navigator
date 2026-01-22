-- Phase 4: Billing Module Tables

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  customer_code TEXT NOT NULL,
  customer_type TEXT NOT NULL DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'corporate')),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gstin TEXT,
  pan TEXT,
  aadhar TEXT,
  date_of_birth DATE,
  anniversary DATE,
  loyalty_points INTEGER DEFAULT 0,
  credit_limit NUMERIC DEFAULT 0,
  outstanding_balance NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, customer_code)
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view customers in accessible branches"
  ON public.customers FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage customers"
  ON public.customers FOR ALL
  USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[]))
  WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[]));

-- Invoice status enum
CREATE TYPE invoice_status AS ENUM ('draft', 'confirmed', 'paid', 'partially_paid', 'cancelled', 'returned');

-- Payment mode enum
CREATE TYPE payment_mode AS ENUM ('cash', 'card', 'upi', 'bank_transfer', 'cheque', 'credit', 'old_gold');

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_type TEXT NOT NULL DEFAULT 'sale' CHECK (invoice_type IN ('sale', 'purchase', 'sale_return', 'purchase_return')),
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Customer details (denormalized for invoice)
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_gstin TEXT,
  
  -- Totals
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  taxable_amount NUMERIC NOT NULL DEFAULT 0,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_amount NUMERIC DEFAULT 0,
  igst_amount NUMERIC DEFAULT 0,
  total_gst NUMERIC DEFAULT 0,
  round_off NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  
  -- Old gold adjustment
  old_gold_amount NUMERIC DEFAULT 0,
  
  -- Payment
  amount_paid NUMERIC DEFAULT 0,
  balance_due NUMERIC DEFAULT 0,
  payment_due_date DATE,
  
  -- Metadata
  notes TEXT,
  terms_conditions TEXT,
  is_interstate BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, invoice_number)
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in accessible branches"
  ON public.invoices FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage invoices"
  ON public.invoices FOR ALL
  USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[]))
  WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[]));

-- Invoice items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  
  -- Item details
  item_code TEXT,
  item_name TEXT NOT NULL,
  hsn_code TEXT DEFAULT '7113',
  description TEXT,
  
  -- Metal details
  metal_type metal_type,
  purity TEXT,
  gross_weight NUMERIC,
  net_weight NUMERIC,
  
  -- Pricing
  rate_per_gram NUMERIC,
  metal_value NUMERIC DEFAULT 0,
  making_charge_type making_charge_type,
  making_charge_value NUMERIC DEFAULT 0,
  making_charges NUMERIC DEFAULT 0,
  stone_value NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  
  -- Totals
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  taxable_amount NUMERIC NOT NULL DEFAULT 0,
  cgst_percent NUMERIC DEFAULT 1.5,
  cgst_amount NUMERIC DEFAULT 0,
  sgst_percent NUMERIC DEFAULT 1.5,
  sgst_amount NUMERIC DEFAULT 0,
  igst_percent NUMERIC DEFAULT 3,
  igst_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoice items
CREATE POLICY "Users can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND has_branch_access(auth.uid(), i.branch_id)
  ));

CREATE POLICY "Authorized users can manage invoice items"
  ON public.invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND has_branch_access(auth.uid(), i.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.id = invoice_items.invoice_id
    AND has_branch_access(auth.uid(), i.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[])
  ));

-- Old gold purchases table
CREATE TABLE public.old_gold_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  
  purchase_number TEXT NOT NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Metal details
  metal_type metal_type NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL,
  gross_weight NUMERIC NOT NULL,
  deduction_percent NUMERIC DEFAULT 0,
  deduction_weight NUMERIC DEFAULT 0,
  net_weight NUMERIC NOT NULL,
  
  -- Valuation
  rate_per_gram NUMERIC NOT NULL,
  gross_value NUMERIC NOT NULL,
  deduction_amount NUMERIC DEFAULT 0,
  net_value NUMERIC NOT NULL,
  
  -- Testing
  testing_method TEXT CHECK (testing_method IN ('touchstone', 'electronic', 'fire_assay', 'xrf')),
  tested_by UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'adjusted', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, purchase_number)
);

-- Enable RLS
ALTER TABLE public.old_gold_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for old gold purchases
CREATE POLICY "Users can view old gold purchases in accessible branches"
  ON public.old_gold_purchases FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage old gold purchases"
  ON public.old_gold_purchases FOR ALL
  USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'appraiser']::app_role[]))
  WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'appraiser']::app_role[]));

-- Quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  
  quotation_number TEXT NOT NULL,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  converted_invoice_id UUID REFERENCES public.invoices(id),
  
  -- Customer details
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  
  -- Totals
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  taxable_amount NUMERIC NOT NULL DEFAULT 0,
  total_gst NUMERIC DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, quotation_number)
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Users can view quotations in accessible branches"
  ON public.quotations FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage quotations"
  ON public.quotations FOR ALL
  USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[]))
  WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[]));

-- Quotation items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  
  item_code TEXT,
  item_name TEXT NOT NULL,
  hsn_code TEXT DEFAULT '7113',
  description TEXT,
  
  metal_type metal_type,
  purity TEXT,
  gross_weight NUMERIC,
  net_weight NUMERIC,
  
  rate_per_gram NUMERIC,
  metal_value NUMERIC DEFAULT 0,
  making_charges NUMERIC DEFAULT 0,
  stone_value NUMERIC DEFAULT 0,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotation items
CREATE POLICY "Users can view quotation items"
  ON public.quotation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.quotations q
    WHERE q.id = quotation_items.quotation_id
    AND has_branch_access(auth.uid(), q.branch_id)
  ));

CREATE POLICY "Authorized users can manage quotation items"
  ON public.quotation_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.quotations q
    WHERE q.id = quotation_items.quotation_id
    AND has_branch_access(auth.uid(), q.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[])
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.quotations q
    WHERE q.id = quotation_items.quotation_id
    AND has_branch_access(auth.uid(), q.branch_id)
    AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[])
  ));

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.customers(id),
  
  payment_number TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode payment_mode NOT NULL,
  
  amount NUMERIC NOT NULL,
  reference_number TEXT,
  bank_name TEXT,
  cheque_number TEXT,
  cheque_date DATE,
  upi_id TEXT,
  
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(branch_id, payment_number)
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view payments in accessible branches"
  ON public.payments FOR SELECT
  USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage payments"
  ON public.payments FOR ALL
  USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[]))
  WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'accountant']::app_role[]));

-- Create indexes for better performance
CREATE INDEX idx_customers_branch ON public.customers(branch_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_invoices_branch ON public.invoices(branch_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX idx_old_gold_branch ON public.old_gold_purchases(branch_id);
CREATE INDEX idx_quotations_branch ON public.quotations(branch_id);
CREATE INDEX idx_quotation_items_quotation ON public.quotation_items(quotation_id);
CREATE INDEX idx_payments_branch ON public.payments(branch_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_old_gold_purchases_updated_at
  BEFORE UPDATE ON public.old_gold_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();