/*
  # Fix chat messages profile relationships

  1. Changes
    - Add explicit foreign key constraints for user and admin profiles
    - Update RLS policies to handle both relationships
    - Add indexes for better query performance
*/

-- Drop existing foreign key constraints if they exist
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey,
DROP CONSTRAINT IF EXISTS chat_messages_admin_id_fkey;

-- Add explicit foreign key constraints with names
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT chat_messages_admin_id_fkey 
  FOREIGN KEY (admin_id) 
  REFERENCES profiles(id) 
  ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_admin_id ON chat_messages(admin_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = admin_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );