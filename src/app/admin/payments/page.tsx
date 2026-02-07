import { supabaseAdmin } from '@/lib/supabaseServer';
import { getAuthorizedTenantId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PaymentsPage({
    searchParams
}: {
    searchParams: { tenant_id?: string }
}) {
    const tenantIdParam = searchParams?.tenant_id;

    // 1. Resolve Tenant and Auth
    let tenantId: string | null = null;
    try {
        const auth = await getAuthorizedTenantId(tenantIdParam);
        tenantId = auth.tenantId;
    } catch (e) {
        redirect('/login');
    }

    if (!tenantId) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Acceso no válido</h1>
                <p className="text-white/50">Debes seleccionar un gimnasio válido para ver los pagos.</p>
            </div>
        );
    }

    // 2. Fetch Tenant Data for Currency and Country
    const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

    const currency = tenant?.currency_symbol || 'Q';

    // 3. Fetch Payments filtered by Tenant
    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('*, memberships(members(name))')
        .eq('tenant_id', tenantId)
        .order('paid_at', { ascending: false });

    // Calculate total revenue from these payments
    const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Historial de Pagos</h1>
                    <p className="text-white/50 text-sm">Registro completo de ingresos en <span className="text-white font-bold">{tenant?.country}</span>.</p>
                </div>
                <div className="text-left md:text-right bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Ingresos Totales (Sede)</div>
                    <div className="text-4xl font-black text-green-400">
                        <span className="text-lg mr-1 opacity-50">{currency}</span>
                        {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </header>

            <div className="glass-card !p-0 overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-white/30 tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Socio / Cliente</th>
                                <th className="px-8 py-5">Fecha de Pago</th>
                                <th className="px-8 py-5">Método</th>
                                <th className="px-8 py-5 text-right">Monto Operado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {payments?.map((payment: any) => (
                                <tr key={payment.id} className="hover:bg-white/[0.02] transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-white group-hover:text-brand-400 transition-colors">
                                            {payment.memberships?.members?.name || 'Venta Express / Producto'}
                                        </div>
                                        <div className="text-[10px] text-white/20 font-mono mt-1 uppercase tracking-tighter">
                                            ID: {payment.id.split('-')[0]}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-white/60 text-sm">
                                        {new Date(payment.paid_at).toLocaleDateString(undefined, {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${payment.method === 'CASH'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {payment.method === 'CASH' ? 'Efectivo' : 'Tarjeta'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-white text-lg">
                                        <span className="text-xs mr-1 opacity-20">{currency}</span>
                                        {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!payments?.length && (
                    <div className="py-32 text-center text-white/20 italic bg-white/[0.01]">
                        <div className="text-4xl mb-4 opacity-10">💸</div>
                        <p className="text-xs uppercase font-black tracking-widest">No hay registros de pagos en esta sede.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
