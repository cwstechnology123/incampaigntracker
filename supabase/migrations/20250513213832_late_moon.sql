/*
  # Fix profiles table and trigger

  1. Changes
    - Add name column to profiles if not exists
    - Update trigger to properly handle user metadata
    - Ensure proper profile creation on signup
*/

DO $$ 
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name text;
  END IF;
END $$;

-- Update existing profiles to use email as name if name is null
UPDATE public.profiles SET name = email WHERE name IS NULL;

-- Alter name column to be NOT NULL after setting defaults
ALTER TABLE public.profiles ALTER COLUMN name SET NOT NULL;

-- Update the trigger function to properly handle user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'name',
      new.email
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;