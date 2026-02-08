'use client';

import React, { useState } from 'react';
import { createMember } from '@/app/actions/members';
import { useRouter } from 'next/navigation';

interface AddMemberModalProps {
    tenantId: string;
    plans: any[];
    currency: string;
}

export default function AddMemberModal({ tenantId, plans, currency }: AddMemberModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ price: number, name: string, days: number } | null>(null);

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const planId = e.target.value;
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            setSelectedPlanDetails({
                price: plan.price,
                name: plan.name,
                days: plan.duration_days
            });
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        // Ensure manual overrides or selected plan values are consistent if needed
        // Assuming the form inputs are the source of truth
        const result = await createMember(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Socio registrado exitosamente.' });
            router.refresh(); // Server component refresh
            setTimeout(() => {
                setIsOpen(false);
                setMessage(null);
                // No hard reload needed
            }, 1000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al registrar socio.' });
        }
        setLoading(false);
    }

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="btn-primary">
            + Nuevo Miembro
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-lg w-full relative overflow-hidden animate-zoom-in">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Registrar Nuevo Miembro</h2>
                    <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="hidden" name="tenant_id" value={tenantId} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Nombre Completo</label>
                            <input type="text" name="name" className="input-field w-full" required placeholder="Ej: Carlos Ruiz" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Teléfono (WhatsApp)</label>
                            <input type="tel" name="phone" className="input-field w-full" required placeholder="Ej: 55551234" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/50 mb-2">🎂 Fecha de Cumpleaños (Opcional)</label>
                        <input
                            type="date"
                            name="birthdate"
                            className="input-field w-full"
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-white/30 mt-1">Para enviar felicitaciones automáticas</p>
                    </div>

                    <div className="space-y-4 border-t border-white/5 pt-4">
                        <h3 className="text-sm font-bold uppercase text-brand-400 tracking-widest">Plan Inicial</h3>

                        {plans.length > 0 && (
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Seleccionar Plan Predefinido</label>
                                <select onChange={handlePlanChange} className="input-field w-full" defaultValue="">
                                    <option value="" disabled>-- Elegir un Plan --</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - {currency}{p.price} ({p.duration_days} días)</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Nombre del Plan</label>
                                <input
                                    type="text"
                                    name="plan_name"
                                    className="input-field w-full"
                                    required
                                    defaultValue={selectedPlanDetails?.name || "Membresía"}
                                    key={selectedPlanDetails?.name} // Force re-render on selection
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/50 mb-2">Monto ({currency})</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="input-field w-full"
                                    required
                                    defaultValue={selectedPlanDetails?.price || (currency === 'Q' ? "350" : "")}
                                    step="0.01"
                                    key={selectedPlanDetails?.price}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2">Duración (Días)</label>
                            <select
                                name="duration_days"
                                className="input-field w-full"
                                defaultValue={selectedPlanDetails?.days || "30"}
                                key={selectedPlanDetails?.days}
                            >
                                <option value="7">Semanal (7 Días)</option>
                                <option value="15">Quincenal (15 Días)</option>
                                <option value="30">Mensual (30 Días)</option>
                                <option value="90">Trimestral (90 Días)</option>
                                <option value="365">Anual (365 Días)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2">Método de Pago</label>
                            <select name="payment_method" className="input-field w-full" defaultValue="CASH">
                                <option value="CASH">Efectivo 💵</option>
                                <option value="CARD">Tarjeta / Transferencia 💳</option>
                            </select>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-bold animate-slide-up ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-white/60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 disabled:opacity-50 font-bold uppercase tracking-widest">
                            {loading ? 'Registrando...' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
