-- Migration to allow authenticated users to insert their own admin_profile row

-- Drop policy if it exists to ensure idempotency
DROP POLICY IF EXISTS "Allow individual insert access" ON public.admin_profiles;

-- Create policy allowing insert only for the user's own ID
CREATE POLICY "Allow individual insert access" ON public.admin_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

COMMENT ON POLICY "Allow individual insert access" ON public.admin_profiles
  IS 'Authenticated users can insert their own profile row.'; 