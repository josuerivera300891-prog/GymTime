import { supabaseAdmin } from '@/lib/supabaseServer';
import BrandingForm from '@/components/admin/BrandingForm';

export default async function SettingsPage() {
    // In a real app, we'd fetch for the specific tenant_id of the session
    // For demo, we get the first one available
    const { data: tenant, error: tError } = await supabaseAdmin.from('tenants').select('*').limit(1).single();
    const { data: twilio } = await supabaseAdmin.from('twilio_accounts').select('*').eq('tenant_id', tenant?.id).single();

    return (
        <div className="space-y-8 max-w-4xl">
            <header>
                <h1 className="text-3xl font-bold">Configuración del Gym</h1>
                <p className="text-white/50">Gestiona la identidad de tu gimnasio, marca y configuración regional.</p>
            </header>

            {!tenant ? (
                <div className="p-8 glass-card border-red-500/20 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">No se encontró configuración</h2>
                    <p className="text-white/60 mb-6">Parece que tu gimnasio aún no ha sido configurado en el sistema.</p>
                    {tError && <p className="text-red-400/50 text-xs mb-4 font-mono">Error: {tError.message}</p>}
                    <a href="/api/seed" className="btn-primary inline-block">Inicializar Datos de Prueba (Seed)</a>
                </div>
            ) : (
                <BrandingForm tenant={tenant} twilio={twilio} />
            )}
        </div>
    );
}
