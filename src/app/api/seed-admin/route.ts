
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(req: Request) {
    try {
        console.log('Starting Admin Seed checking...');

        const email = 'admin@gymtime.com';
        const password = 'password123';
        const gymName = 'GymTime Demo Center';

        // 1. Check if user already exists
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        let user = users.find(u => u.email === email);

        if (!user) {
            console.log('Creating new admin user...');
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });

            if (createError) throw createError;
            user = newUser.user;
        } else {
            console.log('User already exists, skipping creation.');
        }

        if (!user) throw new Error('Failed to identify or create user');

        // 2. Check if Tenant exists
        const { data: existingTenants } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .eq('name', gymName);

        let tenantId;

        if (existingTenants && existingTenants.length > 0) {
            console.log('Tenant already exists.');
            tenantId = existingTenants[0].id;
        } else {
            console.log('Creating new tenant...');
            const { data: newTenant, error: tError } = await supabaseAdmin
                .from('tenants')
                .insert({
                    name: gymName,
                    country: 'Guatemala',
                    currency_symbol: 'Q',
                    currency_code: 'GTQ',
                    timezone: 'America/Guatemala',
                    status: 'ACTIVE'
                })
                .select()
                .single();

            if (tError) throw tError;
            tenantId = newTenant.id;
        }

        // 3. Link User to Tenant (Staff Users)
        const { data: existingStaff } = await supabaseAdmin
            .from('staff_users')
            .select('*')
            .eq('auth_user_id', user.id);

        if (existingStaff && existingStaff.length > 0) {
            console.log('User is already linked to a tenant.');
        } else {
            console.log('Linking user to tenant...');
            const { error: linkError } = await supabaseAdmin
                .from('staff_users')
                .insert({
                    tenant_id: tenantId,
                    auth_user_id: user.id,
                    role: 'OWNER'
                });

            if (linkError) throw linkError;
        }

        return NextResponse.json({
            success: true,
            message: 'Admin setup complete',
            credentials: { email, password }
        });

    } catch (error: any) {
        console.error('Seed Admin Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
