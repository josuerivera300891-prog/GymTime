CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    worker_name TEXT NOT NULL,
    start_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    end_amount DECIMAL(10, 2),
    expected_amount DECIMAL(10, 2),
    -- Calculated system total at close
    difference DECIMAL(10, 2),
    -- Discrepancy
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'OPEN',
    -- OPEN, CLOSED
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'shifts'
        AND policyname = 'Allow all access'
) THEN CREATE POLICY "Allow all access" ON shifts FOR ALL USING (true);
END IF;
END $$;