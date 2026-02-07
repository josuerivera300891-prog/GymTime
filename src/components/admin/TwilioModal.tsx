'use client';

import { useState, useEffect } from 'react';
import { upsertTwilioAccount } from '@/app/actions/superadmin';

interface TwilioModalProps {
    isOpen: boolean;
    onClose: () => void;
    allTenants: { id: string; name: string }[];
    accountToEdit?: any;
}

export default function TwilioModal({ isOpen, onClose, allTenants, accountToEdit }: TwilioModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        tenant_id: '',
        account_sid: '',
        auth_token: '',
        whatsapp_number: ''
    });

    useEffect(() => {
        if (accountToEdit) {
            setFormData({
                tenant_id: accountToEdit.tenant_id,
                account_sid: accountToEdit.account_sid,
                auth_token: accountToEdit.auth_token || '',
                whatsapp_number: accountToEdit.whatsapp_number.replace('whatsapp:', '')
            });
        } else {
            setFormData({
                tenant_id: '',
                account_sid: '',
                auth_token: '',
                whatsapp_number: ''
            });
        }
    }, [accountToEdit, isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await upsertTwilioAccount(formData);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Error desconocido');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-zinc-900 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-10 border-b border-white/5 relative bg-gradient-to-br from-brand-500/10 to-transparent">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                        {accountToEdit ? 'Editar Conexión' : 'Nueva Conexión'}
                    </h2>
                    <p className="text-white/40 text-xs mt-1 uppercase tracking-widest font-bold italic">Configuración de Twilio WhatsApp</p>

                    <button
                        onClick={onClose}
                        className="absolute top-10 right-10 text-white/20 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Tenant Selector */}
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Seleccionar Gimnasio</label>
                            <select
                                required
                                disabled={!!accountToEdit}
                                value={formData.tenant_id}
                                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-brand-500/50 transition-all appearance-none disabled:opacity-50"
                            >
                                <option value="" disabled className="bg-zinc-900">Elegir una sede...</option>
                                {allTenants.map(t => (
                                    <option key={t.id} value={t.id} className="bg-zinc-900">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* SID */}
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Account SID</label>
                            <input
                                required
                                type="text"
                                placeholder="AC..."
                                value={formData.account_sid}
                                onChange={(e) => setFormData({ ...formData, account_sid: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:outline-none focus:border-brand-500/50 transition-all placeholder:opacity-20"
                            />
                        </div>

                        {/* Token */}
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Auth Token</label>
                            <input
                                required
                                type="password"
                                placeholder="••••••••••••••••"
                                value={formData.auth_token}
                                onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:outline-none focus:border-brand-500/50 transition-all placeholder:opacity-20"
                            />
                        </div>

                        {/* WhatsApp Number */}
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Número WhatsApp (E.164)</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black">+</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="14155552671"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-10 py-4 text-white font-black tracking-widest focus:outline-none focus:border-brand-500/50 transition-all placeholder:opacity-20 tabular-nums"
                                />
                            </div>
                            <p className="mt-2 text-[9px] text-white/20 font-medium italic px-2">Ejemplo: 14155552671 (sin símbolos ni espacios)</p>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 rounded-3xl bg-white/5 border border-white/5 text-white/50 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] px-8 py-5 rounded-3xl bg-brand-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                accountToEdit ? 'Actualizar' : 'Configurar Cuenta'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
