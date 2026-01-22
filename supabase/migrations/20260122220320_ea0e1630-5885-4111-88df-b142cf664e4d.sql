-- Create enums for inventory
CREATE TYPE public.metal_color AS ENUM ('yellow', 'white', 'rose', 'two_tone', 'tri_tone');
CREATE TYPE public.making_charge_type AS ENUM ('per_gram', 'percentage', 'flat');
CREATE TYPE public.stock_movement_type AS ENUM ('purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment', 'karigar_issue', 'karigar_receipt', 'return');
CREATE TYPE public.product_status AS ENUM ('in_stock', 'sold', 'on_approval', 'with_karigar', 'in_repair', 'melted');

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  hsn_code TEXT DEFAULT '7113',
  default_making_charge_type making_charge_type DEFAULT 'per_gram',
  default_making_charge_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-categories table
CREATE TABLE public.sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, code)
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  category_id UUID NOT NULL REFERENCES public.categories(id),
  sub_category_id UUID REFERENCES public.sub_categories(id),
  
  -- Basic Info
  item_code TEXT NOT NULL,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Metal Details
  metal_type metal_type NOT NULL DEFAULT 'gold',
  purity TEXT NOT NULL, -- 22K, 18K, 999, 925, etc.
  metal_color metal_color DEFAULT 'yellow',
  
  -- Weight Details (in grams)
  gross_weight NUMERIC NOT NULL,
  stone_weight NUMERIC DEFAULT 0,
  net_weight NUMERIC NOT NULL,
  wastage_percent NUMERIC DEFAULT 0,
  wastage_weight NUMERIC DEFAULT 0,
  total_weight NUMERIC GENERATED ALWAYS AS (net_weight + wastage_weight) STORED,
  
  -- Making Charges
  making_charge_type making_charge_type NOT NULL DEFAULT 'per_gram',
  making_charge_value NUMERIC NOT NULL DEFAULT 0,
  making_charge_amount NUMERIC DEFAULT 0, -- Calculated amount
  
  -- Stone Details (summary - detailed in product_stones)
  has_stones BOOLEAN DEFAULT false,
  stone_count INTEGER DEFAULT 0,
  stone_value NUMERIC DEFAULT 0,
  
  -- HUID/Hallmark
  huid TEXT,
  hallmark_center TEXT,
  hallmark_date DATE,
  is_hallmarked BOOLEAN DEFAULT false,
  
  -- Pricing
  metal_value NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  mrp NUMERIC,
  wholesale_price NUMERIC,
  
  -- Stock Info
  status product_status NOT NULL DEFAULT 'in_stock',
  location TEXT, -- Shelf/Tray location
  supplier_id UUID, -- Reference to vendor
  purchase_date DATE,
  purchase_invoice TEXT,
  
  -- Catalog
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(branch_id, item_code)
);

-- Product Images table
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Stones table (for detailed stone info)
CREATE TABLE public.product_stones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stone_type TEXT NOT NULL, -- Diamond, Ruby, Emerald, etc.
  stone_shape TEXT, -- Round, Oval, Princess, etc.
  stone_count INTEGER NOT NULL DEFAULT 1,
  carat_weight NUMERIC,
  color TEXT,
  clarity TEXT,
  cut TEXT,
  certification TEXT,
  certificate_number TEXT,
  stone_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock Movements table
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id),
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  movement_type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  reference_type TEXT, -- invoice, purchase, transfer, adjustment
  reference_id UUID,
  reference_number TEXT,
  from_location TEXT,
  to_location TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Categories policies (viewable by all authenticated, manageable by admins)
CREATE POLICY "Authenticated users can view categories"
ON public.categories FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner', 'admin', 'catalog_manager']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner', 'admin', 'catalog_manager']::app_role[]));

-- Sub-categories policies
CREATE POLICY "Authenticated users can view sub_categories"
ON public.sub_categories FOR SELECT TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage sub_categories"
ON public.sub_categories FOR ALL TO authenticated
USING (has_any_role(auth.uid(), ARRAY['owner', 'admin', 'catalog_manager']::app_role[]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['owner', 'admin', 'catalog_manager']::app_role[]));

-- Products policies (branch-based access)
CREATE POLICY "Users can view products in accessible branches"
ON public.products FOR SELECT TO authenticated
USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can manage products"
ON public.products FOR ALL TO authenticated
USING (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[]))
WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[]));

-- Product images policies
CREATE POLICY "Users can view product images"
ON public.product_images FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id)));

CREATE POLICY "Authorized users can manage product images"
ON public.product_images FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[])))
WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[])));

-- Product stones policies
CREATE POLICY "Users can view product stones"
ON public.product_stones FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id)));

CREATE POLICY "Authorized users can manage product stones"
ON public.product_stones FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[])))
WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND has_branch_access(auth.uid(), p.branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive', 'catalog_manager']::app_role[])));

-- Stock movements policies
CREATE POLICY "Users can view stock movements in accessible branches"
ON public.stock_movements FOR SELECT TO authenticated
USING (has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Authorized users can create stock movements"
ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (has_branch_access(auth.uid(), branch_id) AND has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager', 'sales_executive']::app_role[]));

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_categories_updated_at
  BEFORE UPDATE ON public.sub_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_products_branch_id ON public.products(branch_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_item_code ON public.products(item_code);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

-- Insert default categories
INSERT INTO public.categories (name, code, hsn_code, display_order) VALUES
('Rings', 'RING', '7113', 1),
('Necklaces', 'NECK', '7113', 2),
('Earrings', 'EAR', '7113', 3),
('Bangles', 'BANG', '7113', 4),
('Bracelets', 'BRAC', '7113', 5),
('Chains', 'CHAIN', '7113', 6),
('Pendants', 'PEND', '7113', 7),
('Mangalsutra', 'MANG', '7113', 8),
('Nose Pins', 'NOSE', '7113', 9),
('Anklets', 'ANK', '7113', 10),
('Toe Rings', 'TOE', '7113', 11),
('Coins & Bars', 'COIN', '7118', 12),
('Wedding Sets', 'WED', '7113', 13),
('Temple Jewellery', 'TEMP', '7113', 14),
('Silver Articles', 'SILV', '7114', 15);