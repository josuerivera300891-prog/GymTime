import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseServer';

// SuperAdmin emails from environment variable (comma-separated)
// Default fallback for backward compatibility during transition
const SUPERADMIN_EMAILS_RAW = process.env.SUPERADMIN_EMAILS || 'admin@gymtime.com';
export const SUPERADMIN_EMAILS = SUPERADMIN_EMAILS_RAW.split(',').map(e => e.trim().toLowerCase());

/**
 * Check if an email belongs to a SuperAdmin
 */
export function isSuperAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}

// Keep for backward compatibility but mark as deprecated
/** @deprecated Use isSuperAdminEmail() instead */
export const SUPERADMIN_EMAIL = SUPERADMIN_EMAILS[0] || 'admin@gymtime.com';

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

    const isSuperAdmin = isSuperAdminEmail(user.email);

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
    return isSuperAdminEmail(user?.email);
}
