-- Create plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Tenants see their own plans" ON plans FOR ALL USING (tenant_id = get_auth_tenant_id());