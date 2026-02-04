import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function PaymentsPage() {
    const { data: tenant } = await supabaseAdmin.from('tenants').select('*').limit(1).single();
    const currency = tenant?.currency_symbol || 'Q';

    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('*, memberships(members(name))')
        .order('paid_at', { ascending: false });

    // Calculate total revenue from these payments
    const totalRevenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Historial de Pagos</h1>
                    <p className="text-white/50">Registro completo de ingresos ({tenant?.country}).</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/30 uppercase font-black mb-1">Ingresos Totales (Vista)</div>
                    <div className="text-3xl font-black text-green-400">{currency}{totalRevenue.toFixed(2)}</div>
                </div>
            </header>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase text-white/40">Socio</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-white/40">Fecha</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-white/40">Método</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-white/40 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {payments?.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-white/5 transition-all">
                                <td className="px-6 py-4 font-bold text-white">{payment.memberships?.members?.name}</td>
                                <td className="px-6 py-4 text-white/60">{new Date(payment.paid_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase font-bold text-white/60 border border-white/10">
                                        {payment.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-brand-400">{currency}{payment.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!payments?.length && <div className="p-20 text-center text-white/20 italic">No hay registros de pagos.</div>}
            </div>
        </div>
    );
}
