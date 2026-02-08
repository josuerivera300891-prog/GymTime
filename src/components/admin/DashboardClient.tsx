'use client';

import { useState, useEffect } from 'react';
import { openShift, closeShift } from '@/app/actions/dashboard';
import Link from 'next/link';

type Stats = {
    attendanceCount: number;
    totalRevenue: number;
    cashRevenue: number;
    cardRevenue: number;
    productsSold: number;
    renewalsCount: number;
    expiredCount: number;
};

type Shift = {
    id: string;
    worker_name: string;
    start_amount: number;
    started_at: string;
} | null;

export default function DashboardClient({
    stats,
    currentShift,
    tenantId,
    currencySymbol = 'Q',
    gymName = 'Gimnasio',
    isSuperAdmin,
    leaderboard = []
}: {
    stats: Stats,
    currentShift: Shift,
    tenantId: string,
    currencySymbol?: string,
    gymName?: string,
    isSuperAdmin?: boolean,
    leaderboard?: any[]
}) {
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(!currentShift && !isSuperAdmin);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formattedTime, setFormattedTime] = useState('');

    // State for close modal inputs to calculate live difference
    const [declaredCash, setDeclaredCash] = useState('');
    const [declaredCard, setDeclaredCard] = useState('');

    useEffect(() => {
        if (currentShift?.started_at) {
            setFormattedTime(new Date(currentShift.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    }, [currentShift]);

    const handleOpenShift = async (formData: FormData) => {
        setIsSubmitting(true);
        formData.append('tenant_id', tenantId);
        const res = await openShift(formData);
        if (res.success) {
            setIsShiftModalOpen(false);
            window.location.reload();
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleCloseShift = async (formData: FormData) => {
        setIsSubmitting(true);
        formData.append('shift_id', currentShift!.id);
        const res = await closeShift(formData);
        if (res.success) {
            setIsCloseModalOpen(false);
            window.location.reload();
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    // Derived values for Close Logic
    const startAmount = currentShift?.start_amount || 0;
    const cashSales = stats.cashRevenue || 0;
    const cardSales = stats.cardRevenue || 0;

    // System Expectation
    const expectedCashInBox = startAmount + cashSales;
    const expectedTotal = startAmount + stats.totalRevenue;

    // User Input
    const userCash = parseFloat(declaredCash) || 0;
    const userCard = parseFloat(declaredCard) || 0;
    const userTotal = userCash + userCard;

    const difference = userTotal - expectedTotal;

    if (!currentShift && !isShiftModalOpen && !isSuperAdmin) {
        setIsShiftModalOpen(true);
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="space-y-1">
                    <div className="text-[10px] font-black bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-[0.2em] uppercase mb-1">
                        GYMTIME
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-tight">{gymName}</h1>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white/50 tracking-tight">Panel de Control</h2>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentShift ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            ● {currentShift ? 'Caja Abierta' : 'Caja Cerrada'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
                    <div className="px-4 py-2">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Estado del Turno</div>
                        <div className="text-sm font-bold text-white">
                            {currentShift ? (
                                <>
                                    Por: <span className="text-brand-400">{currentShift.worker_name}</span>
                                </>
                            ) : (
                                <span className="text-red-400 italic">Iniciar Turno para operar</span>
                            )}
                        </div>
                    </div>
                    <div>
                        {currentShift ? (
                            <button
                                onClick={() => setIsCloseModalOpen(true)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 px-6 py-3 rounded-xl font-black transition-all text-xs uppercase tracking-widest"
                            >
                                Cerrar Turno
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsShiftModalOpen(true)}
                                className="bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-xl font-black shadow-lg shadow-green-500/20 transition-all text-xs uppercase tracking-widest"
                            >
                                Abrir Caja
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="text-brand-400 font-black uppercase tracking-widest text-xs mb-2">Asistencias Hoy</div>
                    <div className="text-4xl font-black text-white">{stats.attendanceCount}</div>
                    <div className="text-white/30 text-xs mt-2">Visitas registradas</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-green-400 font-black uppercase tracking-widest text-xs mb-2">Ventas Totales</div>
                    <div className="text-4xl font-black">{currencySymbol}{stats.totalRevenue.toFixed(0)}</div>
                    <div className="text-white/30 text-xs mt-2">
                        Efec: {currencySymbol}{cashSales.toLocaleString()} • Tarj: {currencySymbol}{cardSales.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-blue-400 font-black uppercase tracking-widest text-xs mb-2">Renovaciones</div>
                    <div className="text-4xl font-black text-white">{stats.renewalsCount}</div>
                    <div className="text-white/30 text-xs mt-2">Membresías pagadas hoy</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-orange-400 font-black uppercase tracking-widest text-xs mb-2">Productos Vendidos</div>
                    <div className="text-4xl font-black text-white">{stats.productsSold}</div>
                    <div className="text-white/30 text-xs mt-2">Items de la tienda</div>
                </div>
            </div>

            {/* Ranking del Mes Widget */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-yellow-500">🏆</span> Ranking del Mes
                </h3>
                <div className="space-y-3">
                    {leaderboard && leaderboard.length > 0 ? (
                        leaderboard.map((m: any, i: number) => (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-500 text-black' :
                                        i === 1 ? 'bg-slate-300 text-black' :
                                            i === 2 ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/40'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-bold text-white">{m.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-400 font-black text-xs">{m.attendance_count}</span>
                                    <span className="text-[10px] text-white/20 uppercase font-black">Visitas</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-white/20 text-xs font-bold bg-white/5 rounded-xl border border-dashed border-white/10">
                            No hay datos de ranking este mes
                        </div>
                    )}
                    {leaderboard && leaderboard.length > 0 && (
                        <Link href="/admin/reports/ranking" className="block text-center text-[10px] text-white/30 hover:text-white transition-colors uppercase font-black tracking-widest mt-4">
                            Ver reporte detallado →
                        </Link>
                    )}
                </div>
            </div>
        </div>

        {
        (isShiftModalOpen && !currentShift) && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <form action={handleOpenShift} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl animate-in zoom-in-95">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-brand-500/40">🌤️</div>
                        <h2 className="text-2xl font-black text-white">Iniciar Turno</h2>
                        <p className="text-white/40 text-sm">Ingresa tus datos para abrir caja</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-white/50 mb-1">Nombre Colaborador</label>
                            <input
                                name="worker_name"
                                type="text"
                                placeholder="Ej. Juan Pérez"
                                required
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-500 outline-none text-lg font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-white/50 mb-1">Caja Chica (Inicio)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">{currencySymbol}</span>
                                <input
                                    name="start_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-brand-500 outline-none text-lg font-mono font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Abriendo...' : 'Abrir Caja'}
                    </button>
                </form>
            </div>
        )
    }

    {
        isCloseModalOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <form action={handleCloseShift} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 w-full max-w-lg space-y-6 shadow-2xl animate-in zoom-in-95">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-red-500/20">🌙</div>
                        <h2 className="text-2xl font-black text-white">Cerrar Turno</h2>
                        <p className="text-white/40 text-sm">Conciliación de Caja y Ventas</p>
                    </div>

                    {/* Summary / Expectations */}
                    <div className="bg-white/5 p-4 rounded-xl space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-white/50">Caja Chica (Inicio):</span>
                            <span className="font-mono text-white">{currencySymbol}{startAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <div className="text-xs text-white/30 font-medium uppercase mb-1">Efectivo</div>
                            <div className="text-xl font-bold">{currencySymbol}{stats.cashRevenue.toFixed(0)}</div>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                            <div className="text-xs text-white/30 font-medium uppercase mb-1">Tarjeta</div>
                            <div className="text-xl font-bold">{currencySymbol}{stats.cardRevenue.toFixed(0)}</div>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                            <span className="text-white">Total Esperado (Sistema):</span>
                            <span className="font-mono text-brand-400">{currencySymbol}{expectedTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Efectivo en Caja</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-bold text-xs">{currencySymbol}</span>
                                    <input
                                        name="declared_cash"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={declaredCash}
                                        onChange={(e) => setDeclaredCash(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:border-brand-500 outline-none font-mono font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">Vauchers / Tarjeta</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-bold text-xs">{currencySymbol}</span>
                                    <input
                                        name="declared_card"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        value={declaredCard}
                                        onChange={(e) => setDeclaredCard(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:border-brand-500 outline-none font-mono font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Live Difference Calculation */}
                        <div className={`text-center p-3 rounded-xl border ${difference === 0 ? 'bg-green-500/10 border-green-500/30' : difference < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                            <div className="text-xs uppercase font-black opacity-70 mb-1">Diferencia (Sobrante/Faltante)</div>
                            <div className={`text-2xl font-black font-mono ${difference === 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : 'text-blue-400'}`}>
                                {difference > 0 ? '+' : ''}{currencySymbol}{difference.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsCloseModalOpen(false)}
                            className="flex-1 py-4 text-white/50 hover:text-white font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Cerrando...' : 'Confirmar Cierre'}
                        </button>
                    </div>
                </form>
            </div>
        )
    }
        </div >
    );
}
