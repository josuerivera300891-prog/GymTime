'use client';

import { useState, useMemo } from 'react';
import { createPlan, updatePlan, togglePlanStatus, deletePlan } from '@/app/actions/plans';

type Plan = {
    id: string;
    name: string;
    price: number;
    duration_days: number;
    active: boolean;
    activeCount?: number;
};

type PlansManagerProps = {
    initialPlans: Plan[];
    tenantId: string;
    currency: string;
};

export default function PlansManager({ initialPlans, tenantId, currency }: PlansManagerProps) {
    const [plans, setPlans] = useState<Plan[]>(initialPlans);
    const [isInternalLoading, setIsInternalLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({ name: '', price: '', duration_days: '' });

    // Analytics Data
    const totalMembers = useMemo(() => plans.reduce((acc, p) => acc + (p.activeCount || 0), 0), [plans]);
    const maxMembers = useMemo(() => Math.max(...plans.map(p => p.activeCount || 0), 1), [plans]);

    // Group duplicates for the Grid View
    const uniquePlans = useMemo(() => {
        const groups: Record<string, { plan: Plan; ids: string[] }> = {};

        plans.forEach(p => {
            const key = `${p.name.toLowerCase().trim()}-${p.price}-${p.duration_days}`;
            if (!groups[key]) {
                groups[key] = { plan: p, ids: [p.id] };
            } else {
                groups[key].ids.push(p.id);
            }
        });

        return Object.values(groups);
    }, [plans]);

    function openCreate() {
        setEditingPlan(null);
        setFormData({ name: '', price: '', duration_days: '' });
        setShowModal(true);
    }

    function openEdit(group: { plan: Plan; ids: string[] }) {
        setEditingPlan(group.plan);
        // We will store the full list of IDs to update in a custom property on the modal state or just use the logic below
        // Actually, let's just hack the editingPlan to hold the IDs for this session
        (group.plan as any)._batchIds = group.ids;

        setFormData({
            name: group.plan.name,
            price: group.plan.price.toString(),
            duration_days: group.plan.duration_days.toString()
        });
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsInternalLoading(true);

        const data = {
            tenant_id: tenantId,
            name: formData.name,
            price: Number(formData.price),
            duration_days: Number(formData.duration_days)
        };

        try {
            if (editingPlan) {
                const idsToUpdate = (editingPlan as any)._batchIds || [editingPlan.id];

                // Update all duplicates to match
                await Promise.all(idsToUpdate.map((id: string) => updatePlan(id, data)));

                setPlans(plans.map(p => idsToUpdate.includes(p.id) ? { ...p, ...data } : p));
                setShowModal(false);
            } else {
                const res = await createPlan(data);
                if (res.success && res.plan) {
                    setPlans([...plans, { ...res.plan, activeCount: 0 }]); // New plans have 0 members initially
                    setShowModal(false);
                } else alert(res.error);
            }
        } catch (e) {
            console.error(e);
            alert('Error al guardar');
        } finally {
            setIsInternalLoading(false);
        }
    }

    async function handleToggle(ids: string[], currentStatus: boolean) {
        if (!confirm(`¿Seguro que quieres ${currentStatus ? 'desactivar' : 'activar'} este plan? (Se aplicará a todas las copias)`)) return;

        // Optimistic update
        const newPlans = plans.map(p => ids.includes(p.id) ? { ...p, active: !currentStatus } : p);
        setPlans(newPlans);

        await Promise.all(ids.map(id => togglePlanStatus(id, currentStatus)));
    }

    async function handleDelete(ids: string[]) {
        if (!confirm(`¿Seguro que quieres eliminar este plan? Se borrarán ${ids.length > 1 ? `las ${ids.length} copias` : 'el plan'}.`)) return;

        // Optimistic
        setPlans(plans.filter(p => !ids.includes(p.id)));

        await Promise.all(ids.map(id => deletePlan(id)));
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* Header & Analytics */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Membresías</h1>
                    <p className="text-white/50 mb-8 max-w-lg">
                        Gestiona los planes de acceso de tu gimnasio.
                        Analiza qué membresías son las más populares.
                    </p>
                    <button
                        onClick={openCreate}
                        className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-brand-500/20 hover:scale-105 transition-transform"
                    >
                        <span className="text-xl">+</span> Nueva Membresía
                    </button>
                </div>

                {/* Animated Chart Card */}
                <div className="glass-card flex-1 w-full p-6 bg-gradient-to-br from-white/5 to-white/[0.02]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Distribución de Socios</h3>
                        <div className="text-xs bg-brand-500/20 text-brand-400 px-2 py-1 rounded font-bold">Total: {totalMembers}</div>
                    </div>

                    <div className="space-y-4">
                        {(() => {
                            // Aggregate stats by name to avoid duplicates in chart
                            const aggregatedStats = plans.reduce((acc, plan) => {
                                acc[plan.name] = (acc[plan.name] || 0) + (plan.activeCount || 0);
                                return acc;
                            }, {} as Record<string, number>);

                            // Sort by count desc
                            const sortedStats = Object.entries(aggregatedStats)
                                .sort(([, a], [, b]) => b - a);

                            return sortedStats.map(([name, count]) => {
                                const percent = totalMembers ? (count / totalMembers) * 100 : 0;
                                const maxAggregated = Math.max(...Object.values(aggregatedStats), 1);
                                const correctWidthPercent = (count / maxAggregated) * 100;

                                return (
                                    <div key={name} className="relative group cursor-default">
                                        <div className="flex justify-between text-xs font-bold mb-1 z-10 relative">
                                            <span className="text-white group-hover:text-brand-400 transition-colors">{name}</span>
                                            <span className="text-white/60">{count} socios ({percent.toFixed(0)}%)</span>
                                        </div>
                                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative">
                                            <div
                                                style={{ width: `${correctWidthPercent}%` }}
                                                className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(230,0,126,0.5)]"
                                            ></div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                        {plans.length === 0 && <div className="text-center text-white/20 text-sm italic py-4">No hay planes creados</div>}
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {uniquePlans.map(({ plan, ids }) => (
                    <div
                        key={plan.id}
                        className={`group relative p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                        ${plan.active
                                ? 'bg-white/5 border-white/10 hover:border-brand-500/50 hover:shadow-brand-500/10'
                                : 'bg-black/40 border-white/5 opacity-60 grayscale hover:grayscale-0'}`}
                    >
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEdit({ plan, ids })}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleToggle(ids, plan.active)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${plan.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'}`}
                                title={plan.active ? "Desactivar" : "Activar"}
                            >
                                {plan.active ? '✕' : '✓'}
                            </button>
                            <button
                                onClick={() => handleDelete(ids)}
                                className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-black uppercase text-white mb-1 truncate">{plan.name}</h3>
                            <div className="text-3xl font-bold text-brand-400">{currency} {plan.price}</div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 text-white/40 text-sm">
                            <span>⏳</span>
                            <span className="font-mono">{plan.duration_days} días</span>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${plan.active ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                {plan.active ? 'Activo' : 'Inactivo'}
                            </span>
                            {ids.length > 1 && (
                                <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-1 rounded font-bold">
                                    x{ids.length}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-white/30 hover:text-white"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">
                            {editingPlan ? 'Editar Membresía' : 'Nueva Membresía'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-white/40">Nombre del Plan</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Plan Mensual, Anual..."
                                    className="input-field w-full"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Precio ({currency})</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        placeholder="0.00"
                                        className="input-field w-full font-mono"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/40">Duración (Días)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="30"
                                        className="input-field w-full font-mono"
                                        value={formData.duration_days}
                                        onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isInternalLoading}
                                className="w-full btn-primary py-4 text-lg font-black uppercase tracking-widest"
                            >
                                {isInternalLoading ? 'Guardando...' : 'Guardar Membresía'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
