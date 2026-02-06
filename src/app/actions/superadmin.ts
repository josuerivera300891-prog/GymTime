'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { getCountryConfig } from '@/lib/countries';
import { revalidatePath } from 'next/cache';
import { isUserSuperAdmin } from '@/lib/auth';

export async function createTenant(formData: FormData) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado: Solo el SuperAdministrador puede crear gimnasios.' };
    }
    const name = formData.get('name') as string;
    const country = formData.get('country') as string || 'Guatemala';

    // Use centralized country configuration
    const config = getCountryConfig(country);

    const { data: tenant, error } = await supabaseAdmin
        .from('tenants')
        .insert({
            name,
            country: config.name,
            currency_symbol: config.currencySymbol,
            currency_code: config.currencyCode,
            timezone: config.timezone,
            status: 'ACTIVE',
            admin_email: formData.get('admin_email') as string
        })
        .select()
        .single();

    if (error) {
        console.error('Create Tenant Error:', error);
        return { success: false, error: 'Database Error: ' + error.message };
    }

    // 2. Create Admin User for this Tenant
    const adminEmail = formData.get('admin_email') as string;
    const adminPassword = formData.get('admin_password') as string;

    if (adminEmail && adminPassword) {
        // Create auth user
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        });

        if (userError) {
            console.error('Create Admin User Error:', userError);
            // Optionally rollback tenant creation or just warn
            return { success: true, tenantId: tenant.id, warning: 'Tenant created but failed to create admin user: ' + userError.message };
        }

        if (userData.user) {
            // Link to staff_users
            const { error: linkError } = await supabaseAdmin
                .from('staff_users')
                .insert({
                    tenant_id: tenant.id,
                    user_id: userData.user.id,
                    role: 'ADMIN' // Assuming you have roles
                });

            if (linkError) {
                console.error('Link Staff Error:', linkError);
                return { success: true, tenantId: tenant.id, warning: 'Tenant created, User created, but failed to link as staff.' };
            }
        }
    }

    revalidatePath('/superadmin/tenants');
    return { success: true, tenantId: tenant.id };
}
