/*
  # Add cascade delete for support groups

  1. Changes
    - Add cascade delete constraints for support group related tables
    - Ensure all related records are automatically deleted when a group is deleted

  2. Security
    - Maintains existing RLS policies
    - Only allows admins to delete groups and related data
*/

-- Update foreign key constraints for group-related tables
ALTER TABLE group_sessions
DROP CONSTRAINT IF EXISTS group_sessions_group_id_fkey,
ADD CONSTRAINT group_sessions_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES support_groups(id)
  ON DELETE CASCADE;

ALTER TABLE group_indicators
DROP CONSTRAINT IF EXISTS group_indicators_group_id_fkey,
ADD CONSTRAINT group_indicators_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES support_groups(id)
  ON DELETE CASCADE;

ALTER TABLE group_resources
DROP CONSTRAINT IF EXISTS group_resources_group_id_fkey,
ADD CONSTRAINT group_resources_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES support_groups(id)
  ON DELETE CASCADE;

ALTER TABLE group_memberships
DROP CONSTRAINT IF EXISTS group_memberships_group_id_fkey,
ADD CONSTRAINT group_memberships_group_id_fkey
  FOREIGN KEY (group_id)
  REFERENCES support_groups(id)
  ON DELETE CASCADE;