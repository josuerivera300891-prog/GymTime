-- INIT SCHEMA FOR GYMTIME
-- 1. Create enum types
CREATE TYPE user_role AS ENUM ('SUPERADMIN', 'OWNER', 'STAFF', 'MEMBER');
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE membership_status AS ENUM ('ACTIVE', 'EXPIRING', 'EXPIRED');
CREATE TYPE reminder_type AS ENUM (
    'REMINDER_5D',
    'REMINDER_2D',
    'DUE_TODAY',
    'RECOVERY_3D'
);
-- 2. Tenants (Gyms)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    currency_symbol TEXT NOT NULL DEFAULT 'Q',
    currency_code TEXT NOT NULL DEFAULT 'GTQ',
    timezone TEXT NOT NULL DEFAULT 'America/Guatemala',
    status tenant_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 3. Staff Users (Mapping Auth Users to Tenants)
CREATE TABLE staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    auth_user_id UUID NOT NULL UNIQUE,
    -- References auth.users(id)
    role user_role NOT NULL DEFAULT 'STAFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 4. Members
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    status membership_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 5. Memberships
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    -- Denormalized for RLS
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY',
    last_payment_date TIMESTAMPTZ,
    next_due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 6. Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    method TEXT NOT NULL,
    -- e.g. 'CASH', 'CARD', 'TRANSFER'
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 7. Reminders Log (Idempotency)
CREATE TABLE reminders_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type reminder_type NOT NULL,
    triggered_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (member_id, type, triggered_on)
);
-- 8. Twilio Accounts (Admin only)
CREATE TABLE twilio_accounts (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    account_sid TEXT NOT NULL,
    auth_token TEXT NOT NULL,
    -- Should be encrypted in a real prod env
    whatsapp_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING'
);
-- 9. Member Devices (PWA Push)
CREATE TABLE member_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    push_endpoint TEXT NOT NULL,
    push_p256dh TEXT NOT NULL,
    push_auth TEXT NOT NULL,
    platform TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 10. Push Outbox
CREATE TABLE push_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    device_id UUID REFERENCES member_devices(id) ON DELETE
    SET NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL DEFAULT 'PENDING',
        -- PENDING, SENT, FAILED
        sent_at TIMESTAMPTZ,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ENABLE RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_outbox ENABLE ROW LEVEL SECURITY;
-- POLICIES
-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_auth_tenant_id() RETURNS UUID AS $$
SELECT tenant_id
FROM staff_users
WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE;
-- Tenants Policy
CREATE POLICY "SuperAdmins see all tenants" ON tenants FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE auth_user_id = auth.uid()
            AND role = 'SUPERADMIN'
    )
);
CREATE POLICY "Owners see their own tenant" ON tenants FOR
SELECT USING (id = get_auth_tenant_id());
-- Staff Users Policy
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
-- Members Policy
CREATE POLICY "Tenants see their own members" ON members FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Memberships Policy
CREATE POLICY "Tenants see their own memberships" ON memberships FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Payments Policy
CREATE POLICY "Tenants see their own payments" ON payments FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Reminders Log Policy
CREATE POLICY "Tenants see their own reminders log" ON reminders_log FOR ALL USING (tenant_id = get_auth_tenant_id());
-- Twilio Accounts Policy (Highly sensitive)
CREATE POLICY "SuperAdmins see all twilio accounts" ON twilio_accounts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM staff_users
        WHERE auth_user_id = auth.uid()
            AND role = 'SUPERADMIN'
    )
);
CREATE POLICY "Owners see their own twilio account" ON twilio_accounts FOR
SELECT USING (tenant_id = get_auth_tenant_id());
-- Member Devices Policy
CREATE POLICY "Tenants see their member devices" ON member_devices FOR
SELECT USING (tenant_id = get_auth_tenant_id());
-- Push Outbox Policy
CREATE POLICY "Tenants see their push outbox" ON push_outbox FOR ALL USING (tenant_id = get_auth_tenant_id());
-- MEMBER ACCESS (PWA)
-- Since members access via magic link or PIN, we might need a separate mechanism.
-- For now, let's assume they might be authenticated with role 'MEMBER'
-- Or we use a public access with a secret token for specific queries.
-- Let's add an 'auth_token' to members just in case.
ALTER TABLE members
ADD COLUMN auth_token UUID DEFAULT gen_random_uuid();
CREATE POLICY "Members see their own data via token" ON members FOR
SELECT USING (
        auth_token::text = current_setting('app.member_token', true)
    );
CREATE POLICY "Members see their own membership via token" ON memberships FOR
SELECT USING (
        member_id IN (
            SELECT id
            FROM members
            WHERE auth_token::text = current_setting('app.member_token', true)
        )
    );
-- WhatsApp Outbox
CREATE TABLE whatsapp_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    body TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE whatsapp_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants see their whatsapp outbox" ON whatsapp_outbox FOR ALL USING (tenant_id = get_auth_tenant_id());