'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAuthorizedTenantId } from '@/lib/auth';

export async function registerAttendance(memberIconId: string, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado o gimnasio no especificado.' };
        }

        // 1. Find member by auth_token and tenant_id
        const { data: member, error: mError } = await supabaseAdmin
            .from('members')
            .select(`
                id, tenant_id, name, status, image_url,
                memberships(status, next_due_date, plan_name)
            `)
            .eq('auth_token', memberIconId)
            .eq('tenant_id', tenantId) // FORCED FILTER
            .single();

        if (mError || !member) {
            return { success: false, error: 'Socio no encontrado en este gimnasio' };
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
                tenant_id: tenantId
            });

        if (aError) {
            return { success: false, error: 'Error al registrar visita' };
        }

        return { success: true, member };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
