'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';

export async function getSales(tenantId: string, startDate?: string, endDate?: string) {
    let query = supabaseAdmin
        .from('payments')
        .select(`
            id,
            amount,
            method,
            paid_at,
            memberships (
                plan_name,
                members ( name )
            )
        `)
        .eq('tenant_id', tenantId)
        .order('paid_at', { ascending: false });

    // Apply filters if provided
    if (startDate) {
        // Start of day in local time treated as UTC or just ISO string comparison
        query = query.gte('paid_at', `${startDate}T00:00:00`);
    }

    if (endDate) {
        // End of day
        query = query.lte('paid_at', `${endDate}T23:59:59`);
    } else if (startDate) {
        // If only start date is provided, assume it's a single day filter
        query = query.lte('paid_at', `${startDate}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching sales:', error);
        return { success: false, error: 'Error al cargar reportes' };
    }

    // Transform data for easier consumption
    const sales = data.map((payment: any) => ({
        id: payment.id,
        date: payment.paid_at,
        amount: payment.amount,
        method: payment.method,
        member_name: payment.memberships?.members?.name || 'Desconocido',
        plan_name: payment.memberships?.plan_name || 'N/A'
    }));

    return { success: true, sales };
}
