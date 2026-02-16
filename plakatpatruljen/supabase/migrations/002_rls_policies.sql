-- Row Level Security Policies for PlakatPatruljen

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE poster_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM user_profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Organizations
CREATE POLICY "Organizations visible to members" ON organizations FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = id AND user_id = auth.uid())
    OR get_user_role() = 'platform_admin'
);
CREATE POLICY "Org admins can update" ON organizations FOR UPDATE USING (is_org_admin(id));
CREATE POLICY "Authenticated users can create orgs" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Organization Members
CREATE POLICY "Members can view org members" ON organization_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid())
);
CREATE POLICY "Org admins can manage members" ON organization_members FOR INSERT WITH CHECK (is_org_admin(organization_id));
CREATE POLICY "Org admins can update members" ON organization_members FOR UPDATE USING (is_org_admin(organization_id));
CREATE POLICY "Org admins can remove members" ON organization_members FOR DELETE USING (is_org_admin(organization_id));

-- Campaigns
CREATE POLICY "Active campaigns visible to all authenticated" ON campaigns FOR SELECT USING (
    status = 'active' OR
    EXISTS (SELECT 1 FROM organization_members WHERE organization_id = campaigns.organization_id AND user_id = auth.uid())
);
CREATE POLICY "Org admins can create campaigns" ON campaigns FOR INSERT WITH CHECK (is_org_admin(organization_id));
CREATE POLICY "Org admins can update campaigns" ON campaigns FOR UPDATE USING (is_org_admin(organization_id));
CREATE POLICY "Org admins can delete draft campaigns" ON campaigns FOR DELETE USING (is_org_admin(organization_id) AND status = 'draft');

-- Campaign Zones
CREATE POLICY "Zones visible with campaign" ON campaign_zones FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (
        c.status = 'active' OR
        EXISTS (SELECT 1 FROM organization_members WHERE organization_id = c.organization_id AND user_id = auth.uid())
    ))
);
CREATE POLICY "Org admins can manage zones" ON campaign_zones FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);
CREATE POLICY "Org admins can update zones" ON campaign_zones FOR UPDATE USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);
CREATE POLICY "Org admins can delete zones" ON campaign_zones FOR DELETE USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);

-- Pickup Locations
CREATE POLICY "Pickup locations visible with campaign" ON pickup_locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND (
        c.status = 'active' OR
        EXISTS (SELECT 1 FROM organization_members WHERE organization_id = c.organization_id AND user_id = auth.uid())
    ))
);
CREATE POLICY "Org admins can manage pickup locations" ON pickup_locations FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);

-- Worker Profiles
CREATE POLICY "Workers can view own profile" ON worker_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Org admins can view workers" ON worker_profiles FOR SELECT USING (get_user_role() = 'party_admin');
CREATE POLICY "Workers can update own profile" ON worker_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Workers can create own profile" ON worker_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Task Claims
CREATE POLICY "Workers can view own claims" ON task_claims FOR SELECT USING (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Org admins can view campaign claims" ON task_claims FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);
CREATE POLICY "Workers can create claims" ON task_claims FOR INSERT WITH CHECK (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Workers can update own claims" ON task_claims FOR UPDATE USING (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);

-- Poster Logs
CREATE POLICY "Workers can view own logs" ON poster_logs FOR SELECT USING (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Org admins can view campaign logs" ON poster_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);
CREATE POLICY "Workers can create logs" ON poster_logs FOR INSERT WITH CHECK (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);

-- Payments
CREATE POLICY "Workers can view own payments" ON payments FOR SELECT USING (
    worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Org admins can view campaign payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = campaign_id AND is_org_admin(c.organization_id))
);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Push Tokens
CREATE POLICY "Users can manage own push tokens" ON push_tokens FOR ALL USING (user_id = auth.uid());
