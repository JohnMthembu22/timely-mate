-- Timely Mate: auto-create profile when a user registers via Supabase Auth
-- Run in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    organization_name,
    role,
    department,
    permissions,
    company_profile,
    selected_plan
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'general'),
    '{}'::jsonb,
    CASE
      WHEN NEW.raw_user_meta_data->'company_profile' IS NOT NULL
      THEN NEW.raw_user_meta_data->'company_profile'
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'selected_plan'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    organization_name = COALESCE(NULLIF(EXCLUDED.organization_name, ''), profiles.organization_name),
    role = COALESCE(NULLIF(EXCLUDED.role, ''), profiles.role),
    department = COALESCE(NULLIF(EXCLUDED.department, ''), profiles.department),
    company_profile = COALESCE(EXCLUDED.company_profile, profiles.company_profile),
    selected_plan = COALESCE(EXCLUDED.selected_plan, profiles.selected_plan),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
