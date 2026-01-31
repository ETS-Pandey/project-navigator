-- Create karigars table for artisan management
CREATE TABLE public.karigars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  aadhar TEXT,
  pan TEXT,
  specialization TEXT,
  commission_rate NUMERIC DEFAULT 0,
  balance_gold_grams NUMERIC DEFAULT 0,
  balance_silver_grams NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(branch_id, code)
);

-- Enable RLS
ALTER TABLE public.karigars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view karigars in their branch"
ON public.karigars FOR SELECT
USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can create karigars in their branch"
ON public.karigars FOR INSERT
WITH CHECK (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can update karigars in their branch"
ON public.karigars FOR UPDATE
USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Users can delete karigars in their branch"
ON public.karigars FOR DELETE
USING (public.has_branch_access(auth.uid(), branch_id));

-- Add updated_at trigger
CREATE TRIGGER update_karigars_updated_at
BEFORE UPDATE ON public.karigars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add stock_quantity and karigar_id to products
ALTER TABLE public.products 
ADD COLUMN stock_quantity INTEGER DEFAULT 1,
ADD COLUMN karigar_id UUID REFERENCES public.karigars(id);

-- Create index for karigar lookups
CREATE INDEX idx_products_karigar_id ON public.products(karigar_id);
CREATE INDEX idx_karigars_branch_id ON public.karigars(branch_id);