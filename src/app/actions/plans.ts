'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { getAuthorizedTenantId } from '@/lib/auth';

/**
 * Get plan statistics for a tenant
 * Validates that the user has access to the specified tenant
 */
export async function getPlanStats(paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, plans: [], error: 'Tenant ID requerido' };
        }

        // 1. Fetch all plans for the tenant
        const { data: plans, error: plansError } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('price', { ascending: true });

        if (plansError) {
            console.error('Error fetching plans:', plansError);
            return { success: false, plans: [], error: plansError.message };
        }

        // 2. Fetch active memberships count for this tenant only
        const { data: memberships } = await supabaseAdmin
            .from('memberships')
            .select('plan_name, status')
            .eq('tenant_id', tenantId)
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
    } catch (error: any) {
        console.error('[getPlanStats Error]:', error);
        return { success: false, plans: [], error: error.message };
    }
}

/**
 * Create a new plan
 * Validates multi-tenancy authorization
 */
export async function createPlan(data: any) {
    try {
        // Check if data is FormData or object
        const name = data instanceof FormData ? data.get('name') : data.name;
        const price = data instanceof FormData ? parseFloat((data.get('price') as string) || '0') : data.price;
        const duration_days = data instanceof FormData ? parseInt((data.get('duration_days') as string) || '0') : data.duration_days;
        const paramTenantId = data instanceof FormData ? (data.get('tenant_id') as string) : data.tenant_id;

        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado o tenant no especificado.' };
        }

        if (!name || isNaN(price) || isNaN(duration_days)) {
            return { success: false, error: 'Datos inválidos' };
        }

        const { data: newPlan, error } = await supabaseAdmin
            .from('plans')
            .insert({
                tenant_id: tenantId,
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
    } catch (error: any) {
        console.error('[createPlan Error]:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing plan
 * SECURITY: Validates that the plan belongs to the user's authorized tenant
 */
export async function updatePlan(id: string, data: any, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado.' };
        }

        // SECURITY: Verify plan belongs to authorized tenant
        const { data: existingPlan, error: fetchError } = await supabaseAdmin
            .from('plans')
            .select('tenant_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingPlan) {
            return { success: false, error: 'Plan no encontrado.' };
        }

        if (existingPlan.tenant_id !== tenantId) {
            console.warn(`[Security] Intento de modificación denegado: Plan ${id} pertenece a ${existingPlan.tenant_id}, usuario autorizado para ${tenantId}`);
            return { success: false, error: 'No autorizado para modificar este plan.' };
        }

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
    } catch (error: any) {
        console.error('[updatePlan Error]:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle plan active status
 * SECURITY: Validates that the plan belongs to the user's authorized tenant
 */
export async function togglePlanStatus(id: string, currentStatus: boolean, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado.' };
        }

        // SECURITY: Verify plan belongs to authorized tenant
        const { data: existingPlan, error: fetchError } = await supabaseAdmin
            .from('plans')
            .select('tenant_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingPlan) {
            return { success: false, error: 'Plan no encontrado.' };
        }

        if (existingPlan.tenant_id !== tenantId) {
            console.warn(`[Security] Intento de modificación denegado: Plan ${id} pertenece a ${existingPlan.tenant_id}, usuario autorizado para ${tenantId}`);
            return { success: false, error: 'No autorizado para modificar este plan.' };
        }

        const { error } = await supabaseAdmin
            .from('plans')
            .update({ active: !currentStatus })
            .eq('id', id);

        if (error) return { success: false, error: error.message };
        revalidatePath('/admin/plans');
        return { success: true };
    } catch (error: any) {
        console.error('[togglePlanStatus Error]:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a plan
 * SECURITY: Validates that the plan belongs to the user's authorized tenant
 */
export async function deletePlan(planId: string, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) {
            return { success: false, error: 'No autorizado.' };
        }

        // SECURITY: Verify plan belongs to authorized tenant
        const { data: existingPlan, error: fetchError } = await supabaseAdmin
            .from('plans')
            .select('tenant_id')
            .eq('id', planId)
            .single();

        if (fetchError || !existingPlan) {
            return { success: false, error: 'Plan no encontrado.' };
        }

        if (existingPlan.tenant_id !== tenantId) {
            console.warn(`[Security] Intento de eliminación denegado: Plan ${planId} pertenece a ${existingPlan.tenant_id}, usuario autorizado para ${tenantId}`);
            return { success: false, error: 'No autorizado para eliminar este plan.' };
        }

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
    } catch (error: any) {
        console.error('[deletePlan Error]:', error);
        return { success: false, error: error.message };
    }
}
