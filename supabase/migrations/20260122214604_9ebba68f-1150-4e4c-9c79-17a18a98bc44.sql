-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM (
  'owner',
  'admin',
  'branch_manager',
  'accountant',
  'sales_executive',
  'loan_officer',
  'appraiser',
  'catalog_manager',
  'karigar_admin',
  'auditor',
  'customer'
);

-- Create metal_type enum
CREATE TYPE public.metal_type AS ENUM ('gold', 'silver', 'platinum', 'palladium');

-- Create purity enum for gold/silver
CREATE TYPE public.gold_purity AS ENUM ('24K', '22K', '18K', '14K', '10K');
CREATE TYPE public.silver_purity AS ENUM ('999', '925', '900', '800');

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Branches table
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_main_branch BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User branch access (which users can access which branches)
CREATE TABLE public.user_branch_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, branch_id)
);

-- Daily rates table
CREATE TABLE public.daily_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Gold rates (per gram)
  gold_24k_buy DECIMAL(12,2) NOT NULL,
  gold_24k_sell DECIMAL(12,2) NOT NULL,
  gold_22k_buy DECIMAL(12,2),
  gold_22k_sell DECIMAL(12,2),
  gold_18k_buy DECIMAL(12,2),
  gold_18k_sell DECIMAL(12,2),
  gold_14k_buy DECIMAL(12,2),
  gold_14k_sell DECIMAL(12,2),
  
  -- Silver rates (per gram)
  silver_999_buy DECIMAL(12,2),
  silver_999_sell DECIMAL(12,2),
  silver_925_buy DECIMAL(12,2),
  silver_925_sell DECIMAL(12,2),
  
  -- Platinum rates (per gram)
  platinum_buy DECIMAL(12,2),
  platinum_sell DECIMAL(12,2),
  
  -- Wholesale discount percentage
  wholesale_discount_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Metadata
  set_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE (branch_id, rate_date)
);

-- Rate history for tracking changes
CREATE TABLE public.rate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_rate_id UUID REFERENCES public.daily_rates(id) ON DELETE CASCADE NOT NULL,
  metal_type metal_type NOT NULL,
  purity TEXT NOT NULL,
  old_buy_rate DECIMAL(12,2),
  new_buy_rate DECIMAL(12,2) NOT NULL,
  old_sell_rate DECIMAL(12,2),
  new_sell_rate DECIMAL(12,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Function to get user's primary branch
CREATE OR REPLACE FUNCTION public.get_user_primary_branch(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id
  FROM public.user_branch_access
  WHERE user_id = _user_id
    AND is_primary = true
  LIMIT 1
$$;

-- Function to check branch access
CREATE OR REPLACE FUNCTION public.has_branch_access(_user_id UUID, _branch_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_branch_access
    WHERE user_id = _user_id
      AND branch_id = _branch_id
  ) OR public.has_any_role(_user_id, ARRAY['owner', 'admin']::app_role[])
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_rates_updated_at
  BEFORE UPDATE ON public.daily_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_branch_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

CREATE POLICY "Only owners can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'owner'))
  WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- RLS Policies for branches
CREATE POLICY "Authenticated users can view active branches"
  ON public.branches FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage branches"
  ON public.branches FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- RLS Policies for user_branch_access
CREATE POLICY "Users can view their own branch access"
  ON public.user_branch_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all branch access"
  ON public.user_branch_access FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

CREATE POLICY "Admins can manage branch access"
  ON public.user_branch_access FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['owner', 'admin']::app_role[]));

-- RLS Policies for daily_rates
CREATE POLICY "Users can view rates for accessible branches"
  ON public.daily_rates FOR SELECT
  TO authenticated
  USING (public.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "Branch managers and above can manage rates"
  ON public.daily_rates FOR ALL
  TO authenticated
  USING (
    public.has_branch_access(auth.uid(), branch_id) 
    AND public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
  )
  WITH CHECK (
    public.has_branch_access(auth.uid(), branch_id) 
    AND public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
  );

-- RLS Policies for rate_history
CREATE POLICY "Users can view rate history for accessible branches"
  ON public.rate_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.daily_rates dr 
      WHERE dr.id = daily_rate_id 
        AND public.has_branch_access(auth.uid(), dr.branch_id)
    )
  );

CREATE POLICY "Rate history is auto-created"
  ON public.rate_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default main branch
INSERT INTO public.branches (name, code, is_main_branch, is_active)
VALUES ('Main Branch', 'MAIN', true, true);