'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';

export async function registerAttendance(memberIconId: string) {
    // 1. Find member and their active membership
    const { data: member, error: mError } = await supabaseAdmin
        .from('members')
        .select(`
            id, tenant_id, name, status,
            memberships(status, next_due_date)
        `)
        .eq('auth_token', memberIconId)
        .single();

    // Safety check just in case
    if (mError || !member) {
        return { success: false, error: 'Socio no encontrado' };
    }

    const membership = member.memberships?.[0];
    const isExpired = membership?.status === 'EXPIRED' ||
        (membership?.next_due_date && new Date(membership.next_due_date) < new Date());

    if (isExpired || member.status === 'EXPIRED') {
        return { success: false, error: 'MEMBRESÍA VENCIDA', member };
    }

    // 2. Insert attendance
    const { error: aError } = await supabaseAdmin
        .from('attendance')
        .insert({
            member_id: member.id,
            tenant_id: member.tenant_id
        });

    if (aError) {
        return { success: false, error: 'Error al registrar visita' };
    }

    return { success: true, member };
}
