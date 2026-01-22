-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to assign owner role to first user
CREATE OR REPLACE FUNCTION public.assign_owner_to_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users (excluding the new one)
  SELECT COUNT(*) INTO user_count FROM auth.users WHERE id != NEW.id;
  
  -- If this is the first user, assign owner role
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner');
    
    -- Also give them access to main branch
    INSERT INTO public.user_branch_access (user_id, branch_id, is_primary)
    SELECT NEW.id, id, true FROM public.branches WHERE is_main_branch = true LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to assign owner role after profile creation
DROP TRIGGER IF EXISTS on_first_user_assign_owner ON auth.users;
CREATE TRIGGER on_first_user_assign_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_owner_to_first_user();