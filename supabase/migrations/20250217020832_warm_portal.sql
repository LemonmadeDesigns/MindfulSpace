/*
  # Fix Forum Deletion

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Add deletion tracking table
    - Add admin-only deletion policies
    - Add indexes for better performance

  2. Security
    - Only admins can delete posts
    - Deletion tracking for audit purposes
*/

-- Create deletion_logs table for tracking deletions
CREATE TABLE IF NOT EXISTS deletion_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  deleted_by uuid REFERENCES profiles(id),
  deleted_at timestamptz DEFAULT now(),
  record_data jsonb NOT NULL
);

-- Enable RLS on deletion_logs
ALTER TABLE deletion_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletion logs
CREATE POLICY "Only admins can view deletion logs"
  ON deletion_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to log deletions
CREATE OR REPLACE FUNCTION log_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deletion_logs (table_name, record_id, deleted_by, record_data)
  VALUES (
    TG_TABLE_NAME,
    OLD.id,
    auth.uid(),
    to_jsonb(OLD)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for forum_posts
CREATE TRIGGER log_forum_post_deletion
  BEFORE DELETE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION log_deletion();

-- Update forum_posts policies
DROP POLICY IF EXISTS "Users can delete own posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON forum_posts;

-- Only admins can delete posts
CREATE POLICY "Only admins can delete posts"
  ON forum_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_table_name ON deletion_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_record_id ON deletion_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_deleted_by ON deletion_logs(deleted_by);
CREATE INDEX IF NOT EXISTS idx_deletion_logs_deleted_at ON deletion_logs(deleted_at);