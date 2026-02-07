import { supabaseAdmin } from '@/lib/supabaseServer';
import BrandingForm from '@/components/admin/BrandingForm';
import { getAuthorizedTenantId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage({
    searchParams
}: {
    searchParams: { tenant_id?: string }
}) {
    const tenantIdParam = searchParams?.tenant_id;

    // 1. Resolve Tenant and Auth
    let tenantId: string | null = null;
    let isSuperAdmin = false;

    try {
        const auth = await getAuthorizedTenantId(tenantIdParam);
        tenantId = auth.tenantId;
        isSuperAdmin = auth.isSuperAdmin;
    } catch (e) {
        redirect('/login');
    }

    // Si es SuperAdmin sin tenant seleccionado, mostrar selector de tenant
    if (isSuperAdmin && !tenantId) {
        const { data: tenants, error: tenantsError } = await supabaseAdmin
            .from('tenants')
            .select('id, name, status')
            .eq('status', 'ACTIVE')
            .order('name');

        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                        ● SUPERVISOR
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Configuración de Sede</h1>
                    <p className="text-white/50">Como SuperAdmin, selecciona qué gimnasio deseas configurar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenants?.map((tenant) => (
                        <Link
                            key={tenant.id}
                            href={`/admin/settings?tenant_id=${tenant.id}`}
                            className="glass-card p-6 hover:border-brand-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-xl font-bold group-hover:bg-brand-500/30 transition-colors">
                                    {tenant.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{tenant.name}</h3>
                                    <p className="text-xs text-white/40">Configurar sede</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {(!tenants || tenants.length === 0) && (
                    <div className="text-center py-12">
                        <p className="text-white/50 text-lg">No hay gimnasios activos disponibles.</p>
                    </div>
                )}

                <div className="text-center pt-8">
                    <Link href="/superadmin" className="text-white/40 hover:text-white text-sm">
                        ← Volver a SuperAdmin Panel
                    </Link>
                </div>
            </div>
        );
    }

    if (!tenantId) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Acceso no válido</h1>
                <p className="text-white/50">Debes seleccionar un gimnasio válido para ver la configuración.</p>
            </div>
        );
    }

    // 2. Fetch Tenant Data
    const { data: tenant, error: tError } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

    // 3. Fetch Twilio Data
    const { data: twilio } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Configuración de Sede</h1>
                <p className="text-white/50 text-sm">Gestiona la identidad visual, regional y operativa de <span className="text-white font-bold">{tenant?.name}</span>.</p>
            </header>

            {!tenant ? (
                <div className="p-12 glass-card border-red-500/20 text-center bg-red-500/[0.02]">
                    <div className="text-5xl mb-6">⚠️</div>
                    <h2 className="text-2xl font-black text-white mb-4 uppercase">Sede no encontrada</h2>
                    <p className="text-white/60 mb-8 max-w-md mx-auto">Parece que la configuración para este gimnasio no existe o ha sido eliminada.</p>
                    {tError && <p className="text-red-400/50 text-xs mb-6 font-mono bg-black/20 p-2 rounded">Error LOG: {tError.message}</p>}
                </div>
            ) : (
                <BrandingForm tenant={tenant} twilio={twilio} />
            )}
        </div>
    );
}
