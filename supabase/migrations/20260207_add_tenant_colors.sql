-- Add secondary_color and cta_color to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#22C55E',
ADD COLUMN IF NOT EXISTS cta_color TEXT DEFAULT '#F97316';

-- Update existing tenants with defaults if primary_color is null
UPDATE tenants 
SET primary_color = '#E6007E' 
WHERE primary_color IS NULL;

COMMENT ON COLUMN tenants.primary_color IS 'Main brand color for PWA accents, badges, QR';
COMMENT ON COLUMN tenants.secondary_color IS 'Success states, progress indicators, attendance';
COMMENT ON COLUMN tenants.cta_color IS 'Call-to-action buttons, urgent alerts';
