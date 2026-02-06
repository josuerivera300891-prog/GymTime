import { supabaseAdmin } from '@/lib/supabaseServer';
import TwilioClient from '@/components/admin/TwilioClient';

export default async function TwilioPage() {
    const { data: accounts } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*, tenants(name)');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Configuración de Twilio (SaaS)</h1>
                <p className="text-white/50">Gestiona las subcuentas y números de WhatsApp de cada gimnasio.</p>
            </header>

            <TwilioClient accounts={accounts || []} />
        </div>
    );
}
