-- Member Routines Table
CREATE TABLE member_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    routine_type TEXT NOT NULL,
    -- 'Pierna', 'Pecho', 'Espalda', 'Hombro', 'Brazo', 'Cardio', 'Descanso'
    sets INTEGER,
    reps INTEGER,
    weight DECIMAL,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure one routine entry per member per day (or could allow multiple, but usually one is enough for summary)
    UNIQUE(member_id, date)
);
-- ENABLE RLS
ALTER TABLE member_routines ENABLE ROW LEVEL SECURITY;
-- POLICIES
CREATE POLICY "Tenants see their own member routines" ON member_routines FOR ALL USING (tenant_id = get_auth_tenant_id());
CREATE POLICY "Members see their own routines via token" ON member_routines FOR
SELECT USING (
        member_id IN (
            SELECT id
            FROM members
            WHERE auth_token::text = current_setting('app.member_token', true)
        )
    );
CREATE POLICY "Members can manage their own routines via token" ON member_routines FOR ALL USING (
    member_id IN (
        SELECT id
        FROM members
        WHERE auth_token::text = current_setting('app.member_token', true)
    )
) WITH CHECK (
    member_id IN (
        SELECT id
        FROM members
        WHERE auth_token::text = current_setting('app.member_token', true)
    )
);
-- INDEXES
CREATE INDEX idx_member_routines_member_date ON member_routines(member_id, date);
CREATE INDEX idx_member_routines_tenant ON member_routines(tenant_id);
-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_member_routines_updated_at BEFORE
UPDATE ON member_routines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();