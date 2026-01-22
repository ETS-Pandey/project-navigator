-- Allow the handle_new_user trigger function to insert profiles
-- Since the trigger runs with SECURITY DEFINER and set search_path, 
-- it bypasses RLS. But for completeness, add an INSERT policy.

CREATE POLICY "Service role can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);