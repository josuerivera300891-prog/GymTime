-- 1. Create staff_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    auth_user_id UUID NOT NULL UNIQUE,
    role text NOT NULL DEFAULT 'STAFF',
    -- using text to be safe if enum mismatch
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 2. Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- Add others if they exist (payments, etc) but these are the core ones seen.
-- 3. Create Helper Function
CREATE OR REPLACE FUNCTION get_auth_tenant_id() RETURNS UUID AS $$
SELECT tenant_id
FROM staff_users
WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE;
-- 4. Create Policies (Drop first to avoid conflicts)
-- Tenants
DROP POLICY IF EXISTS "SuperAdmins see all tenants" ON tenants;
DROP POLICY IF EXISTS "Owners see their own tenant" ON tenants;
CREATE POLICY "Owners see their own tenant" ON tenants FOR
SELECT USING (id = get_auth_tenant_id());
-- Staff Users
DROP POLICY IF EXISTS "Staff see users in their tenant" ON staff_users;
DROP POLICY IF EXISTS "Owners manage users in their tenant" ON staff_users;
CREATE POLICY "Staff see users in their tenant" ON staff_users FOR
SELECT USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "Owners manage users in their tenant" ON staff_users FOR ALL USING (
    tenant_id = get_auth_tenant_id()
    AND EXISTS (
        SELECT 1
        FROM staff_users
        WHERE auth_user_id = auth.uid()
            AND role = 'OWNER'
    )
);
-- Members
DROP POLICY IF EXISTS "Tenants see their own members" ON members;
CREATE POLICY "Tenants see their own members" ON members FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Memberships
DROP POLICY IF EXISTS "Tenants see their own memberships" ON memberships;
CREATE POLICY "Tenants see their own memberships" ON memberships FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Attendance
DROP POLICY IF EXISTS "Tenants see their own attendance" ON attendance;
CREATE POLICY "Tenants see their own attendance" ON attendance FOR ALL USING (tenant_id = get_auth_tenant_id());