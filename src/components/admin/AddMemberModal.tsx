'use client';

import React, { useState } from 'react';
import { createMember } from '@/app/actions/members';

interface AddMemberModalProps {
    tenantId: string;
}

export default function AddMemberModal({ tenantId }: AddMemberModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await createMember(tenantId, formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Socio registrado exitosamente.' });
            setTimeout(() => {
                setIsOpen(false);
                setMessage(null);
                window.location.reload(); // Refresh to show new member
            }, 1500);
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al registrar socio.' });
        }
        setLoading(false);
    }

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="btn-primary">Nuevo Miembro</button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-lg w-full relative overflow-hidden animate-zoom-in">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Registrar Nuevo Miembro</h2>
                    <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Nombre Completo</label>
                            <input type="text" name="name" className="input-field w-full" required placeholder="Ej: Carlos Ruiz" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Teléfono (WhatsApp)</label>
                            <input type="tel" name="phone" className="input-field w-full" required placeholder="Ej: +502 1234 5678" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Nombre del Plan</label>
                            <input type="text" name="plan_name" className="input-field w-full" required defaultValue="Membresía" />
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Monto a Cobrar</label>
                            <input type="number" name="price" className="input-field w-full" required defaultValue="350" step="0.01" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/50 mb-2">Ciclo de Pago</label>
                        <select name="duration_days" className="input-field w-full">
                            <option value="7">Semanal (7 Días)</option>
                            <option value="15">Quincenal (15 Días)</option>
                            <option value="30">Mensual (30 Días)</option>
                            <option value="90">Trimestral (90 Días)</option>
                            <option value="365">Anual (365 Días)</option>
                        </select>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm font-bold animate-slide-up ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            <div>{message.text}</div>
                            {message.type === 'success' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Logic to trigger reload after a bit, but allow user to click
                                        window.location.reload();
                                    }}
                                    className="mt-3 block w-full py-2 bg-green-500 text-black text-center rounded-lg hover:bg-green-400 transition-colors"
                                >
                                    Listo, cerrar y actualizar
                                </button>
                            )}
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
