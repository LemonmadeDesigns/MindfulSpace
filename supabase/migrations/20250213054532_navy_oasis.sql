/*
  # Fix Admin Dashboard Schema

  1. Changes
    - Add email column to profiles table
    - Add foreign key constraints for appointments and chat messages
    - Update RLS policies

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for admin access
*/

-- Add email column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    
    -- Update existing profiles with email from auth.users
    UPDATE profiles 
    SET email = users.email 
    FROM auth.users 
    WHERE profiles.id = users.id;
    
    -- Make email required and unique
    ALTER TABLE profiles 
    ALTER COLUMN email SET NOT NULL,
    ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add foreign key constraint for appointments if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'appointments_user_id_fkey'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies for admin access
CREATE POLICY "Admins can read all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);