/*
  # Admin Policies for Support Groups and Related Tables

  1. Changes
    - Drop existing policies to avoid conflicts
    - Create admin-only policies for support groups
    - Create admin-only policies for group sessions
    - Create admin-only policies for group indicators
    - Create admin-only policies for group resources

  2. Security
    - All policies require admin role
    - Policies cover INSERT, UPDATE, and DELETE operations
    - Existing SELECT policies remain unchanged
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Support Groups policies
  DROP POLICY IF EXISTS "Admins can insert support groups" ON support_groups;
  DROP POLICY IF EXISTS "Admins can update support groups" ON support_groups;
  DROP POLICY IF EXISTS "Admins can delete support groups" ON support_groups;

  -- Group Sessions policies
  DROP POLICY IF EXISTS "Admins can insert group sessions" ON group_sessions;
  DROP POLICY IF EXISTS "Admins can update group sessions" ON group_sessions;
  DROP POLICY IF EXISTS "Admins can delete group sessions" ON group_sessions;

  -- Group Indicators policies
  DROP POLICY IF EXISTS "Admins can insert group indicators" ON group_indicators;
  DROP POLICY IF EXISTS "Admins can update group indicators" ON group_indicators;
  DROP POLICY IF EXISTS "Admins can delete group indicators" ON group_indicators;

  -- Group Resources policies
  DROP POLICY IF EXISTS "Admins can insert group resources" ON group_resources;
  DROP POLICY IF EXISTS "Admins can update group resources" ON group_resources;
  DROP POLICY IF EXISTS "Admins can delete group resources" ON group_resources;
END $$;

-- Support Groups Policies
CREATE POLICY "Admins can insert support groups"
  ON support_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update support groups"
  ON support_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete support groups"
  ON support_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Group Sessions Policies
CREATE POLICY "Admins can insert group sessions"
  ON group_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update group sessions"
  ON group_sessions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete group sessions"
  ON group_sessions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Group Indicators Policies
CREATE POLICY "Admins can insert group indicators"
  ON group_indicators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update group indicators"
  ON group_indicators
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete group indicators"
  ON group_indicators
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Group Resources Policies
CREATE POLICY "Admins can insert group resources"
  ON group_resources
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update group resources"
  ON group_resources
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete group resources"
  ON group_resources
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );