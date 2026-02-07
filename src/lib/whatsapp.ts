import { supabaseAdmin } from './supabaseServer';
import twilio from 'twilio';

interface WhatsAppPayload {
    tenant_id: string;
    phone: string;
    body?: string;
    contentSid?: string;
    contentVariables?: Record<string, string>;
}

/**
 * Centered utility to send WhatsApp messages using the tenant's Twilio configuration
 */
export async function sendWhatsAppMessage({ tenant_id, phone, body, contentSid, contentVariables }: WhatsAppPayload) {
    try {
        // 1. Fetch Twilio config for this specific tenant
        const { data: config, error: configError } = await supabaseAdmin
            .from('twilio_accounts')
            .select('*')
            .eq('tenant_id', tenant_id)
            .single();

        if (configError || !config) {
            throw new Error(`Configuración de Twilio no encontrada para el tenant: ${tenant_id}`);
        }

        if (config.status !== 'ACTIVE') {
            return { success: false, error: 'WhatsApp service is not active' };
        }

        // 2. Initialize Twilio Client
        const client = twilio(config.account_sid, config.auth_token);

        // 3. Format Numbers
        const fromNumber = config.whatsapp_number.startsWith('whatsapp:')
            ? config.whatsapp_number
            : `whatsapp:${config.whatsapp_number}`;

        const cleanPhone = phone.replace(/\D/g, '');
        const toNumber = `whatsapp:+${cleanPhone}`;

        // 4. Send Message (Template or Free-form)
        const messagePayload: any = {
            from: fromNumber,
            to: toNumber,
        };

        if (contentSid) {
            messagePayload.contentSid = contentSid;
            if (contentVariables) {
                messagePayload.contentVariables = JSON.stringify(contentVariables);
            }
        } else if (body) {
            messagePayload.body = body;
        } else {
            throw new Error('Debe proporcionar un body o un contentSid');
        }

        const response = await client.messages.create(messagePayload);

        // 5. Log in outbox for audit
        await supabaseAdmin
            .from('whatsapp_outbox')
            .insert({
                tenant_id,
                phone: cleanPhone,
                body: body || `Template: ${contentSid}`,
                status: 'SENT',
                sent_at: new Date().toISOString()
            });

        return { success: true, sid: response.sid };

    } catch (error: any) {
        console.error('Error enviando WhatsApp:', error);

        // Log failure
        await supabaseAdmin
            .from('whatsapp_outbox')
            .insert({
                tenant_id,
                phone: phone.replace(/\D/g, ''),
                body: body || `Template: ${contentSid}`,
                status: 'FAILED',
                error: error.message,
                sent_at: new Date().toISOString()
            });

        return { success: false, error: error.message };
    }
}
