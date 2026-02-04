'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function upsertProduct(formData: FormData) {
    const id = formData.get('id') as string; // If present, update. If not, create.
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string) || 0;

    // In a real app, get tenant_id from session/context
    // For now, we fetch the first tenant again (simplified for demo)
    const { data: tenant } = await supabaseAdmin.from('tenants').select('id').limit(1).single();
    if (!tenant) return { success: false, error: 'No tenant found' };

    const productData = {
        tenant_id: tenant.id,
        name,
        price,
        stock,
        active: true
    };

    let error;

    if (id) {
        // Update
        const { error: upError } = await supabaseAdmin
            .from('products')
            .update(productData)
            .eq('id', id);
        error = upError;
    } else {
        // Insert
        const { error: inError } = await supabaseAdmin
            .from('products')
            .insert(productData);
        error = inError;
    }

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidatePath('/admin/members'); // Because POS uses products
    return { success: true };
}

export async function deleteProduct(id: string) {
    // Soft delete
    const { error } = await supabaseAdmin
        .from('products')
        .update({ active: false })
        .eq('id', id);

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/products');
    revalidatePath('/admin/members');
    return { success: true };
}
