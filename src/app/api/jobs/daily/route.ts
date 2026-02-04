import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { addDays, subDays, startOfDay, format, isBefore, isSameDay } from 'date-fns';

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const today = startOfDay(new Date());

        // 1. Fetch all memberships with member and tenant info
        const { data: memberships, error: fetchError } = await supabaseAdmin
            .from('memberships')
            .select(`
        *,
        members (id, name, phone, tenant_id),
        tenants (id, name)
      `);

        if (fetchError) throw fetchError;

        const updates = [];
        const notifications = [];

        for (const membership of memberships) {
            const nextDue = startOfDay(new Date(membership.next_due_date));
            const member = membership.members;

            let newStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' = 'ACTIVE';

            // 2. Determine State
            // ACTIVE -> hoy < next_due_date - 2
            // EXPIRING -> hoy >= next_due_date - 2 AND hoy <= next_due_date
            // EXPIRED -> hoy > next_due_date

            const expiringThreshold = subDays(nextDue, 2);

            if (isBefore(today, expiringThreshold)) {
                newStatus = 'ACTIVE';
            } else if (isSameDay(today, expiringThreshold) || (isBefore(today, nextDue) || isSameDay(today, nextDue))) {
                newStatus = 'EXPIRING';
            } else if (isBefore(nextDue, today)) {
                newStatus = 'EXPIRED';
            }

            // Update member status
            updates.push(
                supabaseAdmin
                    .from('members')
                    .update({ status: newStatus })
                    .eq('id', member.id)
            );

            // 3. Generate Reminders
            // 5 days before
            const d5 = subDays(nextDue, 5);
            if (isSameDay(today, d5)) {
                notifications.push({ member, type: 'REMINDER_5D', title: 'Recordatorio de pago', body: `Hola ${member.name}, te recordamos que tu membresía en ${membership.tenants.name} vence en 5 días.` });
            }

            // 2 days before
            const d2 = subDays(nextDue, 2);
            if (isSameDay(today, d2)) {
                notifications.push({ member, type: 'REMINDER_2D', title: 'Tu membresía está por vencer', body: `Hola ${member.name}, tu membresía vence en 2 días. No olvides realizar tu pago.` });
            }

            // Today
            if (isSameDay(today, nextDue)) {
                notifications.push({ member, type: 'DUE_TODAY', title: 'Día de pago', body: `Hola ${member.name}, hoy vence tu membresía. Te esperamos para renovarla!` });
            }

            // 3 days after
            const a3 = addDays(nextDue, 3);
            if (isSameDay(today, a3)) {
                notifications.push({ member, type: 'RECOVERY_3D', title: 'Membresía vencida', body: `Hola ${member.name}, notamos que tu membresía venció hace 3 días. ¡Vuelve pronto!` });
            }
        }

        // Wait for all status updates
        await Promise.all(updates);

        // Process notifications
        for (const notif of notifications) {
            const { member, type, title, body } = notif;

            // Attempt to log reminder (unique constraint prevents duplicates for same member/type/day)
            const { data: log, error: logError } = await supabaseAdmin
                .from('reminders_log')
                .insert({
                    tenant_id: member.tenant_id,
                    member_id: member.id,
                    type,
                    triggered_on: format(today, 'yyyy-MM-dd')
                })
                .select()
                .single();

            if (log) {
                // Only queue push if log was successful (no duplicate)
                await supabaseAdmin.from('push_outbox').insert({
                    tenant_id: member.tenant_id,
                    member_id: member.id,
                    title,
                    body,
                    status: 'PENDING'
                });

                // Queue WhatsApp
                await supabaseAdmin.from('whatsapp_outbox').insert({
                    tenant_id: member.tenant_id,
                    member_id: member.id,
                    phone: member.phone,
                    body,
                    status: 'PENDING'
                });
            }
        }

        return NextResponse.json({ success: true, processed: memberships.length });
    } catch (error: any) {
        console.error('Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
