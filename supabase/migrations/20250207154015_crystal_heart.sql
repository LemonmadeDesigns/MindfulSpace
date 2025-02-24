/*
  # Create forum posts table and policies

  1. New Tables
    - `forum_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `category` (text, required)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `forum_posts` table
    - Add policies for:
      - Anyone can read posts
      - Authenticated users can create posts
      - Users can update and delete their own posts
*/

CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read posts
CREATE POLICY "Anyone can read forum posts"
  ON forum_posts
  FOR SELECT
  USING (true);

-- Policy to allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Policy to allow users to update their own posts
CREATE POLICY "Users can update own posts"
  ON forum_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Policy to allow users to delete their own posts
CREATE POLICY "Users can delete own posts"
  ON forum_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at column
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();