-- PlakatPatruljen Initial Schema
-- Two-sided marketplace for Danish election poster logistics

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Custom types
CREATE TYPE election_type AS ENUM ('kommunal', 'regional', 'folketings', 'europa');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE task_type AS ENUM ('hang', 'remove');
CREATE TYPE task_status AS ENUM ('claimed', 'in_progress', 'completed', 'expired', 'cancelled');
CREATE TYPE user_role AS ENUM ('party_admin', 'worker', 'platform_admin');
CREATE TYPE notification_type AS ENUM ('task_available', 'task_expiring', 'payment_sent', 'campaign_update', 'system');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'member');

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Organizations (political parties/organizations)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cvr_number TEXT NOT NULL UNIQUE,
    party_name TEXT NOT NULL,
    party_color TEXT NOT NULL DEFAULT '#333333',
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role org_member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    election_type election_type NOT NULL,
    election_date DATE NOT NULL,
    hanging_start DATE NOT NULL,
    removal_deadline DATE NOT NULL,
    poster_count INTEGER NOT NULL DEFAULT 0,
    posters_hung INTEGER NOT NULL DEFAULT 0,
    posters_removed INTEGER NOT NULL DEFAULT 0,
    price_per_poster_hang NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_per_poster_remove NUMERIC(10,2) NOT NULL DEFAULT 0,
    status campaign_status NOT NULL DEFAULT 'draft',
    description TEXT,
    poster_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign zones (geographic areas for poster distribution)
CREATE TABLE campaign_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    geojson JSONB NOT NULL,
    geometry GEOMETRY(Polygon, 4326),
    poster_count INTEGER NOT NULL DEFAULT 0,
    posters_assigned INTEGER NOT NULL DEFAULT 0,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pickup locations
CREATE TABLE pickup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    available_posters INTEGER NOT NULL DEFAULT 0,
    open_hours TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Worker profiles
CREATE TABLE worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    rating NUMERIC(3,2) NOT NULL DEFAULT 0,
    total_posters_hung INTEGER NOT NULL DEFAULT 0,
    total_posters_removed INTEGER NOT NULL DEFAULT 0,
    total_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    preferred_zones UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Task claims (workers claiming poster hanging/removal tasks)
CREATE TABLE task_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES campaign_zones(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    type task_type NOT NULL,
    poster_count INTEGER NOT NULL DEFAULT 0,
    posters_completed INTEGER NOT NULL DEFAULT 0,
    status task_status NOT NULL DEFAULT 'claimed',
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Poster logs (individual poster hang/remove events with photo proof)
CREATE TABLE poster_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_claim_id UUID NOT NULL REFERENCES task_claims(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    type task_type NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    address TEXT,
    notes TEXT,
    rule_violations TEXT[] DEFAULT '{}',
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
    task_claim_id UUID REFERENCES task_claims(id),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    poster_count INTEGER NOT NULL DEFAULT 0,
    type task_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'system',
    data JSONB,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Push tokens for notifications
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, token)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_election_date ON campaigns(election_date);
CREATE INDEX idx_campaign_zones_campaign_id ON campaign_zones(campaign_id);
CREATE INDEX idx_campaign_zones_geometry ON campaign_zones USING GIST(geometry);
CREATE INDEX idx_pickup_locations_campaign_id ON pickup_locations(campaign_id);
CREATE INDEX idx_pickup_locations_location ON pickup_locations USING GIST(location);
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_task_claims_campaign_id ON task_claims(campaign_id);
CREATE INDEX idx_task_claims_worker_id ON task_claims(worker_id);
CREATE INDEX idx_task_claims_zone_id ON task_claims(zone_id);
CREATE INDEX idx_task_claims_status ON task_claims(status);
CREATE INDEX idx_poster_logs_task_claim_id ON poster_logs(task_claim_id);
CREATE INDEX idx_poster_logs_campaign_id ON poster_logs(campaign_id);
CREATE INDEX idx_poster_logs_worker_id ON poster_logs(worker_id);
CREATE INDEX idx_poster_logs_location ON poster_logs USING GIST(location);
CREATE INDEX idx_payments_worker_id ON payments(worker_id);
CREATE INDEX idx_payments_campaign_id ON payments(campaign_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_task_claims_updated_at BEFORE UPDATE ON task_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at();
