import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { addDays, subDays, startOfDay, format, isBefore, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

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
                tenants (id, name, currency_symbol),
                membership_plans (name, price)
            `);

        if (fetchError) throw fetchError;

        const updates = [];
        const notifications = [];
        let processedCount = 0;
        let notificationsQueued = 0;

        for (const membership of memberships || []) {
            const nextDue = startOfDay(new Date(membership.next_due_date));
            const member = membership.members;
            const tenant = membership.tenants;
            const plan = membership.membership_plans;

            if (!member || !tenant) continue;

            let newStatus: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' = 'ACTIVE';

            // 2. Determine State
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

            const formattedDate = format(nextDue, "EEEE d 'de' MMMM", { locale: es });
            const planName = plan?.name || 'membresía';
            const price = plan?.price ? `${tenant.currency_symbol || 'Q'}${plan.price}` : '';

            // 3. Generate Reminders with improved messages
            // 5 days before
            const d5 = subDays(nextDue, 5);
            if (isSameDay(today, d5)) {
                notifications.push({
                    member,
                    tenant,
                    type: 'REMINDER_5D',
                    title: '📅 Recordatorio de pago',
                    body: `¡Hola *${member.name}*! 👋 Tu progreso en *${tenant.name}* es increíble. No dejes que se detenga: tu membresía vence el *${formattedDate}*. ¡Renuévala hoy y sigue rompiendo tus metas! 💪🚀`
                });
            }

            // 2 days before
            const d2 = subDays(nextDue, 2);
            if (isSameDay(today, d2)) {
                notifications.push({
                    member,
                    tenant,
                    type: 'REMINDER_2D',
                    title: '⚠️ Tu membresía vence pronto',
                    body: `¡*${member.name}*! ⏰ Faltan solo 2 días para el vencimiento de tu plan en *${tenant.name}*. "La disciplina es el puente entre tus metas y tus logros." ¡Te esperamos hoy para renovar! 🔥🏋️`
                });
            }

            // Today
            if (isSameDay(today, nextDue)) {
                notifications.push({
                    member,
                    tenant,
                    type: 'DUE_TODAY',
                    title: '🔔 Hoy vence tu membresía',
                    body: `¡Hoy es el día, *${member.name}*! 🔔 Tu membresía en *${tenant.name}* vence hoy. No pierdas el impulso que traes. "Si te cansas, aprende a descansar, no a rendirte." ¡Pasa por recepción y sigue adelante! 🎯💪`
                });
            }

            // 3 days after
            const a3 = addDays(nextDue, 3);
            if (isSameDay(today, a3)) {
                notifications.push({
                    member,
                    tenant,
                    type: 'RECOVERY_3D',
                    title: '💪 Te extrañamos',
                    body: `¡Hola *${member.name}*! Te extrañamos en *${tenant.name}* 🥺. Sabemos que volver es la parte más difícil, pero "cada entrenamiento cuenta". Tu membresía venció hace 3 días, ¡vuelve hoy y recupera el ritmo! 🔥💥`
                });
            }

            // 7 days after - final reminder
            const a7 = addDays(nextDue, 7);
            if (isSameDay(today, a7)) {
                notifications.push({
                    member,
                    tenant,
                    type: 'RECOVERY_7D',
                    title: '🎁 Oferta especial para ti',
                    body: `¡*${member.name}*! Han pasado 7 días sin verte por *${tenant.name}*. 😔 "El único entrenamiento malo es el que no ocurrió." Queremos motivarte a volver: pasa por recepción y pregunta por nuestra oferta de reactivación. ¡Tu mejor versión te espera! 🏋️✨`
                });
            }

            processedCount++;
        }

        // Wait for all status updates
        await Promise.all(updates);

        // Process notifications
        for (const notif of notifications) {
            const { member, tenant, type, title, body } = notif;

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

                // Queue WhatsApp if member has phone
                if (member.phone) {
                    await supabaseAdmin.from('whatsapp_outbox').insert({
                        tenant_id: member.tenant_id,
                        member_id: member.id,
                        phone: member.phone,
                        body,
                        status: 'PENDING',
                        content_sid: 'HX40efcc316e53794c7f4dd94e80854ef6',
                        content_variables: {
                            '1': member.name,
                            '2': tenant.name,
                            '3': body
                        }
                    });
                }

                notificationsQueued++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            notifications_queued: notificationsQueued,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Daily Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Also support GET for Vercel Cron
export async function GET(req: Request) {
    return POST(req);
}
