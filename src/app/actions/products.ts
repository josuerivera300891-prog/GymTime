'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { getAuthorizedTenantId } from '@/lib/auth';

export async function upsertProduct(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const priceUsdRaw = formData.get('price_usd') as string;
        const priceUsd = priceUsdRaw ? parseFloat(priceUsdRaw) : null;
        const stock = parseInt(formData.get('stock') as string) || 0;
        const imagesRaw = formData.get('images') as string; // JSON string array
        const tenantIdParam = formData.get('tenant_id') as string;
        const mainImageUrl = formData.get('image_url') as string;

        const { tenantId } = await getAuthorizedTenantId(tenantIdParam);

        if (!tenantId) {
            return { success: false, error: 'No autorizado o tenant no especificado.' };
        }

        let images: string[] = [];
        try {
            if (imagesRaw) {
                images = JSON.parse(imagesRaw);
            }
        } catch (e) {
            console.error('Error parsing images array', e);
        }

        const productData: any = {
            tenant_id: tenantId,
            name,
            description,
            price,
            price_usd: priceUsd,
            stock,
            images: images && images.length > 0 ? images : (mainImageUrl ? [mainImageUrl] : []),
            image_url: mainImageUrl || (images && images.length > 0 ? images[0] : null), // Sync main image for backward compatibility
            active: true
        };

        let error;

        if (id) {
            // Verify ownership before update
            const { data: existing } = await supabaseAdmin
                .from('products')
                .select('tenant_id')
                .eq('id', id)
                .single();

            if (!existing || existing.tenant_id !== tenantId) {
                return { success: false, error: 'No autorizado para editar este producto.' };
            }

            const { error: upError } = await supabaseAdmin
                .from('products')
                .update(productData)
                .eq('id', id);
            error = upError;
        } else {
            const { error: inError } = await supabaseAdmin
                .from('products')
                .insert(productData);
            error = inError;
        }

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/admin/products');
        revalidatePath('/admin/members');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function uploadProductPhoto(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const paramTenantId = formData.get('tenantId') as string;

        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!file || !tenantId) {
            return { success: false, error: 'Datos incompletos o no autorizado.' };
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `prod-${Date.now()}.${fileExt}`;
        const filePath = `${tenantId}/${fileName}`;

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('product-photos')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload Error:', uploadError);
            return { success: false, error: 'Error al subir imagen' };
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('product-photos')
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function deleteProduct(id: string, paramTenantId?: string) {
    try {
        const { tenantId } = await getAuthorizedTenantId(paramTenantId);

        if (!tenantId) return { success: false, error: 'No autorizado.' };

        // Verify ownership before soft delete
        const { data: existing } = await supabaseAdmin
            .from('products')
            .select('tenant_id')
            .eq('id', id)
            .single();

        if (!existing || existing.tenant_id !== tenantId) {
            return { success: false, error: 'No autorizado para eliminar este producto.' };
        }

        // Soft delete
        const { error } = await supabaseAdmin
            .from('products')
            .update({ active: false })
            .eq('id', id);

        if (error) return { success: false, error: error.message };

        revalidatePath('/admin/products');
        revalidatePath('/admin/members');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
