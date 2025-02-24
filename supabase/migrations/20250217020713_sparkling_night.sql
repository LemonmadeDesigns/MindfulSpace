-- Create user_status table for tracking online status
CREATE TABLE IF NOT EXISTS user_status (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now()
);

-- Enable RLS on user_status
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Policies for user_status
CREATE POLICY "Users can update their own status"
  ON user_status
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view user status"
  ON user_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Add read_at column to chat_messages for read receipts
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Create function to update read_at timestamp
CREATE OR REPLACE FUNCTION update_message_read_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for read_at updates
CREATE TRIGGER update_message_read_at
  BEFORE UPDATE OF read
  ON chat_messages
  FOR EACH ROW
  WHEN (NEW.read = true AND OLD.read = false)
  EXECUTE FUNCTION update_message_read_at();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);
CREATE INDEX IF NOT EXISTS idx_user_status_is_online ON user_status(is_online);