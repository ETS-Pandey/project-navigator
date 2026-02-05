-- Phase 6: Purchase Module

-- Vendors Table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  vendor_code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),
  vendor_type VARCHAR(50) DEFAULT 'supplier' CHECK (vendor_type IN ('supplier', 'wholesaler', 'bullion_dealer', 'stone_dealer', 'karigar')),
  
  -- Contact
  phone VARCHAR(20),
  alt_phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(200),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  
  -- Tax Info
  gstin VARCHAR(15),
  pan VARCHAR(10),
  
  -- Bank Details
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(30),
  bank_ifsc VARCHAR(20),
  bank_branch VARCHAR(100),
  
  -- Credit Terms
  credit_period_days INTEGER DEFAULT 0,
  credit_limit NUMERIC(14,2) DEFAULT 0,
  current_balance NUMERIC(14,2) DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(branch_id, vendor_code)
);

-- Purchases Table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  purchase_number VARCHAR(20) NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id),
  
  purchase_type VARCHAR(20) NOT NULL CHECK (purchase_type IN ('bullion', 'finished', 'stones', 'consumables', 'other')),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_number VARCHAR(50),
  invoice_date DATE,
  
  -- Amounts
  gross_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(14,2) DEFAULT 0,
  taxable_amount NUMERIC(14,2) DEFAULT 0,
  cgst_percent NUMERIC(5,2),
  cgst_amount NUMERIC(14,2) DEFAULT 0,
  sgst_percent NUMERIC(5,2),
  sgst_amount NUMERIC(14,2) DEFAULT 0,
  igst_percent NUMERIC(5,2),
  igst_amount NUMERIC(14,2) DEFAULT 0,
  total_gst NUMERIC(14,2) DEFAULT 0,
  other_charges NUMERIC(14,2) DEFAULT 0,
  round_off NUMERIC(8,2) DEFAULT 0,
  grand_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  -- Payment Status
  amount_paid NUMERIC(14,2) DEFAULT 0,
  balance_due NUMERIC(14,2) DEFAULT 0,
  payment_due_date DATE,
  
  -- Weights (for bullion/finished)
  total_gross_weight NUMERIC(12,3),
  total_net_weight NUMERIC(12,3),
  
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'partially_paid', 'paid', 'cancelled')),
  is_interstate BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(branch_id, purchase_number)
);

-- Purchase Items Table
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  
  item_description VARCHAR(300) NOT NULL,
  hsn_code VARCHAR(10),
  
  -- For Bullion
  metal_type VARCHAR(20),
  purity VARCHAR(10),
  gross_weight NUMERIC(12,3),
  stone_weight NUMERIC(12,3),
  net_weight NUMERIC(12,3),
  rate_per_gram NUMERIC(12,2),
  
  -- General
  quantity NUMERIC(10,3) NOT NULL DEFAULT 1,
  unit VARCHAR(20) DEFAULT 'pcs',
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  making_charges NUMERIC(12,2) DEFAULT 0,
  stone_value NUMERIC(12,2) DEFAULT 0,
  other_charges NUMERIC(12,2) DEFAULT 0,
  
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(12,2) DEFAULT 0,
  
  taxable_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_percent NUMERIC(5,2),
  gst_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor Payments Table
CREATE TABLE public.vendor_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  payment_number VARCHAR(20) NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  purchase_id UUID REFERENCES public.purchases(id),
  
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,2) NOT NULL,
  
  payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'card', 'bank_transfer', 'cheque')),
  reference_number VARCHAR(100),
  bank_name VARCHAR(100),
  cheque_number VARCHAR(50),
  cheque_date DATE,
  
  deduction_amount NUMERIC(12,2) DEFAULT 0,
  deduction_reason VARCHAR(200),
  tds_amount NUMERIC(12,2) DEFAULT 0,
  
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(branch_id, payment_number)
);

-- Purchase Returns Table
CREATE TABLE public.purchase_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  return_number VARCHAR(20) NOT NULL,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  
  return_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  
  gross_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
  
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(branch_id, return_number)
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_returns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view vendors for their branches" ON public.vendors
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can manage vendors for their branches" ON public.vendors
  FOR ALL USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can view purchases for their branches" ON public.purchases
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can manage purchases for their branches" ON public.purchases
  FOR ALL USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can view purchase items" ON public.purchase_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchases p 
      WHERE p.id = purchase_items.purchase_id 
      AND public.has_branch_access(auth.uid(), p.branch_id)
    )
  );

CREATE POLICY "Users can manage purchase items" ON public.purchase_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.purchases p 
      WHERE p.id = purchase_items.purchase_id 
      AND public.has_branch_access(auth.uid(), p.branch_id)
    )
  );

CREATE POLICY "Users can view vendor payments for their branches" ON public.vendor_payments
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can manage vendor payments for their branches" ON public.vendor_payments
  FOR ALL USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can view purchase returns for their branches" ON public.purchase_returns
  FOR SELECT USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can manage purchase returns for their branches" ON public.purchase_returns
  FOR ALL USING (public.has_branch_access(auth.uid(), branch_id));

-- Triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_returns_updated_at BEFORE UPDATE ON public.purchase_returns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update vendor balance after payment
CREATE OR REPLACE FUNCTION public.update_vendor_balance_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE vendors 
  SET current_balance = current_balance - NEW.amount
  WHERE id = NEW.vendor_id;
  
  -- Also update purchase if linked
  IF NEW.purchase_id IS NOT NULL THEN
    UPDATE purchases
    SET amount_paid = amount_paid + NEW.amount,
        balance_due = grand_total - (amount_paid + NEW.amount),
        status = CASE 
          WHEN grand_total <= (amount_paid + NEW.amount) THEN 'paid'
          ELSE 'partially_paid'
        END
    WHERE id = NEW.purchase_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_vendor_balance_payment
  AFTER INSERT ON public.vendor_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_balance_on_payment();

-- Function to update vendor balance on purchase
CREATE OR REPLACE FUNCTION public.update_vendor_balance_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE vendors 
    SET current_balance = current_balance + NEW.grand_total
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_vendor_balance_purchase
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_balance_on_purchase();