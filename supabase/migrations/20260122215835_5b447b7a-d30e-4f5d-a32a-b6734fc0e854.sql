-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- The handle_new_user() function uses SECURITY DEFINER which bypasses RLS
-- So no INSERT policy is actually needed for profiles table
-- Profiles should only be created via the auth trigger