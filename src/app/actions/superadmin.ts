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
    primary_color?: string;
    secondary_color?: string;
    cta_color?: string;
}) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado: Solo el SuperAdministrador puede modificar gimnasios.' };
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.admin_email) updateData.admin_email = data.admin_email;
    if (data.primary_color) updateData.primary_color = data.primary_color;
    if (data.secondary_color) updateData.secondary_color = data.secondary_color;
    if (data.cta_color) updateData.cta_color = data.cta_color;
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
    revalidatePath('/c'); // Revalidar PWA para reflejar nuevos colores
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


/**
 * Fetch global statistics for the SuperAdmin Dashboard
 */
export async function getSuperAdminStats() {
    if (!await isUserSuperAdmin()) {
        throw new Error('No autorizado');
    }

    // 1. Total Tenants
    const { count: totalTenants } = await supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true });

    // 2. Active Tenants
    const { count: activeTenants } = await supabaseAdmin
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    // 3. Total Members
    const { count: totalMembers } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true });

    // 4. Active Memberships
    const { count: activeMemberships } = await supabaseAdmin
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    // 5. Total Revenue (Sum of all payments)
    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('amount');

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // 6. Total Attendance (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: totalAttendance } = await supabaseAdmin
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .gte('checked_in_at', thirtyDaysAgo.toISOString());

    return {
        totalTenants: totalTenants || 0,
        activeTenants: activeTenants || 0,
        totalMembers: totalMembers || 0,
        activeMemberships: activeMemberships || 0,
        totalRevenue,
        totalAttendance: totalAttendance || 0
    };
}

/**
 * Create or update Twilio credentials for a tenant
 */
export async function upsertTwilioAccount(data: {
    tenant_id: string;
    account_sid: string;
    auth_token: string;
    whatsapp_number: string;
}) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado.' };
    }

    // Ensure whatsapp: prefix and clean number
    let whatsapp = data.whatsapp_number.trim();

    // Remove any existing whatsapp: prefix to clean it first
    whatsapp = whatsapp.replace(/^whatsapp:/i, '');

    // Ensure it starts with + for country code
    if (!whatsapp.startsWith('+')) {
        whatsapp = `+${whatsapp}`;
    }

    // Add prefix back for storage
    whatsapp = `whatsapp:${whatsapp}`;

    const { error } = await supabaseAdmin
        .from('twilio_accounts')
        .upsert({
            tenant_id: data.tenant_id,
            account_sid: data.account_sid,
            auth_token: data.auth_token,
            whatsapp_number: whatsapp,
            status: 'ACTIVE' // Default to active if saving
        });

    if (error) {
        console.error('Upsert Twilio error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/superadmin/twilio');
    return { success: true };
}

export async function sendTestWhatsApp(data: {
    tenant_id: string;
    phone: string;
    body: string;
}) {
    if (!await isUserSuperAdmin()) {
        return { success: false, error: 'No autorizado.' };
    }

    // 1. Get Twilio config
    const { data: twilioConfig, error: twilioError } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*')
        .eq('tenant_id', data.tenant_id)
        .single();

    if (twilioError || !twilioConfig) {
        return { success: false, error: 'Configuración de Twilio no encontrada para esta sede.' };
    }

    try {
        const twilio = require('twilio');
        const client = twilio(twilioConfig.account_sid, twilioConfig.auth_token);

        // 2. Clear phone number (numeric only)
        let cleanPhone = data.phone.replace(/\D/g, '');

        // 3. Send message
        // Ensure from is correctly formatted (it already has whatsapp: prefix in DB)
        const fromNumber = twilioConfig.whatsapp_number.startsWith('whatsapp:')
            ? twilioConfig.whatsapp_number
            : `whatsapp:${twilioConfig.whatsapp_number}`;

        const response = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:+${cleanPhone}`,
            body: data.body
        });

        // 4. Log in outbox
        await supabaseAdmin
            .from('whatsapp_outbox')
            .insert({
                tenant_id: data.tenant_id,
                phone: cleanPhone,
                body: data.body,
                status: 'SENT',
                sent_at: new Date().toISOString()
            });

        return {
            success: true,
            message: `Mensaje enviado con éxito. SID: ${response.sid}`
        };
    } catch (error: any) {
        console.error('Test WhatsApp Error:', error);

        // Log failure in outbox
        await supabaseAdmin
            .from('whatsapp_outbox')
            .insert({
                tenant_id: data.tenant_id,
                phone: data.phone,
                body: data.body,
                status: 'FAILED',
                error: error.message
            });

        return {
            success: false,
            error: `Error al enviar WhatsApp: ${error.message}`
        };
    }
}
