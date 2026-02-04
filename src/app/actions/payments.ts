'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';

export async function createPayment(formData: FormData) {
    const memberId = formData.get('member_id') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const type = formData.get('type') as string;
    const renewMembership = formData.get('renew_membership') === 'true';

    // Hardcoded for now, but should come from session
    // We need to fetch tenant_id from the member to be safe
    const { data: member, error: mError } = await supabaseAdmin
        .from('members')
        .select('tenant_id')
        .eq('id', memberId)
        .single();

    if (mError || !member) {
        return { success: false, error: 'Member not found' };
    }

    const tenantId = member.tenant_id;

    // 1. Create Payment Record
    const { data: payment, error: pError } = await supabaseAdmin
        .from('payments')
        .insert({
            tenant_id: tenantId,
            member_id: memberId,
            amount,
            type,
            method: 'CASH' // Default for now
        })
        .select()
        .single();

    if (pError) {
        return { success: false, error: pError.message };
    }

    // 2. Add Line Items
    if (renewMembership) {
        const memAmount = parseFloat(formData.get('membership_amount') as string);
        await supabaseAdmin.from('payment_items').insert({
            payment_id: payment.id,
            description: 'Renovación de Membresía',
            quantity: 1,
            unit_price: memAmount,
            total: memAmount
        });

        // UPDATE MEMBERSHIP
        // Find current membership
        const { data: membership } = await supabaseAdmin
            .from('memberships')
            .select('*')
            .eq('member_id', memberId)
            .single();

        if (membership) {
            // Calculate new dates
            const currentDue = new Date(membership.next_due_date);
            const today = new Date();
            // If expired, start from today. If active, add to current due date.
            const baseDate = currentDue < today ? today : currentDue;
            const newDueDate = addDays(baseDate, 30); // Assuming 30 days for now

            await supabaseAdmin.from('memberships')
                .update({
                    status: 'ACTIVE',
                    next_due_date: newDueDate.toISOString().split('T')[0],
                    last_payment_date: new Date().toISOString().split('T')[0]
                })
                .eq('id', membership.id);
        }
    }

    // Process Products Cart
    const cartJson = formData.get('cart') as string;
    if (cartJson) {
        const cart = JSON.parse(cartJson);
        for (const item of cart) {
            await supabaseAdmin.from('payment_items').insert({
                payment_id: payment.id,
                product_id: item.product_id,
                description: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total: item.price * item.quantity
            });
        }
    }

    revalidatePath('/admin/members');
    return { success: true };
}
