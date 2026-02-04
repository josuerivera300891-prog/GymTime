'use server';

import { supabaseAdmin } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function createMember(tenantId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const planName = formData.get('plan_name') as string;
    const price = parseFloat(formData.get('price') as string);
    const durationDays = parseInt(formData.get('duration_days') as string) || 30;

    // 1. Generate a unique auth_token for the PWA access
    const authToken = crypto.randomUUID().substring(0, 8).toUpperCase();

    // 2. Create the member
    const { data: member, error: mError } = await supabaseAdmin
        .from('members')
        .insert({
            tenant_id: tenantId,
            name,
            phone,
            status: 'ACTIVE',
            auth_token: authToken
        })
        .select()
        .single();

    if (mError) {
        console.error('Member Create Error:', mError);
        return { success: false, error: mError.message };
    }

    // 3. Create the initial membership
    const startDate = new Date();
    const nextDue = new Date();
    nextDue.setDate(startDate.getDate() + durationDays);

    const { error: msError } = await supabaseAdmin
        .from('memberships')
        .insert({
            member_id: member.id,
            tenant_id: tenantId,
            plan_name: planName,
            amount: price,
            start_date: startDate.toISOString().split('T')[0],
            next_due_date: nextDue.toISOString().split('T')[0],
            status: 'ACTIVE'
        });

    if (msError) {
        console.error('Membership Create Error:', msError);
        return { success: false, error: msError.message };
    }

    revalidatePath('/admin/members');
    return { success: true, member };
}
