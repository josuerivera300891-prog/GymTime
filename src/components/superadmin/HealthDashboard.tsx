'use client';

import React from 'react';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    MessageSquare,
    Bell,
    RefreshCcw,
    ShieldAlert,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HealthData {
    recentErrors: any[];
    twilioAccounts: any[];
    pendingQueues: {
        push: number;
        whatsapp: number;
    };
}

export default function HealthDashboard({ data }: { data: HealthData }) {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <header className="space-y-2">
                <div className="flex items-center gap-2">
                    <Activity className="text-brand-500" size={24} />
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Estado del Sistema</h1>
                </div>
                <p className="text-white/40 text-sm">Monitoreo técnico de integraciones y colas de procesos.</p>
            </header>

            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard
                    title="Cola de WhatsApp"
                    value={data.pendingQueues.whatsapp}
                    icon={<MessageSquare />}
                    status={data.pendingQueues.whatsapp > 50 ? 'warning' : 'ok'}
                    sub="Pendientes de envío"
                />
                <StatusCard
                    title="Cola de Push"
                    value={data.pendingQueues.push}
                    icon={<Bell />}
                    status={data.pendingQueues.push > 100 ? 'warning' : 'ok'}
                    sub="Notificaciones PWA"
                />
                <StatusCard
                    title="Errores Recientes"
                    value={data.recentErrors.length}
                    icon={<AlertTriangle />}
                    status={data.recentErrors.length > 0 ? 'error' : 'ok'}
                    sub="Últimas 24 horas"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Twilio Connection Status */}
                <div className="glass-card">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldAlert className="text-blue-400" size={20} />
                        <h2 className="text-lg font-black text-white uppercase italic">Cuentas de Twilio</h2>
                    </div>
                    <div className="space-y-4">
                        {data.twilioAccounts.map((acc: any) => (
                            <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                                <div className="space-y-1">
                                    <div className="font-black text-white uppercase text-sm">{acc.tenants?.name}</div>
                                    <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{acc.whatsapp_number}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${acc.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {acc.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Error Logs */}
                <div className="glass-card">
                    <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="text-red-400" size={20} />
                        <h2 className="text-lg font-black text-white uppercase italic">Logs de Errores (WhatsApp)</h2>
                    </div>
                    <div className="space-y-4">
                        {data.recentErrors.length > 0 ? data.recentErrors.map((err: any) => (
                            <div key={err.id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="font-black text-red-400 text-[10px] uppercase tracking-widest">
                                        {err.tenants?.name} · {err.phone}
                                    </div>
                                    <div className="flex items-center gap-1 text-[8px] text-white/20 font-black uppercase">
                                        <Clock size={10} />
                                        {format(new Date(err.sent_at), 'HH:mm dd/MM', { locale: es })}
                                    </div>
                                </div>
                                <div className="text-xs text-white/70 font-medium leading-relaxed">
                                    {err.error || 'Fallo desconocido en la entrega'}
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-10 text-white/20 space-y-3">
                                <CheckCircle2 size={40} strokeWidth={1} />
                                <div className="text-[10px] font-black uppercase tracking-[0.2em]">Todo bajo control</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ title, value, icon, status, sub }: any) {
    const statusColors = {
        ok: 'text-green-400 bg-green-500/10',
        warning: 'text-yellow-400 bg-yellow-500/10',
        error: 'text-red-400 bg-red-500/10'
    } as any;

    return (
        <div className="glass-card !p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusColors[status]}`}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">{title}</div>
                <div className="text-[8px] text-white/20 font-bold uppercase mt-1">{sub}</div>
            </div>
        </div>
    );
}
