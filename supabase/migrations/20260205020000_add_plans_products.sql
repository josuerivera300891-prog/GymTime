-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    -- MEMBERSHIP, PRODUCT, MIXED
    method TEXT NOT NULL DEFAULT 'CASH',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants see own payments" ON payments;
CREATE POLICY "Tenants see own payments" ON payments FOR ALL USING (tenant_id = get_auth_tenant_id());
-- 2. Create Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL DEFAULT 30,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage own plans" ON plans;
CREATE POLICY "Tenants manage own plans" ON plans FOR ALL USING (tenant_id = get_auth_tenant_id()) WITH CHECK (tenant_id = get_auth_tenant_id());
-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenants manage own products" ON products;
CREATE POLICY "Tenants manage own products" ON products FOR ALL USING (tenant_id = get_auth_tenant_id()) WITH CHECK (tenant_id = get_auth_tenant_id());
-- 4. Create Payment Items Table
CREATE TABLE IF NOT EXISTS payment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_items
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Tenants see own payment items" ON payment_items;
CREATE POLICY "Tenants see own payment items" ON payment_items FOR ALL USING (tenant_id = get_auth_tenant_id());