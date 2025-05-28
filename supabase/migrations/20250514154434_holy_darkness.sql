/*
  # Fix profiles table constraints and defaults

  1. Changes
    - Add NOT NULL constraint to email column
    - Ensure all columns have appropriate default values
    - Update existing records to comply with new constraints
*/

-- Ensure email is NOT NULL and has appropriate default
ALTER TABLE public.profiles 
  ALTER COLUMN email SET NOT NULL;

-- Update any existing NULL values
UPDATE public.profiles 
SET email = COALESCE(email, id::text),
    name = COALESCE(name, email),
    updated_at = COALESCE(updated_at, now());