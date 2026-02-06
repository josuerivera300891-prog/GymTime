'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { getAuthorizedTenantId } from '@/lib/auth';

export async function getDashboardStats(paramTenantId?: string) {
    try {
        const { tenantId, user } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { error: 'No se especificó un gimnasio (ID de tenant requerido)' };
        }

        // Fetch the timezone and currency for the correct tenant
        const { data: tenantData } = await supabaseAdmin
            .from('tenants')
            .select('name, timezone, currency_symbol')
            .eq('id', tenantId)
            .single();

        const timezone = tenantData?.timezone || 'America/Guatemala';
        const currencySymbol = tenantData?.currency_symbol || 'Q';
        const gymName = tenantData?.name || 'Gimnasio';

        // Set time range for "Today" based on tenant timezone
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

        // 2. Fetch Stats in parallel
        const [
            attendanceRes,
            paymentsRes,
            itemsRes,
            renewalsRes,
            expiredRes
        ] = await Promise.all([
            // Daily Attendance
            supabaseAdmin.from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .gte('checked_in_at', startOfDay)
                .lte('checked_in_at', endOfDay),

            // Total Sales (Revenue)
            supabaseAdmin.from('payments')
                .select('amount, method')
                .eq('tenant_id', tenantId)
                .gte('created_at', startOfDay)
                .lte('created_at', endOfDay),

            // Items Sold
            supabaseAdmin.from('payments')
                .select('id, payment_items(quantity)')
                .eq('tenant_id', tenantId)
                .gte('created_at', startOfDay),

            // Renewals Count
            supabaseAdmin.from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .in('type', ['MEMBERSHIP', 'MIXED'])
                .gte('created_at', startOfDay),

            // Expired Today (and not renewed)
            supabaseAdmin.from('memberships')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .eq('status', 'EXPIRED')
                .gte('next_due_date', startOfDay.split('T')[0])
        ]);

        // Calculate totals
        const attendanceCount = attendanceRes.count || 0;
        const paymentsData = paymentsRes.data || [];

        const totalRevenue = paymentsData.reduce((acc, p) => acc + (p.amount || 0), 0);
        const cashRevenue = paymentsData
            .filter(p => p.method === 'CASH')
            .reduce((acc, p) => acc + (p.amount || 0), 0);
        const cardRevenue = paymentsData
            .filter(p => p.method === 'CARD')
            .reduce((acc, p) => acc + (p.amount || 0), 0);

        let productsSold = 0;
        if (itemsRes.data) {
            for (const payment of itemsRes.data) {
                if (payment.payment_items) {
                    productsSold += payment.payment_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                }
            }
        }

        const renewalsCount = renewalsRes.count || 0;
        const expiredCount = expiredRes.count || 0;

        return {
            stats: {
                attendanceCount: attendanceCount || 0,
                totalRevenue: totalRevenue || 0,
                cashRevenue: cashRevenue || 0,
                cardRevenue: cardRevenue || 0,
                productsSold: productsSold || 0,
                renewalsCount: renewalsCount || 0,
                expiredCount: expiredCount || 0
            },
            tenantId,
            currencySymbol,
            gymName
        };
    } catch (error: any) {
        console.error('[Dashboard Action Error]:', error);
        return { error: error.message };
    }
}

export async function getCurrentShift(paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) return null;

        const { data } = await supabaseAdmin
            .from('shifts')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('status', 'OPEN')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        return data;
    } catch (error) {
        console.error('[getCurrentShift Error]:', error);
        return null;
    }
}

export async function openShift(formData: FormData) {
    try {
        const worker_name = formData.get('worker_name') as string;
        const start_amount = parseFloat(formData.get('start_amount') as string);
        const paramTenantId = formData.get('tenant_id') as string;

        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'Tenant ID requerido' };
        }

        if (!worker_name || isNaN(start_amount)) {
            return { success: false, error: 'Datos inválidos' };
        }

        // Check if open shift exists FOR THIS TENANT
        const { data: existing } = await supabaseAdmin
            .from('shifts')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('status', 'OPEN')
            .maybeSingle();

        if (existing) {
            return { success: false, error: 'Ya hay un turno abierto para este gimnasio.' };
        }

        const { error } = await supabaseAdmin.from('shifts').insert({
            tenant_id: tenantId,
            worker_name,
            start_amount,
            status: 'OPEN'
        });

        if (error) return { success: false, error: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function closeShift(formData: FormData) {
    try {
        const shift_id = formData.get('shift_id') as string;
        const declared_cash = parseFloat(formData.get('declared_cash') as string) || 0;
        const declared_card = parseFloat(formData.get('declared_card') as string) || 0;
        const paramTenantId = formData.get('tenant_id') as string;

        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        const end_amount = declared_cash + declared_card;

        const { data: shift } = await supabaseAdmin.from('shifts').select('*').eq('id', shift_id).single();

        if (!shift) return { success: false, error: 'Turno no encontrado' };

        // Double secure: ensure shift belongs to authorized tenant
        if (shift.tenant_id !== tenantId) {
            return { success: false, error: 'No autorizado para cerrar este turno.' };
        }

        // Verify totals
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select('amount')
            .eq('tenant_id', shift.tenant_id)
            .gte('created_at', shift.started_at)
            .lte('created_at', new Date().toISOString());

        const totalSales = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

        const expected_amount = shift.start_amount + totalSales;
        const difference = end_amount - expected_amount;

        const { error } = await supabaseAdmin.from('shifts').update({
            end_amount,
            expected_amount,
            difference,
            status: 'CLOSED',
            ended_at: new Date().toISOString()
        }).eq('id', shift_id);

        if (error) return { success: false, error: error.message };

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
