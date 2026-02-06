'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AddMemberModal from '@/components/admin/AddMemberModal';
import MemberActions from '@/components/admin/MemberActions';
import { useDebounce } from 'use-debounce'; // Assuming it's installed or we use useEffect

type MembersClientProps = {
    members: any[];
    currency: string;
    tenantId: string;
    products: any[];
    plans: any[];
};

export default function MembersClient({ members, currency, tenantId, products, plans }: MembersClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialQuery = searchParams.get('q') || '';
    const initialStatus = searchParams.get('status') || '';

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    // Debounce search term to avoid too many requests
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedSearchTerm) {
            params.set('q', debouncedSearchTerm);
        } else {
            params.delete('q');
        }

        if (statusFilter) {
            params.set('status', statusFilter);
        } else {
            params.delete('status');
        }

        router.replace(`?${params.toString()}`);
    }, [debouncedSearchTerm, statusFilter, router, searchParams]);

    const getWhatsAppLink = (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        return `https://wa.me/${cleanPhone}`;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="space-y-4 w-full xl:w-auto flex-1">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Miembros</h1>
                        <p className="text-white/50">Gestiona la lista de socios y sus membresías.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-96">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-brand-500 outline-none transition-all placeholder:text-white/20"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="ACTIVE">Activos</option>
                            <option value="EXPIRING">Por Vencer</option>
                            <option value="EXPIRED">Vencidos</option>
                        </select>
                    </div>
                </div>

                <div className="w-full xl:w-auto">
                    <AddMemberModal tenantId={tenantId} plans={plans} currency={currency} />
                </div>
            </div>

            <div className="glass-card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] tracking-widest font-black text-white/40">
                        <tr>
                            <th className="px-6 py-5">Socio / Plan</th>
                            <th className="px-6 py-5">Monto</th>
                            <th className="px-6 py-5">Estado</th>
                            <th className="px-6 py-5 text-right">Vencimiento / Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {members.map((member) => {
                            const membership = member.memberships?.[0] || {};
                            const status = membership.status || member.status;

                            return (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-lg text-white">{member.name}</div>
                                        <div className="text-[10px] text-brand-400 uppercase tracking-widest font-black flex items-center gap-1">
                                            {membership.plan_name || 'Sin Plan'}
                                            <span className="text-white/20 font-mono ml-2">• {member.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm font-bold text-white">
                                        {currency} {membership.amount || '0.00'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            status === 'EXPIRING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {status === 'ACTIVE' ? 'Activo' :
                                                status === 'EXPIRING' ? 'Por Vencer' : 'Vencido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right w-64">
                                        <div className="flex items-center justify-end gap-4">
                                            <div className="text-[10px] text-white/30 uppercase tracking-widest">
                                                {membership.next_due_date ? `Vence: ${new Date(membership.next_due_date).toLocaleDateString()}` : 'Sin Vencimiento'}
                                            </div>
                                            <MemberActions
                                                member={member}
                                                membership={membership}
                                                products={products || []}
                                                plans={plans || []}
                                                currency={currency}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {!members.length && (
                    <div className="p-20 text-center">
                        <div className="text-4xl mb-4 opacity-20">👥</div>
                        <div className="text-white/30 font-bold uppercase tracking-widest">
                            {searchTerm || statusFilter ? 'No hay resultados para tu búsqueda' : 'No se encontraron miembros'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
