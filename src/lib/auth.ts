import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const SUPERADMIN_EMAIL = 'admin@gymtime.com';

/**
 * Valida la sesión del usuario y retorna su ID de tenant autorizado.
 * Si es SuperAdmin, puede opcionalmente impersonar un tenant_id específico.
 * Si es Admin normal, solo puede operar en su propio tenant.
 */
export async function getAuthorizedTenantId(paramTenantId?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('No autorizado: Sesión no encontrada.');
    }

    const isSuperAdmin = user.email === SUPERADMIN_EMAIL;

    // Caso 1: SuperAdmin (Puede elegir cualquier tenant o operar globalmente)
    if (isSuperAdmin) {
        return {
            tenantId: paramTenantId || null,
            isSuperAdmin: true,
            user
        };
    }

    // Caso 2: Admin / Staff Normal
    // Validamos a qué tenant pertenece realmente el usuario en staff_users
    const { data: staffInfo, error: staffError } = await supabaseAdmin
        .from('staff_users')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

    if (staffError || !staffInfo) {
        throw new Error('No autorizado: El usuario no tiene un gimnasio asignado.');
    }

    // Bloqueo de seguridad: Si intentó pasar un tenant_id distinto por URL, lo ignoramos y usamos el suyo
    if (paramTenantId && paramTenantId !== staffInfo.tenant_id) {
        console.warn(`[Security] Intento de acceso denegado: User ${user.id} intentó acceder al tenant ${paramTenantId} pero pertenece a ${staffInfo.tenant_id}`);
    }

    return {
        tenantId: staffInfo.tenant_id,
        isSuperAdmin: false,
        role: staffInfo.role,
        user
    };
}

/**
 * Determina si el usuario actual es SuperAdmin
 */
export async function isUserSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === SUPERADMIN_EMAIL;
}
