'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toggleTenantStatus } from '@/app/actions/superadmin';

interface Tenant {
    id: string;
    name: string;
    country: string;
    admin_email: string;
    status: string;
    members: { count: number }[];
}

interface TenantsClientProps {
    tenants: Tenant[];
}

export default function TenantsClient({ tenants: initialTenants }: TenantsClientProps) {
    const [tenants, setTenants] = useState(initialTenants);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleToggleStatus(tenantId: string) {
        setLoading(tenantId);
        try {
            const result = await toggleTenantStatus(tenantId);
            if (result.success) {
                setTenants(prev =>
                    prev.map(t =>
                        t.id === tenantId
                            ? { ...t, status: result.newStatus || t.status }
                            : t
                    )
                );
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Toggle error:', error);
        } finally {
            setLoading(null);
        }
    }

    return (
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
                    {tenants?.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-white/5 transition-all group">
                            <td className="px-6 py-4">
                                <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{tenant.name}</div>
                                <div className="text-[10px] text-white/30 font-mono uppercase">{tenant.id}</div>
                            </td>
                            <td className="px-6 py-4 text-white/70">
                                {tenant.country}
                                <div className="text-[10px] text-white/30">{tenant.admin_email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${tenant.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {tenant.status === 'ACTIVE' ? 'ACTIVO' : 'SUSPENDIDO'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-white/60">
                                <span className="font-mono">
                                    {Array.isArray(tenant.members) && tenant.members[0]
                                        ? tenant.members[0].count
                                        : 0}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link
                                    href={`/admin?tenant_id=${tenant.id}`}
                                    className="text-emerald-400 hover:text-white text-xs font-black uppercase tracking-widest mr-4 transition-colors"
                                >
                                    Acceder
                                </Link>
                                <Link
                                    href={`/superadmin/tenants/${tenant.id}/edit`}
                                    className="text-brand-400 hover:text-white text-xs font-black uppercase tracking-widest mr-4 transition-colors"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleToggleStatus(tenant.id)}
                                    disabled={loading === tenant.id}
                                    className={`text-xs font-black uppercase tracking-widest transition-colors ${tenant.status === 'ACTIVE'
                                        ? 'text-red-400/50 hover:text-red-400'
                                        : 'text-green-400/50 hover:text-green-400'
                                        }`}
                                >
                                    {loading === tenant.id ? (
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                        </span>
                                    ) : tenant.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {!tenants?.length && <div className="p-12 text-center text-white/20 italic">No hay gimnasios registrados.</div>}
        </div>
    );
}
