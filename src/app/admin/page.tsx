import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function AdminDashboard() {
    // For demo purposes, we fetch all or filter by a specific tenant_id if we had it in session
    // In a real app, we'd get tenant_id from user's custom claims or staff_users table

    const { data: tenant } = await supabaseAdmin.from('tenants').select('*').limit(1).single();
    const currency = tenant?.currency_symbol || 'Q';

    const { count: totalMembers } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true });

    const { count: activeMembers } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE');

    const { count: expiredMembers } = await supabaseAdmin
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'EXPIRED');

    const { data: recentPayments } = await supabaseAdmin
        .from('payments')
        .select('*, memberships(members(name))')
        .order('paid_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8">
            <header>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-white/50">Bienvenido de nuevo, aquí tienes el resumen del gimnasio.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mr-2">País:</span>
                        <span className="text-white font-bold text-sm">{tenant?.country || 'GT'}</span>
                    </div>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card">
                    <div className="text-white/50 text-sm mb-1">Miembros Activos</div>
                    <div className="text-4xl font-bold text-green-400">{activeMembers || 0}</div>
                </div>
                <div className="glass-card">
                    <div className="text-white/50 text-sm mb-1">Por Vencer / Vencidos</div>
                    <div className="text-4xl font-bold text-orange-400">{expiredMembers || 0}</div>
                </div>
                <div className="glass-card">
                    <div className="text-white/50 text-sm mb-1">Total Registrados</div>
                    <div className="text-4xl font-bold text-brand-400">{totalMembers || 0}</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card">
                <h2 className="text-xl font-semibold mb-4">Pagos Recientes</h2>
                <div className="space-y-4">
                    {recentPayments?.map((payment: any) => (
                        <div key={payment.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                            <div>
                                <div className="font-medium">{payment.memberships?.members?.name}</div>
                                <div className="text-xs text-white/40">{new Date(payment.paid_at).toLocaleDateString()}</div>
                            </div>
                            <div className="font-bold text-brand-400">{currency}{payment.amount}</div>
                        </div>
                    ))}
                    {!recentPayments?.length && <div className="text-white/30 text-center py-4">No hay pagos recientes</div>}
                </div>
            </div>
        </div>
    );
}
