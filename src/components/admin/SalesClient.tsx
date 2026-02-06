'use client';

import { useState, useEffect } from 'react';
import { getSales } from '@/app/actions/reports';

type SalesClientProps = {
    tenantId: string;
    initialData: any[]; // Optionally hydrate
    currency: string;
};

export default function SalesClient({ tenantId, initialData, currency }: SalesClientProps) {
    // Defaults: This Month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfDay = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(startOfMonth);
    const [endDate, setEndDate] = useState(endOfDay);
    const [sales, setSales] = useState<any[]>(initialData || []);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    async function fetchSales() {
        setLoading(true);
        const res = await getSales(tenantId, startDate, endDate);
        if (res.success && res.sales) {
            setSales(res.sales);
        } else {
            alert('Error al cargar reporte');
        }
        setLoading(false);
    }

    // Effect to calculate totals whenever sales change
    useEffect(() => {
        const t = sales.reduce((acc, sale) => acc + (Number(sale.amount) || 0), 0);
        setTotal(t);
    }, [sales]);

    // Initial load if not provided
    useEffect(() => {
        if (!initialData || initialData.length === 0) {
            fetchSales();
        }
    }, []);

    function downloadCSV() {
        const headers = ['Fecha', 'Socio', 'Plan', 'Método', 'Monto'];
        const rows = sales.map(s => [
            new Date(s.date).toLocaleDateString() + ' ' + new Date(s.date).toLocaleTimeString(),
            `"${s.member_name}"`, // Quote to handle commas in names
            s.plan_name,
            s.method,
            s.amount
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_ventas_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Reporte de Ventas</h1>
                    <p className="text-white/50">Consulta tus ingresos detallados por fecha.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="space-y-1 w-full sm:w-auto">
                            <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field py-2 px-4 w-full"
                            />
                        </div>
                        <div className="space-y-1 w-full sm:w-auto">
                            <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field py-2 px-4 w-full"
                            />
                        </div>
                    </div>
                    <button
                        onClick={fetchSales}
                        disabled={loading}
                        className="btn-primary !h-[42px] px-6 flex items-center gap-2"
                    >
                        {loading ? '...' : '🔍 Filtrar'}
                    </button>
                    <button
                        onClick={downloadCSV}
                        disabled={sales.length === 0}
                        className="bg-green-500 hover:bg-green-400 text-black font-black uppercase text-xs tracking-widest !h-[42px] px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        📥 Descargar CSV
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-brand-500/30 bg-brand-500/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-400 mb-2">Ingresos Totales (Periodo)</div>
                    <div className="text-4xl font-black text-white">{currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Transacciones</div>
                    <div className="text-4xl font-black text-white">{sales.length}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Ticket Promedio</div>
                    <div className="text-4xl font-black text-white">
                        {currency} {sales.length > 0 ? (total / sales.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10 uppercase text-[10px] tracking-widest font-black text-white/40">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Socio</th>
                                <th className="px-6 py-4">Concepto</th>
                                <th className="px-6 py-4">Método</th>
                                <th className="px-6 py-4 text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm text-white">{new Date(sale.date).toLocaleDateString()}</div>
                                        <div className="text-[10px] text-white/30">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white uppercase">{sale.member_name}</td>
                                    <td className="px-6 py-4 text-sm text-white/60">{sale.plan_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider">{sale.method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-brand-400">
                                        {currency} {Number(sale.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {sales.length === 0 && !loading && (
                    <div className="p-12 text-center text-white/20 font-bold uppercase tracking-widest text-sm">
                        No hay ventas en este periodo
                    </div>
                )}
            </div>
        </div>
    );
}
