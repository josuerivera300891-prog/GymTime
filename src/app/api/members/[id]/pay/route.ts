import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { addDays } from 'date-fns';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const memberId = params.id;
    const { amount, method } = await req.json();

    try {
        // 1. Get current membership
        const { data: membership, error: fetchError } = await supabaseAdmin
            .from('memberships')
            .select('*')
            .eq('member_id', memberId)
            .single();

        if (fetchError) throw fetchError;

        const today = new Date();
        // next_due_date = last_payment_date + 30 días
        // Note: If the user is early or late, we usually extend from the previous due date 
        // or from today depending on business rules. 
        // The prompt says: "next_due_date = last_payment_date + 30 días"
        // I will interpret last_payment_date as "today" (the date of the payment just made).
        const newDueDate = addDays(today, 30);

        // 2. Perform transaction (Supabase doesnt have explicit JS transactions easily across tables without RPC, 
        // but we can do sequential await or write a Postgres function)
        // For simplicity here, sequential awaits:

        // a. Create payment
        const { error: payError } = await supabaseAdmin
            .from('payments')
            .insert({
                tenant_id: membership.tenant_id,
                membership_id: membership.id,
                amount,
                method,
                paid_at: today.toISOString()
            });
        if (payError) throw payError;

        // b. Update membership
        const { error: memError } = await supabaseAdmin
            .from('memberships')
            .update({
                last_payment_date: today.toISOString(),
                next_due_date: newDueDate.toISOString()
            })
            .eq('id', membership.id);
        if (memError) throw memError;

        // c. Update member status
        const { error: statusError } = await supabaseAdmin
            .from('members')
            .update({ status: 'ACTIVE' })
            .eq('id', memberId);
        if (statusError) throw statusError;

        return NextResponse.json({ success: true, next_due_date: newDueDate });
    } catch (error: any) {
        console.error('Payment Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
