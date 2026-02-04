import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function SuperAdminDashboard() {
    const { data: tenants } = await supabaseAdmin.from('tenants').select('*');
    const { count: totalMembers } = await supabaseAdmin.from('members').select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Consola de SuperAdmin</h1>
                <p className="text-white/50">Vista global del ecosistema GymTime (Skala Marketing).</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card">
                    <div className="text-white/50 text-sm mb-1">Total Gimnasios</div>
                    <div className="text-4xl font-bold">{tenants?.length || 0}</div>
                </div>
                <div className="glass-card">
                    <div className="text-white/50 text-sm mb-1">Total Socios Global</div>
                    <div className="text-4xl font-bold text-brand-400">{totalMembers || 0}</div>
                </div>
            </div>

            <div className="glass-card">
                <h2 className="text-xl font-semibold mb-6">Gimnasios Activos</h2>
                <div className="space-y-4">
                    {tenants?.map((t: any) => (
                        <div key={t.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div>
                                <div className="font-bold">{t.name}</div>
                                <div className="text-xs text-white/40">{t.country} • {t.timezone}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${t.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {t.status}
                                </span>
                                <button className="text-brand-400 hover:underline text-sm font-medium">Gestionar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
