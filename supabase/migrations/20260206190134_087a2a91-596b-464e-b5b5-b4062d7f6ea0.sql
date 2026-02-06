
-- ============================================
-- PHASE 13: STONE INVENTORY
-- ============================================

-- Stone types catalog
CREATE TABLE public.stone_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'precious', -- precious, semi_precious, synthetic
  default_unit TEXT NOT NULL DEFAULT 'carat', -- carat, piece, gram
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stone lots / parcels
CREATE TABLE public.stone_lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  stone_type_id UUID NOT NULL REFERENCES public.stone_types(id),
  lot_number TEXT NOT NULL,
  supplier_name TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_pieces INTEGER NOT NULL DEFAULT 0,
  total_carat_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_per_carat NUMERIC(10,2) NOT NULL DEFAULT 0,
  available_pieces INTEGER NOT NULL DEFAULT 0,
  available_carat_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  shape TEXT,
  color_grade TEXT,
  clarity_grade TEXT,
  cut_grade TEXT,
  certification TEXT,
  certificate_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- available, partially_used, depleted
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual stone tracking (for high-value stones)
CREATE TABLE public.stone_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  stone_type_id UUID NOT NULL REFERENCES public.stone_types(id),
  lot_id UUID REFERENCES public.stone_lots(id),
  stone_code TEXT NOT NULL,
  carat_weight NUMERIC(8,3) NOT NULL DEFAULT 0,
  shape TEXT,
  color_grade TEXT,
  clarity_grade TEXT,
  cut_grade TEXT,
  dimensions TEXT,
  certification TEXT,
  certificate_number TEXT,
  certificate_url TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  market_value NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'available', -- available, issued, set, sold, returned, lost
  assigned_product_id UUID REFERENCES public.products(id),
  assigned_karigar_id UUID REFERENCES public.karigars(id),
  location TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stone movements (issuance, returns, etc.)
CREATE TABLE public.stone_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  stone_inventory_id UUID REFERENCES public.stone_inventory(id),
  lot_id UUID REFERENCES public.stone_lots(id),
  movement_type TEXT NOT NULL, -- issue_to_karigar, return_from_karigar, set_in_product, transfer, adjustment, loss
  quantity INTEGER NOT NULL DEFAULT 1,
  carat_weight NUMERIC(8,3),
  karigar_id UUID REFERENCES public.karigars(id),
  product_id UUID REFERENCES public.products(id),
  reference_number TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PHASE 14: MELTING / REFINING
-- ============================================

-- Melting batches
CREATE TABLE public.melting_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  batch_number TEXT NOT NULL,
  batch_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metal_type TEXT NOT NULL DEFAULT 'gold',
  input_total_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  input_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of {description, weight, purity, source}
  expected_pure_weight NUMERIC(10,3),
  actual_output_weight NUMERIC(10,3),
  output_purity TEXT,
  actual_pure_weight NUMERIC(10,3),
  weight_loss NUMERIC(10,3),
  loss_percentage NUMERIC(5,2),
  refiner_name TEXT,
  refining_charges NUMERIC(10,2) DEFAULT 0,
  assay_certificate TEXT,
  output_allocation JSONB DEFAULT '[]'::jsonb, -- array of {description, weight, purpose}
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_process, completed, cancelled
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refining records (detailed purity tests)
CREATE TABLE public.refining_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  melting_batch_id UUID REFERENCES public.melting_batches(id),
  record_number TEXT NOT NULL,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metal_type TEXT NOT NULL DEFAULT 'gold',
  sample_weight NUMERIC(10,3) NOT NULL,
  tested_purity TEXT NOT NULL,
  pure_metal_content NUMERIC(10,3),
  testing_method TEXT, -- fire_assay, xrf, touchstone, acid_test, spectrometry
  tested_by TEXT,
  lab_name TEXT,
  lab_certificate TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PHASE 17: APPRAISAL SYSTEM
-- ============================================

