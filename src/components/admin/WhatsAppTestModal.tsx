'use client';

import { useState } from 'react';
import { sendTestWhatsApp } from '@/app/actions/superadmin';

interface WhatsAppTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: { id: string; name: string };
}

export default function WhatsAppTestModal({ isOpen, onClose, tenant }: WhatsAppTestModalProps) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        phone: '',
        body: '¡Hola! Este es un mensaje de prueba de GymTime para verificar la conexión de WhatsApp. 🚀'
    });

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const result = await sendTestWhatsApp({
                tenant_id: tenant.id,
                phone: formData.phone,
                body: formData.body
            });

            if (result.success) {
                setStatus({ type: 'success', text: result.message! });
                // Reset phone after success
                setFormData(prev => ({ ...prev, phone: '' }));
            } else {
                setStatus({ type: 'error', text: result.error! });
            }
        } catch (err: any) {
            setStatus({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative w-full max-w-lg bg-zinc-900 rounded-[40px] border border-brand-500/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-white/5 bg-gradient-to-br from-brand-500/10 to-transparent">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Enviar Prueba</h2>
                    <p className="text-brand-400/60 text-[10px] mt-1 uppercase tracking-widest font-bold italic">Sede: {tenant.name}</p>

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
                    {status && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-center border animate-in slide-in-from-top-2 duration-300 ${status.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                            {status.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Número Destino</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-500/40 font-black">+</span>
                                <input
                                    required
                                    type="text"
                                    placeholder="50212345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-10 py-4 text-white font-black tracking-widest focus:outline-none focus:border-brand-500/50 transition-all placeholder:opacity-20 tabular-nums"
                                />
                            </div>
                            <p className="mt-2 text-[9px] text-white/20 font-medium italic px-2">Incluye código de país (ej: 502 para Guatemala)</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 ml-2">Mensaje</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                className="w-auto w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-brand-500/50 transition-all placeholder:opacity-20 resize-none font-medium leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 rounded-3xl bg-white/5 text-white/50 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            Cerrar
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] px-8 py-5 rounded-3xl bg-brand-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ENVIANDO...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.445 16.023l1.867 1.867C14.13 21.074 8.556 21.074 4.542 17.06c-4.013-4.013-4.013-10.518 0-14.531l1.867 1.867c-3.146 3.146-3.146 8.356 0 11.531 3.146 3.146 8.356 3.146 11.531 0s3.146-8.356 0-11.531l1.867-1.867c4.013 4.013 4.013 10.518 0 14.531l-1.867 -1.867z" />
                                    </svg>
                                    Enviar WhatsApp
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
