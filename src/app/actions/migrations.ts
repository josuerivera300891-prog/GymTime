'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';

export async function applyColorMigration() {
    // Add columns if not exist
    const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: `
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#22C55E',
            ADD COLUMN IF NOT EXISTS cta_color TEXT DEFAULT '#F97316';

            UPDATE tenants 
            SET primary_color = '#E6007E' 
            WHERE primary_color IS NULL;
        `
    });

    if (error) {
        console.error('Migration error via RPC:', error);
        // Try direct update approach instead
        const { data: tenants, error: fetchError } = await supabaseAdmin
            .from('tenants')
            .select('id, primary_color, secondary_color, cta_color');

        if (fetchError) {
            return { success: false, error: fetchError.message };
        }

        // Update tenants missing colors
        for (const tenant of tenants || []) {
            const updates: any = {};
            if (!tenant.primary_color) updates.primary_color = '#E6007E';
            if (!tenant.secondary_color) updates.secondary_color = '#22C55E';
            if (!tenant.cta_color) updates.cta_color = '#F97316';

            if (Object.keys(updates).length > 0) {
                await supabaseAdmin
                    .from('tenants')
                    .update(updates)
                    .eq('id', tenant.id);
            }
        }

        return { success: true, message: 'Colors updated via direct method' };
    }

    return { success: true, message: 'Migration applied via RPC' };
}
