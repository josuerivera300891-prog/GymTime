import { supabaseAdmin } from '@/lib/supabaseServer';
import TwilioClient from '@/components/admin/TwilioClient';

export default async function TwilioPage() {
    const { data: accounts } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*, tenants(name, id)');

    const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('id, name')
        .order('name');

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col gap-1 px-4">
                <div className="text-[10px] font-black bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-[0.2em] uppercase">
                    GYMTIME · SUPERVISOR
                </div>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Configuración Twilio</h1>
                <p className="text-white/40 text-sm italic">Gestión centralizada de comunicaciones WhatsApp por sede.</p>
            </header>

            <TwilioClient accounts={accounts || []} allTenants={tenants || []} />
        </div>
    );
}
