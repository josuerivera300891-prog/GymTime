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

/**
 * Toggle a tenant's status between ACTIVE and SUSPENDED
 * Only SuperAdmin can perform this action
 */
export async function toggleTenantStatus(tenantId: string) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado: Solo el SuperAdministrador puede modificar gimnasios.' };
    }

    // Get current status
    const { data: tenant, error: fetchError } = await supabaseAdmin
        .from('tenants')
        .select('status')
        .eq('id', tenantId)
        .single();

    if (fetchError || !tenant) {
        return { success: false, error: 'Gimnasio no encontrado.' };
    }

    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    const { error } = await supabaseAdmin
        .from('tenants')
        .update({ status: newStatus })
        .eq('id', tenantId);

    if (error) {
        console.error('Toggle Tenant Status Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/tenants');
    revalidatePath('/superadmin');
    return { success: true, newStatus };
}

/**
 * Update tenant details
 * Only SuperAdmin can perform this action
 */
export async function updateTenant(tenantId: string, data: {
    name?: string;
    admin_email?: string;
    country?: string;
}) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado: Solo el SuperAdministrador puede modificar gimnasios.' };
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.admin_email) updateData.admin_email = data.admin_email;
    if (data.country) {
        const config = getCountryConfig(data.country);
        updateData.country = config.name;
        updateData.currency_symbol = config.currencySymbol;
        updateData.currency_code = config.currencyCode;
        updateData.timezone = config.timezone;
    }

    const { error } = await supabaseAdmin
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId);

    if (error) {
        console.error('Update Tenant Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/tenants');
    return { success: true };
}

/**
 * Test Twilio connection for a tenant
 * Only SuperAdmin can perform this action
 */
export async function testTwilioConnection(tenantId: string) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado.' };
    }

    // Fetch Twilio config for this tenant
    const { data: twilioConfig, error: fetchError } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

    if (fetchError || !twilioConfig) {
        return { success: false, error: 'Configuración de Twilio no encontrada para este gimnasio.' };
    }

    try {
        // Import Twilio dynamically to avoid issues if not installed
        const twilio = require('twilio');
        const client = twilio(twilioConfig.account_sid, twilioConfig.auth_token);

        // Fetch account info to verify credentials
        const account = await client.api.accounts(twilioConfig.account_sid).fetch();

        return {
            success: true,
            accountName: account.friendlyName,
            accountStatus: account.status,
            message: `Conexión exitosa. Cuenta: ${account.friendlyName} (${account.status})`
        };
    } catch (error: any) {
        console.error('Twilio Test Error:', error);
        return {
            success: false,
            error: `Error de conexión: ${error.message}`
        };
    }
}

