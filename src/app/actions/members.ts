'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { isSuperAdminEmail, getAuthorizedTenantId } from '@/lib/auth';

// supabaseAdmin import removed as it should not be used in actions generally, 
// unless for specific admin tasks that user context can't handle. 
import { supabaseAdmin } from '@/lib/supabaseServer';


export async function createMember(formData: FormData) {
    const supabase = await createClient();

    // 1. Validate Auth and Get Tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const isSuperAdmin = isSuperAdminEmail(user.email);
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
    const birthdate = formData.get('birthdate') as string || null;
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
            birthdate: birthdate || null,
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

    // 5. Send WhatsApp Welcome Message (Async in background)
    try {
        const { data: tenant } = await dataClient
            .from('tenants')
            .select('name')
            .eq('id', tenantId)
            .single();

        if (member.phone && tenant) {
            const { sendWhatsAppMessage } = await import('@/lib/whatsapp');

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gymtime-pwa.vercel.app';
            const welcomeLink = `${baseUrl}/c?t=${tenantId}&token=${member.auth_token}`;

            await sendWhatsAppMessage({
                tenant_id: tenantId,
                phone: member.phone,
                contentSid: 'HX682c19126031581d5ed31d4826e9f26b',
                contentVariables: {
                    '1': member.name,
                    '2': tenant.name,
                    '3': welcomeLink,
                    '4': member.auth_token
                }
            });
        }
    } catch (wsError) {
        console.error('Failed to send welcome WhatsApp:', wsError);
    }

    return { success: true, member };
}

export async function uploadMemberPhoto(formData: FormData) {
    const file = formData.get('file') as File;
    const memberId = formData.get('memberId') as string;
    const tenantId = formData.get('tenantId') as string;

    // SECURITY: Validate authorization
    const { tenantId: authTenantId } = await getAuthorizedTenantId(tenantId);

    if (!file || !memberId || !tenantId || (authTenantId !== tenantId)) {
        return { success: false, error: 'No autorizado o datos incompletos' };
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
        .eq('id', memberId)
        .eq('tenant_id', tenantId);

    if (dbError) {
        return { success: false, error: 'Error al actualizar perfil' };
    }

    revalidatePath('/c'); // Revalidate PWA
    revalidatePath('/admin/scanner');

    return { success: true, url: publicUrl };
}
