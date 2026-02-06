import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import webpush from 'web-push';

// VAPID keys are set lazily inside the POST handler to prevent build-time errors
let vapidConfigured = false;

function ensureVapidConfigured() {
    if (vapidConfigured) return true;

    const vapidSubject = process.env.VAPID_SUBJECT;
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (vapidSubject && vapidPublicKey && vapidPrivateKey) {
        try {
            webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
            vapidConfigured = true;
            return true;
        } catch (error) {
            console.error('Failed to configure VAPID:', error);
            return false;
        }
    }

    console.warn('⚠️ VAPID keys not configured. Push notifications will not work.');
    return false;
}


export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Configure VAPID lazily (at runtime, not build time)
    if (!ensureVapidConfigured()) {
        return NextResponse.json({ error: 'VAPID keys not properly configured' }, { status: 500 });
    }

    try {
        // 1. Fetch pending push notifications
        const { data: pending, error: fetchError } = await supabaseAdmin
            .from('push_outbox')
            .select('*, member_devices(*)')
            .eq('status', 'PENDING')
            .limit(50);

        if (fetchError) throw fetchError;

        const results = [];

        for (const msg of pending) {
            const devices = msg.member_devices ? [msg.member_devices] : [];

            // If no specific device_id in outbox, fetch all devices for this member
            if (!msg.device_id) {
                const { data: memberDevices } = await supabaseAdmin
                    .from('member_devices')
                    .select('*')
                    .eq('member_id', msg.member_id);
                if (memberDevices) devices.push(...memberDevices);
            }

            if (devices.length === 0) {
                await supabaseAdmin.from('push_outbox').update({ status: 'FAILED', error: 'No devices found' }).eq('id', msg.id);
                results.push({ id: msg.id, status: 'FAILED', error: 'No devices found' });
                continue;
            }

            let sentCount = 0;
            let failCount = 0;

            for (const device of devices) {
                try {
                    const pushSubscription = {
                        endpoint: device.push_endpoint,
                        keys: {
                            p256dh: device.push_p256dh,
                            auth: device.push_auth
                        }
                    };

                    await webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify({
                            title: msg.title,
                            body: msg.body,
                            icon: '/icons/icon-192x192.png',
                            data: { url: '/c' }
                        })
                    );
                    sentCount++;
                } catch (err: any) {
                    console.error(`Push failed for device ${device.id}:`, err);
                    failCount++;
                    // If 410 (Gone) or 404 (Not Found), remove device
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await supabaseAdmin.from('member_devices').delete().eq('id', device.id);
                    }
                }
            }

            await supabaseAdmin.from('push_outbox').update({
                status: sentCount > 0 ? 'SENT' : 'FAILED',
                sent_at: sentCount > 0 ? new Date().toISOString() : null,
                error: failCount > 0 ? `${failCount} devices failed` : null
            }).eq('id', msg.id);

            results.push({ id: msg.id, status: sentCount > 0 ? 'SUCCESS' : 'FAILED' });
        }

        return NextResponse.json({ success: true, processed: results.length, results });
    } catch (error: any) {
        console.error('Push Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
