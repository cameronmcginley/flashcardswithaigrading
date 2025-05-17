-- Function to add a default category when a new user is created
CREATE OR REPLACE FUNCTION public.ensure_default_category()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Create a default category for the new user
  INSERT INTO public.categories (profile_id, name)
  VALUES (NEW.id, 'Default');
  
  RETURN NEW;
END $$;

-- Add trigger to run after a new profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_default_category();

-- Add Default category for all existing users who don't have one
INSERT INTO public.categories (profile_id, name)
SELECT p.id, 'Default'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM categories c 
  WHERE c.profile_id = p.id 
  AND c.name = 'Default'
  AND c.deleted_at IS NULL
); 