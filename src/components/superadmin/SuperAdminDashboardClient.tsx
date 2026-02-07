'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Users,
    Building2,
    CircleDollarSign,
    Activity,
    Plus,
    Search,
    ChevronRight,
    ArrowUpRight,
    Settings,
    Shield
} from 'lucide-react';

interface Stats {
    totalTenants: number;
    activeTenants: number;
    totalMembers: number;
    activeMemberships: number;
    totalRevenue: number;
    totalAttendance: number;
}

export default function SuperAdminDashboardClient({
    tenants,
    stats
}: {
    tenants: any[];
    stats: Stats;
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <div className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">
                            GYMTIME · RED GLOBAL
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Panel de Supervisor</h1>
                    <p className="text-white/40 text-sm">Monitoreo y gestión centralizada de <b className="text-white">{tenants.length}</b> gimnasios activos.</p>
                </div>
                <Link href="/superadmin/tenants/new" className="btn-primary !rounded-2xl flex items-center gap-2 py-3 px-6 text-sm font-black shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                    <Plus size={18} strokeWidth={3} />
                    NUEVO GIMNASIO
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Building2 size={24} />}
                    label="Gimnasios"
                    value={`${stats.activeTenants}/${stats.totalTenants}`}
                    color="blue"
                    subLabel="Sedes Activas"
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Socios Totales"
                    value={stats.totalMembers.toLocaleString()}
                    color="green"
                    subLabel="Usuarios Red"
                />
                <StatCard
                    icon={<CircleDollarSign size={24} />}
                    label="Recaudación"
                    value={`Q${stats.totalRevenue.toLocaleString()}`}
                    color="brand"
                    subLabel="Total Pagos"
                />
                <StatCard
                    icon={<Activity size={24} />}
                    label="Asistencias"
                    value={stats.totalAttendance.toLocaleString()}
                    color="purple"
                    subLabel="Últimos 30 días"
                />
            </div>

            <div className="glass-card overflow-hidden !p-0 border-white/5">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/[0.02] gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-400">
                            <Building2 size={18} />
                        </div>
                        <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Directorio de Sedes</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar gimnasio..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-9 pr-4 text-xs text-white focus:border-brand-500/50 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredTenants.map((t) => (
                        <div key={t.id} className="group flex flex-wrap justify-between items-center p-6 hover:bg-white/[0.02] transition-all gap-4">
                            <div className="flex items-center gap-4 min-w-[280px]">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-black text-white/20 group-hover:scale-110 transition-transform">
                                    {t.name.charAt(0)}
                                </div>
                                <div className="space-y-1">
                                    <div className="font-black text-lg text-white group-hover:text-brand-400 transition-colors uppercase tracking-tight flex items-center gap-2">
                                        {t.name}
                                        {t.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                    </div>
                                    <div className="text-xs text-white/40 flex items-center gap-3">
                                        <span className="flex items-center gap-1">📍 {t.country}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10" />
                                        <span className="flex items-center gap-1 opacity-70 italic font-medium">{t.id.split('-')[0]}...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block space-y-1">
                                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">Zona Horaria</div>
                                    <div className="text-[10px] text-white/60 font-bold uppercase">{t.timezone}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/superadmin/tenants/${t.id}/edit`}
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white transition-all"
                                        title="Configuración de Sede"
                                    >
                                        <Settings size={16} />
                                    </Link>
                                    <Link
                                        href={`/admin?tenant_id=${t.id}`}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500 text-brand-400 hover:text-black border border-brand-500/20 hover:border-brand-500 text-xs font-black transition-all uppercase tracking-widest group/btn"
                                    >
                                        Gestionar
                                        <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTenants.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                            <div className="text-6xl grayscale opacity-20">🔍</div>
                            <div className="space-y-1">
                                <p className="text-white/40 font-bold italic">No encontramos gimnasios que coincidan.</p>
                                <p className="text-white/20 text-xs">Intenta con otro término de búsqueda.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="glass-card !p-6 flex items-center gap-5 border-white/5 group hover:border-brand-500/20 transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-brand-400 transition-colors">
                        <Shield size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white uppercase italic">Auditoría de Accesos</div>
                        <div className="text-xs text-white/40">Ver quién ha entrado al panel hoy.</div>
                    </div>
                    <ChevronRight className="ml-auto text-white/10 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" size={20} />
                </div>
                <Link href="/superadmin/tenants/new" className="glass-card !p-6 flex items-center gap-5 border-white/5 group hover:border-brand-500/20 transition-all">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 group-hover:text-brand-400 transition-colors">
                        <Plus size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white uppercase italic">Instalar Nueva Sede</div>
                        <div className="text-xs text-white/40">Configurar un nuevo gimnasio en 60s.</div>
                    </div>
                    <ChevronRight className="ml-auto text-white/10 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" size={20} />
                </Link>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, subLabel }: any) {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/10",
        green: "text-green-400 bg-green-500/10",
        brand: "text-brand-400 bg-brand-500/10",
        purple: "text-purple-400 bg-purple-500/10"
    };

    return (
        <div className="glass-card !p-6 flex flex-col gap-4 group hover:translate-y-[-2px] transition-all">
            <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${colors[color]}`}>
                    {subLabel}
                </span>
            </div>
            <div>
                <div className="text-2xl font-black text-white group-hover:text-brand-400 transition-colors">{value}</div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}
