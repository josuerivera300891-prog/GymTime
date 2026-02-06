'use server';

import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateMember(memberId: string, formData: FormData) {
    const supabase = await createClient();

    // Verify Auth & Tenant Access via RLS implicitly or explicit check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const isSuperAdmin = user.email === 'admin@gymtime.com';
    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    const dataClient = isSuperAdmin ? supabaseAdmin : supabase;

    // We can rely on RLS policy "Tenants can update their own members"
    // But we need to ensure the member belongs to the same tenant as the user if we want to be extra safe
    // RLS usually handles this: UPDATE members ... USING (tenant_id = get_auth_tenant_id())

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;

    const { error } = await dataClient
        .from('members')
        .update({ name, phone })
        .eq('id', memberId);

    if (error) {
        console.error('Update Member Error', error);
        return { success: false, error: 'Error al actualizar.' };
    }

    revalidatePath('/admin/members');
    return { success: true };
}

export async function deleteMember(memberId: string) {
    const supabase = await createClient();

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const isSuperAdmin = user.email === 'admin@gymtime.com';
    const { supabaseAdmin } = await import('@/lib/supabaseServer');
    const dataClient = isSuperAdmin ? supabaseAdmin : supabase;

    // RLS will handle tenant check: DELETE FROM members WHERE id = ... AND ...
    const { error } = await dataClient
        .from('members')
        .delete()
        .eq('id', memberId);

    if (error) {
        console.error('Delete Member Error', error);
        return { success: false, error: 'Error al eliminar miembro.' };
    }

    revalidatePath('/admin/members');
    return { success: true };
}
