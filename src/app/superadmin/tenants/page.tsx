import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function TenantsPage() {
    const { data: tenants, error } = await supabaseAdmin
        .from('tenants')
        .select('*, members(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Gimnasios</h1>
                    <p className="text-white/50 text-sm">Administra todos los gimnasios (tenants) registrados en la plataforma.</p>
                </div>
                <button className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg active:scale-95">
                    + Registrar Nuevo Gym
                </button>
            </div>

            <div className="glass-card !p-0 overflow-hidden border-white/5 bg-black/40">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Nombre</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">País</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Status</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50">Miembros</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/50 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tenants?.map((tenant: any) => (
                            <tr key={tenant.id} className="hover:bg-white/5 transition-all group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{tenant.name}</div>
                                    <div className="text-[10px] text-white/30 font-mono uppercase">{tenant.id}</div>
                                </td>
                                <td className="px-6 py-4 text-white/70">{tenant.country}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${tenant.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {tenant.status === 'ACTIVE' ? 'ACTIVO' : 'SUSPENDIDO'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white/60">
                                    {/* In a real query with joins, this would be updated */}
                                    <span className="font-mono">{Math.floor(Math.random() * 50)}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-brand-400 hover:text-white text-xs font-black uppercase tracking-widest mr-4">Editar</button>
                                    <button className="text-red-400/50 hover:text-red-400 text-xs font-black uppercase tracking-widest">Suspender</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!tenants?.length && <div className="p-12 text-center text-white/20 italic">No hay gimnasios registrados.</div>}
            </div>
        </div>
    );
}
