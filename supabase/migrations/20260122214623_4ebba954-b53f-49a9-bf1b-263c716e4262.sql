-- Fix security warning 1: Set search_path on functions without it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Fix security warning 2: Replace overly permissive rate_history INSERT policy
DROP POLICY IF EXISTS "Rate history is auto-created" ON public.rate_history;

CREATE POLICY "Rate history insert for authorized users"
  ON public.rate_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_rates dr 
      WHERE dr.id = daily_rate_id 
        AND public.has_branch_access(auth.uid(), dr.branch_id)
        AND public.has_any_role(auth.uid(), ARRAY['owner', 'admin', 'branch_manager']::app_role[])
    )
  );