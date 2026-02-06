'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function getPlanStats(tenantId: string) {
    // 1. Fetch all plans for the tenant
    const { data: plans, error: plansError } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('price', { ascending: true });

    if (plansError) {
        console.error('Error fetching plans:', plansError);
        return { success: false, plans: [] };
    }

    // 2. Fetch active memberships count
    const { data: memberships } = await supabaseAdmin
        .from('memberships')
        .select('plan_name, status')
        .eq('status', 'ACTIVE');

    // Aggregate in memory
    const stats: Record<string, number> = {};
    memberships?.forEach((m: any) => {
        const name = m.plan_name;
        stats[name] = (stats[name] || 0) + 1;
    });

    const plansWithStats = plans.map((p: any) => ({
        ...p,
        activeCount: stats[p.name] || 0
    }));

    return { success: true, plans: plansWithStats };
}

export async function createPlan(data: any) {
    // Check if data is FormData or object
    const name = data instanceof FormData ? data.get('name') : data.name;
    const price = data instanceof FormData ? parseFloat((data.get('price') as string) || '0') : data.price;
    const duration_days = data instanceof FormData ? parseInt((data.get('duration_days') as string) || '0') : data.duration_days;
    const tenant_id = data instanceof FormData ? (data.get('tenant_id') as string) : data.tenant_id;

    if (!name || isNaN(price) || isNaN(duration_days) || !tenant_id) {
        return { success: false, error: 'Datos inválidos' };
    }

    const { data: newPlan, error } = await supabaseAdmin
        .from('plans')
        .insert({
            tenant_id,
            name,
            price,
            duration_days,
            active: true
        })
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/plans');
    return { success: true, plan: newPlan };
}

export async function updatePlan(id: string, data: any) {
    const { error } = await supabaseAdmin
        .from('plans')
        .update({
            name: data.name,
            price: data.price,
            duration_days: data.duration_days
        })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/plans');
    return { success: true };
}

export async function togglePlanStatus(id: string, currentStatus: boolean) {
    const { error } = await supabaseAdmin
        .from('plans')
        .update({ active: !currentStatus })
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/plans');
    return { success: true };
}

export async function deletePlan(planId: string) {
    const { error } = await supabaseAdmin
        .from('plans')
        .delete()
        .eq('id', planId);

    if (error) {
        console.error('Delete Plan Error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/plans');
    return { success: true };
}
