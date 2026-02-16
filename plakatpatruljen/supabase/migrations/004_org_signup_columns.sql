-- Migration: Add missing columns for org signup flow
-- These changes were previously applied manually to the database.

-- Add missing columns to organizations table
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS zip_code TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE organizations ALTER COLUMN party_name DROP NOT NULL;
ALTER TABLE organizations ALTER COLUMN party_name SET DEFAULT '';

-- Fix RLS policies for organization_members
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
CREATE POLICY "Members can view org members" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Org admins can manage members" ON organization_members;
CREATE POLICY "Org admins can manage members" ON organization_members
  FOR INSERT WITH CHECK (
    is_org_admin(organization_id)
    OR EXISTS (SELECT 1 FROM organizations WHERE id = organization_id AND created_by = auth.uid())
  );

-- Fix RLS policies for organizations
DROP POLICY IF EXISTS "Organizations visible to members" ON organizations;
CREATE POLICY "Organizations visible to members" ON organizations
  FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM organization_members WHERE organization_id = id AND user_id = auth.uid())
    OR get_user_role() = 'platform_admin'
  );

DROP POLICY IF EXISTS "Org admins can update" ON organizations;
CREATE POLICY "Org admins can update" ON organizations
  FOR UPDATE USING (is_org_admin(id) OR created_by = auth.uid());
