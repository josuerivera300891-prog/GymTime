-- 11. Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ENABLE RLS
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
-- POLICIES
CREATE POLICY "Tenants see their own attendance" ON attendance FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "Members see their own attendance via token" ON attendance FOR
SELECT USING (
        member_id IN (
            SELECT id
            FROM members
            WHERE auth_token::text = current_setting('app.member_token', true)
        )
    );
-- Helper for easier fetching in the PWA
CREATE INDEX idx_attendance_member_tenant ON attendance(member_id, tenant_id);