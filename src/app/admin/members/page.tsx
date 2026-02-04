import { supabaseAdmin } from '@/lib/supabaseServer';
import AddMemberModal from '@/components/admin/AddMemberModal';
import MemberActions from '@/components/admin/MemberActions';

export default async function MembersPage() {
    const { data: tenants, error: tError } = await supabaseAdmin.from('tenants').select('*');
    const tenant = tenants?.[0];

    if (tError) console.error('Error fetching tenant:', tError);

    const currency = tenant?.currency_symbol || 'Q';

    // Fetch Members
    const { data: members, error } = await supabaseAdmin
        .from('members')
        .select(`
            *,
            memberships(id, plan_name, next_due_date, status, amount)
        `)
        .order('name');

    // Fetch Products for POS
    const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Miembros</h1>
                    <p className="text-white/50">Gestiona la lista de socios y sus membresías.</p>
                </div>
                <div className="w-full md:w-auto">
                    {tenant ? (
                        <AddMemberModal tenantId={tenant.id} />
                    ) : (
                        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 font-bold">
                            ⚠️ No se detectó configuración del Gym. Revisa Ajustes.
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] tracking-widest font-black text-white/40">
                        <tr>
                            <th className="px-6 py-5">Socio / Plan</th>
                            <th className="px-6 py-5">Teléfono</th>
                            <th className="px-6 py-5">Monto</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-6 py-5 text-right">Vencimiento / Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {members?.map((member: any) => {
                            const membership = member.memberships?.[0] || {};
                            const status = membership.status || member.status;

                            return (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-lg">{member.name}</div>
                                        <div className="text-[10px] text-brand-400 uppercase tracking-widest font-black">{membership.plan_name || 'Sin Plan'}</div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-white/60 font-mono">{member.phone}</td>
                                    <td className="px-6 py-5 text-sm font-bold">
                                        {currency} {membership.amount || '0.00'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                            status === 'EXPIRING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/20' :
                                                'bg-red-500/20 text-red-400 border-red-500/20'
                                            }`}>
                                            {status === 'ACTIVE' ? 'Activo' : 'Vencido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <MemberActions
                                            member={member}
                                            membership={membership}
                                            products={products || []}
                                        />
                                        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1 group-hover:opacity-0 transition-opacity">
                                            {membership.next_due_date ? `Vence: ${new Date(membership.next_due_date).toLocaleDateString()}` : 'Sin Vencimiento'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!members?.length && !error && (
                    <div className="p-20 text-center">
                        <div className="text-4xl mb-4 opacity-20">👥</div>
                        <div className="text-white/30 font-bold uppercase tracking-widest">No se encontraron miembros</div>
                    </div>
                )}
            </div>
        </div>
    );
}
