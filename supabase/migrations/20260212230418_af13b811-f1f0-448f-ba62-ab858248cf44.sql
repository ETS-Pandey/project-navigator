
-- Phase 18 & 19: Online Catalog + Customer Portal

-- Catalog inquiries / cart submissions
CREATE TABLE public.catalog_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES public.branches(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_id UUID REFERENCES public.customers(id),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_estimated_value NUMERIC DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  inquiry_number TEXT NOT NULL,
  responded_by UUID,
  responded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage catalog inquiries"
  ON public.catalog_inquiries FOR ALL
  USING (true) WITH CHECK (true);

-- Customer wishlist
CREATE TABLE public.customer_wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id),
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wishlists are publicly accessible"
  ON public.customer_wishlists FOR ALL
  USING (true) WITH CHECK (true);

-- Customer portal OTP tokens
CREATE TABLE public.customer_otp_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT,
  email TEXT,
  otp_code TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_otp_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OTP tokens managed by system"
  ON public.customer_otp_tokens FOR ALL
  USING (true) WITH CHECK (true);

-- Customer portal sessions
CREATE TABLE public.customer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions managed by system"
  ON public.customer_sessions FOR ALL
  USING (true) WITH CHECK (true);

-- Triggers
CREATE TRIGGER update_catalog_inquiries_updated_at
  BEFORE UPDATE ON public.catalog_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
