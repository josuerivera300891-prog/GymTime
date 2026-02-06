'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAuthorizedTenantId } from '@/lib/auth';

export async function updateTenantBranding(targetTenantId: string, formData: FormData) {
    try {
        const { tenantId, isSuperAdmin } = await getAuthorizedTenantId(targetTenantId);

        if (!tenantId) {
            return { success: false, error: 'ID de gimnasio no especificado o no autorizado.' };
        }

        const name = formData.get('name') as string;
        const logoFile = formData.get('logo_file') as File;
        const primary_color = formData.get('primary_color') as string;
        const country = formData.get('country') as string;
        const currency_symbol = formData.get('currency_symbol') as string;
        const currency_code = formData.get('currency_code') as string;
        const timezone = formData.get('timezone') as string;

        let logo_url = formData.get('current_logo_url') as string || null;

        // Handle File Upload
        if (logoFile && logoFile.size > 0) {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${tenantId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabaseAdmin
                .storage
                .from('branding')
                .upload(filePath, logoFile, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                if (uploadError.message.includes('bucket not found')) {
                    return { success: false, error: 'Storage bucket "branding" no encontrado.' };
                }
                return { success: false, error: `Error al subir logo: ${uploadError.message}` };
            }

            const { data: { publicUrl } } = supabaseAdmin
                .storage
                .from('branding')
                .getPublicUrl(filePath);

            logo_url = publicUrl;
        }

        const { error } = await supabaseAdmin
            .from('tenants')
            .update({
                name,
                logo_url,
                primary_color,
                country,
                currency_symbol,
                currency_code,
                timezone
            })
            .eq('id', tenantId);

        if (error) {
            return { success: false, error: `Error DB: ${error.message}` };
        }

        revalidatePath('/admin/settings');
        revalidatePath('/c');
        return { success: true };
    } catch (err: any) {
        console.error('Server Action Error:', err);
        return { success: false, error: `Error inesperado: ${err.message}` };
    }
}

export async function getTenantBranding(targetTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(targetTenantId);

        if (!tenantId) return null;

        const { data, error } = await supabaseAdmin
            .from('tenants')
            .select('id, name, logo_url, primary_color')
            .eq('id', tenantId)
            .single();

        if (error || !data) {
            console.error('Error fetching tenant branding:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('getTenantBranding Error:', error);
        return null;
    }
}
