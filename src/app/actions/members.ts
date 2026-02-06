'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

// supabaseAdmin import removed as it should not be used in actions generally, 
// unless for specific admin tasks that user context can't handle. 
import { supabaseAdmin } from '@/lib/supabaseServer';


export async function createMember(formData: FormData) {
    const supabase = await createClient();

    // 1. Validate Auth and Get Tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const isSuperAdmin = user.email === 'admin@gymtime.com';
    let tenantId = formData.get('tenant_id') as string;

    // If not provided or if we need to verify for non-superadmin
    if (!tenantId || !isSuperAdmin) {
        const { data: staff } = await supabase
            .from('staff_users')
            .select('tenant_id')
            .eq('auth_user_id', user.id)
            .single();

        if (isSuperAdmin && tenantId) {
            // SuperAdmin bypass: use provided tenantId
        } else if (!staff?.tenant_id) {
            return { success: false, error: 'No tienes un gimnasio asignado.' };
        } else {
            // Normal user: always use their assigned tenant_id for security
            tenantId = staff.tenant_id;
        }
    }

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const planName = formData.get('plan_name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationDays = parseInt(formData.get('duration_days') as string) || 30;

    const dataClient = isSuperAdmin ? supabaseAdmin : supabase;

    // 2. Generate a unique auth_token
    const authToken = crypto.randomUUID().substring(0, 8).toUpperCase();

    // 3. Create the member
    const { data: member, error: mError } = await dataClient
        .from('members')
        .insert({
            tenant_id: tenantId,
            name,
            phone,
            status: 'ACTIVE',
            auth_token: authToken
        })
        .select()
        .single();

    if (mError) {
        console.error('Member Create Error:', mError);
        return { success: false, error: 'Error al crear miembro: ' + mError.message };
    }

    // 4. Create the initial membership
    const startDate = new Date();
    const nextDue = new Date();
    nextDue.setDate(startDate.getDate() + durationDays);

    const { error: msError } = await dataClient
        .from('memberships')
        .insert({
            member_id: member.id,
            tenant_id: tenantId,
            plan_name: planName,
            amount: price,
            status: 'ACTIVE',
            start_date: startDate.toISOString().split('T')[0],
            next_due_date: nextDue.toISOString().split('T')[0]
        });

    if (msError) {
        console.error('Membership Create Error:', msError);
        return { success: false, error: 'Error al crear membresía.' };
    }

    revalidatePath('/admin/members');
    return { success: true, member };
}

export async function uploadMemberPhoto(formData: FormData) {
    const file = formData.get('file') as File;
    const memberId = formData.get('memberId') as string;
    const tenantId = formData.get('tenantId') as string;

    if (!file || !memberId || !tenantId) {
        return { success: false, error: 'Datos incompletos' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}-${Date.now()}.${fileExt}`;
    const filePath = `${tenantId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin
        .storage
        .from('member-photos')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: true
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return { success: false, error: 'Error al subir imagen' };
    }

    const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('member-photos')
        .getPublicUrl(filePath);

    // Update member record
    const { error: dbError } = await supabaseAdmin
        .from('members')
        .update({ image_url: publicUrl })
        .eq('id', memberId);

    if (dbError) {
        return { success: false, error: 'Error al actualizar perfil' };
    }

    revalidatePath('/c'); // Revalidate PWA
    revalidatePath('/admin/scanner');

    return { success: true, url: publicUrl };
}
