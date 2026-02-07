import { getCurrentShift, getDashboardStats } from '@/app/actions/dashboard';
import DashboardClient from '@/components/admin/DashboardClient';
import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { isSuperAdminEmail } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminDashboard({ searchParams }: { searchParams: { tenant_id?: string } }) {
    const tenantIdParam = searchParams?.tenant_id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isSuperAdmin = isSuperAdminEmail(user?.email);

    // Si es SuperAdmin sin tenant seleccionado, mostrar selector de tenant
    if (isSuperAdmin && !tenantIdParam) {
        const { data: tenants, error: tenantsError } = await supabaseAdmin
            .from('tenants')
            .select('id, name, status')
            .eq('status', 'ACTIVE')
            .order('name');

        return (
            <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
                            ● SUPERVISOR
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">Selecciona un Gimnasio</h1>
                        <p className="text-white/50">Como SuperAdmin, primero debes elegir qué gimnasio administrar</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tenants?.map((tenant) => (
                            <Link
                                key={tenant.id}
                                href={`/admin?tenant_id=${tenant.id}`}
                                className="glass-card p-6 hover:border-brand-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 text-xl font-bold group-hover:bg-brand-500/30 transition-colors">
                                        {tenant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{tenant.name}</h3>
                                        <p className="text-xs text-white/40">Clic para gestionar</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {(!tenants || tenants.length === 0) && (
                        <div className="text-center py-12 space-y-4">
                            {tenantsError?.message === 'Invalid API key' ? (
                                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-lg mx-auto">
                                    <div className="text-3xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-bold text-red-400 mb-2">Error de Configuración</h3>
                                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                                        La clave de servicio de Supabase es inválida. Por favor, actualiza tu archivo <code className="bg-white/10 px-1 py-0.5 rounded text-white">.env.local</code> con la clave <code className="text-brand-400 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> correcta.
                                    </p>
                                    <Link href="/superadmin/settings" className="text-xs text-white/30 hover:underline">
                                        O revisa la configuración en el panel global →
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <p className="text-white/50 text-lg">No hay gimnasios activos.</p>
                                    <Link href="/superadmin/tenants/new" className="text-brand-400 hover:scale-105 transition-transform inline-block bg-brand-500/10 border border-brand-500/20 px-6 py-2 rounded-full font-bold">
                                        + Crear primer gimnasio
                                    </Link>
                                </>
                            )}
                        </div>
                    )}

                    <div className="text-center pt-8">
                        <Link href="/superadmin" className="text-white/40 hover:text-white text-sm">
                            ← Volver a SuperAdmin Panel
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const [statsRes, shift] = await Promise.all([
        getDashboardStats(tenantIdParam),
        getCurrentShift(tenantIdParam)
    ]);

    if (statsRes.error || !statsRes.tenantId) {
        return <div className="text-white p-10">Error cargando dashboard: {statsRes.error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {isSuperAdmin && (
                <div className="mb-6 flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-green-400 text-sm font-bold">● SUPERVISOR</span>
                        <span className="text-white/50 text-sm">Viendo: <span className="text-white font-bold">{statsRes.gymName}</span></span>
                    </div>
                    <Link href="/admin" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
                        Cambiar gimnasio →
                    </Link>
                </div>
            )}
            <DashboardClient
                stats={statsRes.stats!}
                currentShift={shift}
                tenantId={statsRes.tenantId}
                currencySymbol={statsRes.currencySymbol || 'Q'}
                gymName={statsRes.gymName}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
}
