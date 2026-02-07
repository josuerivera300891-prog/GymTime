import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import twilio from 'twilio';

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch pending whatsapp messages
        const { data: pending, error: fetchError } = await supabaseAdmin
            .from('whatsapp_outbox')
            .select('*, tenants(name)')
            .eq('status', 'PENDING')
            .limit(50); // Process in batches

        if (fetchError) throw fetchError;

        const results = [];

        // 2. Process each message
        for (const msg of pending) {
            try {
                // 3. Send WhatsApp via utility
                const { sendWhatsAppMessage } = await import('@/lib/whatsapp');

                const result = await sendWhatsAppMessage({
                    tenant_id: msg.tenant_id,
                    phone: msg.phone,
                    body: msg.body,
                    contentSid: msg.content_sid,
                    contentVariables: msg.content_variables
                });

                if (result.success) {
                    // Update outbox as SENT
                    await supabaseAdmin
                        .from('whatsapp_outbox')
                        .update({
                            status: 'SENT',
                            sent_at: new Date().toISOString()
                        })
                        .eq('id', msg.id);

                    results.push({ id: msg.id, status: 'SUCCESS' });
                } else {
                    throw new Error(result.error);
                }
            } catch (err: any) {
                console.error(`Failed to send WhatsApp ${msg.id}:`, err);

                // Update outbox as FAILED
                await supabaseAdmin
                    .from('whatsapp_outbox')
                    .update({ status: 'FAILED', error: err.message })
                    .eq('id', msg.id);

                results.push({ id: msg.id, status: 'FAILED', error: err.message });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, results });
    } catch (error: any) {
        console.error('WhatsApp Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