-- Appraisal requests
CREATE TABLE public.appraisals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  appraisal_number TEXT NOT NULL,
  appraisal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  customer_phone TEXT,
  purpose TEXT NOT NULL DEFAULT 'valuation', -- valuation, insurance, loan, sale, purchase
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of {description, metal_type, purity, gross_weight, net_weight, stone_details, photos}
  total_items INTEGER NOT NULL DEFAULT 0,
  total_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  total_metal_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_stone_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_making_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  market_rate_gold NUMERIC(10,2),
  market_rate_silver NUMERIC(10,2),
  appraised_by TEXT,
  verified_by TEXT,
  certificate_issued BOOLEAN NOT NULL DEFAULT false,
  certificate_number TEXT,
  validity_days INTEGER DEFAULT 30,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, in_progress, completed, certificate_issued, expired
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appraisal items (detailed per-item breakdown)
CREATE TABLE public.appraisal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_id UUID NOT NULL REFERENCES public.appraisals(id) ON DELETE CASCADE,
  item_number INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  metal_type TEXT NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL,
  gross_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  stone_weight NUMERIC(10,3) DEFAULT 0,
  net_weight NUMERIC(10,3) NOT NULL DEFAULT 0,
  wastage_percent NUMERIC(5,2) DEFAULT 0,
  rate_per_gram NUMERIC(10,2) NOT NULL DEFAULT 0,
  metal_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  stone_type TEXT,
  stone_count INTEGER DEFAULT 0,
  stone_carat NUMERIC(8,3) DEFAULT 0,
  stone_value NUMERIC(12,2) DEFAULT 0,
  making_charge_value NUMERIC(12,2) DEFAULT 0,
  total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'good', -- excellent, good, fair, poor
  hallmark_status TEXT, -- hallmarked, not_hallmarked, unknown
  huid TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.stone_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stone_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stone_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stone_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.melting_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refining_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_items ENABLE ROW LEVEL SECURITY;

-- Stone types (global catalog, read by all authenticated, managed by admins)
CREATE POLICY "Authenticated users can view stone types" ON public.stone_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stone types" ON public.stone_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Stone lots
CREATE POLICY "Authenticated users can view stone lots" ON public.stone_lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stone lots" ON public.stone_lots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Stone inventory
CREATE POLICY "Authenticated users can view stone inventory" ON public.stone_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stone inventory" ON public.stone_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Stone movements
CREATE POLICY "Authenticated users can view stone movements" ON public.stone_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage stone movements" ON public.stone_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Melting batches
CREATE POLICY "Authenticated users can view melting batches" ON public.melting_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage melting batches" ON public.melting_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Refining records
CREATE POLICY "Authenticated users can view refining records" ON public.refining_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage refining records" ON public.refining_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appraisals
CREATE POLICY "Authenticated users can view appraisals" ON public.appraisals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage appraisals" ON public.appraisals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appraisal items
CREATE POLICY "Authenticated users can view appraisal items" ON public.appraisal_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage appraisal items" ON public.appraisal_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_stone_types_updated_at BEFORE UPDATE ON public.stone_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stone_lots_updated_at BEFORE UPDATE ON public.stone_lots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stone_inventory_updated_at BEFORE UPDATE ON public.stone_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_melting_batches_updated_at BEFORE UPDATE ON public.melting_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appraisals_updated_at BEFORE UPDATE ON public.appraisals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed common stone types
INSERT INTO public.stone_types (name, code, category, default_unit) VALUES
  ('Diamond', 'DIA', 'precious', 'carat'),
  ('Ruby', 'RBY', 'precious', 'carat'),
  ('Emerald', 'EMR', 'precious', 'carat'),
  ('Sapphire', 'SAP', 'precious', 'carat'),
  ('Pearl', 'PRL', 'precious', 'piece'),
  ('Coral', 'CRL', 'precious', 'carat'),
  ('Amethyst', 'AMT', 'semi_precious', 'carat'),
  ('Topaz', 'TPZ', 'semi_precious', 'carat'),
  ('Garnet', 'GRN', 'semi_precious', 'carat'),
  ('Turquoise', 'TRQ', 'semi_precious', 'carat'),
  ('Cubic Zirconia', 'CZ', 'synthetic', 'piece'),
  ('American Diamond', 'AD', 'synthetic', 'piece');
