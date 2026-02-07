'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toggleTenantStatus } from '@/app/actions/superadmin';
import {
    Building2,
    Users as UsersIcon,
    ArrowUpRight,
    Edit3,
    Power,
    MapPin,
    Mail,
    Search,
    ChevronRight,
    CircleDashed
} from 'lucide-react';

interface Tenant {
    id: string;
    name: string;
    country: string;
    admin_email: string | null;
    status: string;
    members: { count: number }[];
}

interface TenantsClientProps {
    tenants: Tenant[];
}

export default function TenantsClient({ tenants: initialTenants }: TenantsClientProps) {
    const [tenants, setTenants] = useState(initialTenants);
    const [loading, setLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    async function handleToggleStatus(tenantId: string) {
        if (!confirm('¿Cambiar estado de este gimnasio?')) return;
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
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-2">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filtrar por nombre o ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:border-brand-500/50 outline-none transition-all"
                    />
                </div>
                <div className="text-[10px] text-white/30 font-black uppercase tracking-widest hidden sm:block">
                    {filteredTenants.length} Resultados
                </div>
            </div>

            <div className="glass-card !p-0 overflow-hidden border-white/5 bg-black/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Gimnasio</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Ubicación / Admin</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Estado</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Socios</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-white/[0.02] transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-black text-white/20 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all">
                                                {tenant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-lg text-white group-hover:text-brand-400 transition-colors uppercase tracking-tight">{tenant.name}</div>
                                                <div className="text-[9px] text-white/20 font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                    <span className="opacity-50">ID:</span> {tenant.id.split('-')[0]}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <div className="text-xs text-white/70 font-bold flex items-center gap-2">
                                                <MapPin size={12} className="text-white/20" />
                                                {tenant.country}
                                            </div>
                                            <div className="text-[10px] text-white/30 flex items-center gap-2 italic">
                                                <Mail size={10} className="text-white/10" />
                                                {tenant.admin_email || 'No asignado'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase transition-all ${tenant.status === 'ACTIVE'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                            {tenant.status === 'ACTIVE' ? 'ACTIVO' : 'SUSPENDIDO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform">
                                                {Array.isArray(tenant.members) && tenant.members[0]
                                                    ? tenant.members[0].count
                                                    : 0}
                                            </div>
                                            <div className="text-[8px] text-brand-400 uppercase font-black tracking-widest bg-brand-400/10 px-1.5 py-0.5 rounded-md">Total</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin?tenant_id=${tenant.id}`}
                                                className="h-10 px-4 rounded-xl bg-brand-500/10 hover:bg-brand-500 border border-brand-500/20 hover:border-brand-500 text-[10px] font-black uppercase tracking-widest text-brand-400 hover:text-black transition-all flex items-center gap-2 group/btn"
                                            >
                                                GESTIONAR
                                                <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </Link>
                                            <Link
                                                href={`/superadmin/tenants/${tenant.id}/edit`}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-all"
                                                title="Configuración de Sede"
                                            >
                                                <Edit3 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleToggleStatus(tenant.id)}
                                                disabled={loading === tenant.id}
                                                className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${tenant.status === 'ACTIVE'
                                                    ? 'bg-red-500/5 border-red-500/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/10'
                                                    : 'bg-green-500/5 border-green-500/10 text-green-400/50 hover:text-green-400 hover:bg-green-500/10'
                                                    }`}
                                                title={tenant.status === 'ACTIVE' ? 'Suspender Operaciones' : 'Reactivar Gimnasio'}
                                            >
                                                {loading === tenant.id ? (
                                                    <CircleDashed size={16} className="animate-spin" />
                                                ) : (
                                                    <Power size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredTenants.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                            <Building2 size={40} />
                        </div>
                        <div className="space-y-1">
                            <div className="text-white/40 font-bold italic">No se encontraron gimnasios.</div>
                            {searchQuery && <p className="text-white/20 text-xs">Intenta con otro término de búsqueda.</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
