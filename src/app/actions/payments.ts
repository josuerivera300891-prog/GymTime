'use server';

import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';
import { isSuperAdminEmail } from '@/lib/auth';

export async function createPayment(formData: FormData) {
    const supabase = await createClient();

    // Verify Session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    const memberId = formData.get('member_id') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const type = formData.get('type') as string;
    const renewMembership = formData.get('renew_membership') === 'true';

    const isSuperAdmin = isSuperAdminEmail(user.email);
    const dataClient = isSuperAdmin ? supabaseAdmin : supabase;

    // Fetch tenant_id from the member (Bypass RLS if SuperAdmin)
    const { data: member, error: mError } = await dataClient
        .from('members')
        .select('tenant_id')
        .eq('id', memberId)
        .single();

    if (mError || !member) {
        return { success: false, error: 'Member not found or access denied' };
    }

    const tenantId = member.tenant_id;

    // 1. Create Payment Record
    const { data: payment, error: pError } = await dataClient
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
        await dataClient.from('payment_items').insert({
            tenant_id: payment.tenant_id, // Add tenant context
            payment_id: payment.id,
            description: 'Renovación de Membresía',
            quantity: 1,
            unit_price: memAmount,
            total: memAmount
        });

        // UPDATE MEMBERSHIP
        // Find current membership
        const { data: membership } = await dataClient
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

            const newPlanDays = parseInt(formData.get('new_plan_days') as string) || 30;
            const newPlanName = formData.get('new_plan_name') as string;

            const newDueDate = addDays(baseDate, newPlanDays);

            // Prepare update data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                status: 'ACTIVE',
                next_due_date: newDueDate.toISOString().split('T')[0],
                amount: memAmount, // Update recurring amount to the new plan price
            };

            if (newPlanName) {
                updateData.plan_name = newPlanName;
            } else if (membership.plan_name) {
                // Preserve current plan if no new plan is provided
                updateData.plan_name = membership.plan_name;
            }

            await dataClient.from('memberships')
                .update(updateData)
                .eq('id', membership.id);
        } else {
            // CREATE NEW MEMBERSHIP if member doesn't have one
            const newPlanDays = parseInt(formData.get('new_plan_days') as string) || 30;
            const newPlanName = formData.get('new_plan_name') as string || 'Membresía';
            const today = new Date();
            const newDueDate = addDays(today, newPlanDays);

            await dataClient.from('memberships').insert({
                tenant_id: tenantId,
                member_id: memberId,
                plan_name: newPlanName,
                amount: memAmount,
                status: 'ACTIVE',
                start_date: today.toISOString().split('T')[0],
                next_due_date: newDueDate.toISOString().split('T')[0],
            });
        }

        // Update member status to ACTIVE
        await dataClient.from('members')
            .update({ status: 'ACTIVE' })
            .eq('id', memberId);
    }

    // Process Products Cart
    const cartJson = formData.get('cart') as string;
    if (cartJson) {
        const cart = JSON.parse(cartJson);
        for (const item of cart) {
            await dataClient.from('payment_items').insert({
                tenant_id: payment.tenant_id,
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
