'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAuthorizedTenantId } from '@/lib/auth';

/**
 * Registers attendance by member ID or Auth Token
 */
export async function registerAttendance(memberIdOrToken: string, paramTenantId?: string, isDirectId: boolean = false) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado o gimnasio no especificado.' };
        }

        // 1. Find member by auth_token (or ID) and tenant_id
        const query = supabaseAdmin
            .from('members')
            .select(`
                id, tenant_id, name, status, image_url, phone,
                memberships(status, next_due_date, plan_name)
            `)
            .eq('tenant_id', tenantId);

        if (isDirectId) {
            query.eq('id', memberIdOrToken);
        } else {
            query.eq('auth_token', memberIdOrToken);
        }

        const { data: member, error: mError } = await query.single();

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

/**
 * Search members for the scanner UI by Name, Phone or Code
 */
export async function searchMembersByQuery(search: string, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);
        if (!tenantId) return [];

        if (!search || search.length < 2) return [];

        const { data, error } = await supabaseAdmin
            .from('members')
            .select(`
                id, name, phone, auth_token, image_url, status,
                memberships(status, next_due_date, plan_name)
            `)
            .eq('tenant_id', tenantId)
            .or(`name.ilike.%${search}%,phone.ilike.%${search}%,auth_token.ilike.%${search}%`)
            .limit(10);

        if (error) {
            console.error('Search error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Search exception:', error);
        return [];
    }
}
