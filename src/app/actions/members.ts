'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { isSuperAdminEmail, getAuthorizedTenantId } from '@/lib/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

    // 5. Create Payment Record (New!)
    const paymentMethod = formData.get('payment_method') as string || 'CASH';
    const { data: payment, error: pError } = await dataClient
        .from('payments')
        .insert({
            tenant_id: tenantId,
            member_id: member.id,
            amount: price,
            type: 'MEMBERSHIP',
            method: paymentMethod
        })
        .select()
        .single();

    if (pError) {
        console.error('Payment Record Error:', pError);
        // We don't fail the whole member creation if payment fails to log, 
        // but it's good to log it. In a strict system, we might want to roll back.
    } else {
        // Add line item for the payment
        await dataClient.from('payment_items').insert({
            tenant_id: tenantId,
            payment_id: payment.id,
            description: `Registro Inicial: ${planName}`,
            quantity: 1,
            unit_price: price,
            total: price
        });
    }

    revalidatePath('/admin/members');
    revalidatePath('/admin'); // Revalidate Dashboard
    revalidatePath('/admin/payments'); // Revalidate Payments history

    // 5. Send WhatsApp Welcome Message (Async in background)
    try {
        const { data: tenant } = await dataClient
            .from('tenants')
            .select('name')
            .eq('id', tenantId)
            .single();

        if (member.phone && tenant) {
            const { sendWhatsAppMessage } = await import('@/lib/whatsapp');

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gym-time-mu.vercel.app';
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
    const authToken = formData.get('authToken') as string;

    let isAuthorized = false;

    // SECURITY: Dual Validation
    if (authToken) {
        // 1. PWA Member Validation: Check if token matches member
        const { data: member } = await supabaseAdmin
            .from('members')
            .select('id')
            .eq('id', memberId)
            .eq('tenant_id', tenantId)
            .eq('auth_token', authToken)
            .maybeSingle();

        if (member) isAuthorized = true;
    } else {
        // 2. Staff/Admin Validation: Standard session check
        try {
            const { tenantId: authTenantId } = await getAuthorizedTenantId(tenantId);
            if (authTenantId === tenantId) isAuthorized = true;
        } catch (e) {
            isAuthorized = false;
        }
    }

    if (!file || !memberId || !tenantId || !isAuthorized) {
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

export async function getMonthlyLeaderboard(tenantId: string, memberId?: string) {
    const supabase = await createClient();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Get all attendance records for this month and tenant
    const { data: attendance, error } = await supabaseAdmin
        .from('attendance')
        .select(`
            member_id,
            members (name, image_url)
        `)
        .eq('tenant_id', tenantId)
        .gte('checked_in_at', startOfMonth.toISOString());

    if (error) {
        console.error('Leaderboard Fetch Error:', error);
        return { success: false, error: 'No se pudo obtener el ranking' };
    }

    // 2. Aggregate by member
    const counts: Record<string, { name: string, image_url: string, count: number, id: string }> = {};

    attendance.forEach((record: any) => {
        const id = record.member_id;
        if (!counts[id]) {
            counts[id] = {
                id,
                name: record.members.name,
                image_url: record.members.image_url,
                count: 0
            };
        }
        counts[id].count++;
    });

    // 3. Sort and get Top 10
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    const top10 = sorted.slice(0, 10);

    // 4. Find member position if requested
    let myPosition = null;
    if (memberId) {
        const index = sorted.findIndex(m => m.id === memberId);
        if (index !== -1) {
            myPosition = {
                rank: index + 1,
                count: sorted[index].count,
                total: sorted.length
            };
        }
    }

    return {
        success: true,
        top10,
        myPosition,
        monthName: format(new Date(), 'MMMM', { locale: es })
    };
}
