/*
  # Support Groups Schema

  1. New Tables
    - `support_groups`
      - Basic group information
      - Capacity and member tracking
      - Meeting schedules
    - `group_memberships`
      - Tracks user group memberships
    - `group_indicators`
      - Stores emotional indicators for group matching
    - `group_resources`
      - Available resources for each group

  2. Security
    - Enable RLS on all tables
    - Policies for reading and joining groups
*/

-- Support Groups Table
CREATE TABLE IF NOT EXISTS support_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  capacity integer NOT NULL,
  current_members integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;

-- Group Memberships Table
CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- Group Indicators Table
CREATE TABLE IF NOT EXISTS group_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  indicator text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_indicators ENABLE ROW LEVEL SECURITY;

-- Group Resources Table
CREATE TABLE IF NOT EXISTS group_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  resource text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_resources ENABLE ROW LEVEL SECURITY;

-- Group Sessions Table
CREATE TABLE IF NOT EXISTS group_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  session_time text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_sessions ENABLE ROW LEVEL SECURITY;

-- Policies

-- Support Groups Policies
CREATE POLICY "Anyone can view support groups"
  ON support_groups
  FOR SELECT
  USING (true);

-- Group Memberships Policies
CREATE POLICY "Users can view their group memberships"
  ON group_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join groups"
  ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_memberships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Group Indicators Policies
CREATE POLICY "Anyone can view group indicators"
  ON group_indicators
  FOR SELECT
  USING (true);

-- Group Resources Policies
CREATE POLICY "Anyone can view group resources"
  ON group_resources
  FOR SELECT
  USING (true);

-- Group Sessions Policies
CREATE POLICY "Anyone can view group sessions"
  ON group_sessions
  FOR SELECT
  USING (true);

-- Function to update member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE support_groups
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE support_groups
    SET current_members = current_members - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member count updates
CREATE TRIGGER update_member_count
  AFTER INSERT OR DELETE ON group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- Insert initial support groups
INSERT INTO support_groups (name, description, capacity) VALUES
  ('Criminal & Gang Anonymous (CGA)', 'Support for individuals seeking to leave criminal lifestyles and gang affiliations.', 20),
  ('Alcoholics Anonymous (AA)', 'Support for individuals recovering from alcohol addiction.', 30),
  ('Narcotics Anonymous (NA)', 'Support for individuals recovering from drug addiction.', 30),
  ('Emotional Intelligence Development', 'Learn to understand and manage emotions effectively.', 25),
  ('Anger Management', 'Develop skills to manage anger and aggressive responses.', 20);

-- Insert indicators for each group
INSERT INTO group_indicators (group_id, indicator)
SELECT id, unnest(ARRAY['Angry', 'Stressed', 'Anxious'])
FROM support_groups
WHERE name = 'Criminal & Gang Anonymous (CGA)';

INSERT INTO group_indicators (group_id, indicator)
SELECT id, unnest(ARRAY['Stressed', 'Overwhelmed', 'Tired'])
FROM support_groups
WHERE name = 'Alcoholics Anonymous (AA)';

INSERT INTO group_indicators (group_id, indicator)
SELECT id, unnest(ARRAY['Anxious', 'Overwhelmed', 'Tired'])
FROM support_groups
WHERE name = 'Narcotics Anonymous (NA)';

INSERT INTO group_indicators (group_id, indicator)
SELECT id, unnest(ARRAY['Stressed', 'Overwhelmed', 'Sad'])
FROM support_groups
WHERE name = 'Emotional Intelligence Development';

INSERT INTO group_indicators (group_id, indicator)
SELECT id, unnest(ARRAY['Angry', 'Stressed', 'Overwhelmed'])
FROM support_groups
WHERE name = 'Anger Management';

-- Insert meeting times for each group
INSERT INTO group_sessions (group_id, session_time)
SELECT id, unnest(ARRAY['Monday 7PM', 'Thursday 7PM'])
FROM support_groups
WHERE name = 'Criminal & Gang Anonymous (CGA)';

INSERT INTO group_sessions (group_id, session_time)
SELECT id, unnest(ARRAY['Daily 6PM', 'Saturday 10AM'])
FROM support_groups
WHERE name = 'Alcoholics Anonymous (AA)';

INSERT INTO group_sessions (group_id, session_time)
SELECT id, unnest(ARRAY['Daily 8PM', 'Sunday 11AM'])
FROM support_groups
WHERE name = 'Narcotics Anonymous (NA)';

INSERT INTO group_sessions (group_id, session_time)
SELECT id, unnest(ARRAY['Tuesday 6PM', 'Saturday 2PM'])
FROM support_groups
WHERE name = 'Emotional Intelligence Development';

INSERT INTO group_sessions (group_id, session_time)
SELECT id, unnest(ARRAY['Wednesday 7PM', 'Saturday 3PM'])
FROM support_groups
WHERE name = 'Anger Management';

-- Insert resources for each group
INSERT INTO group_resources (group_id, resource)
SELECT id, unnest(ARRAY['Counseling', 'Job Training', 'Legal Aid'])
FROM support_groups
WHERE name = 'Criminal & Gang Anonymous (CGA)';

INSERT INTO group_resources (group_id, resource)
SELECT id, unnest(ARRAY['12-Step Program', 'Sponsor System', 'Recovery Literature'])
FROM support_groups
WHERE name = 'Alcoholics Anonymous (AA)';

INSERT INTO group_resources (group_id, resource)
SELECT id, unnest(ARRAY['Recovery Program', 'Peer Support', 'Crisis Hotline'])
FROM support_groups
WHERE name = 'Narcotics Anonymous (NA)';

INSERT INTO group_resources (group_id, resource)
SELECT id, unnest(ARRAY['Workshops', 'Personal Development', 'Mindfulness Training'])
FROM support_groups
WHERE name = 'Emotional Intelligence Development';

INSERT INTO group_resources (group_id, resource)
SELECT id, unnest(ARRAY['Coping Strategies', 'Stress Management', 'Communication Skills'])
FROM support_groups
WHERE name = 'Anger Management';