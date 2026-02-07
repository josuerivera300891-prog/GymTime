'use client';

import { useState } from 'react';
import { resetPasswordAction } from '@/app/actions/auth';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await resetPasswordAction(email);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Ocurrió un error al enviar el correo.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="text-4xl font-black text-brand-500 mb-2">GymTime</div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">Recuperar Acceso</h1>
                    <p className="text-white/40 text-sm mt-2">Te enviaremos un enlace para restablecer tu contraseña.</p>
                </div>

                <div className="glass-card">
                    {success ? (
                        <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">
                                📧
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-white">¡Correo Enviado!</h2>
                                <p className="text-white/40 text-sm">
                                    Revisa la bandeja de entrada de <b className="text-brand-400">{email}</b> para continuar.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="btn-primary w-full inline-block !py-3"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="input-field w-full"
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm text-center font-bold bg-red-500/10 p-2 rounded-lg">
                                    ⚠️ {error}
                                </div>
                            )}

                            <div className="space-y-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full !py-3 flex justify-center items-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Enviar Instrucciones'
                                    )}
                                </button>
                                <div className="text-center">
                                    <Link href="/login" className="text-xs text-white/30 hover:text-brand-400 transition-colors">
                                        Recordé mi contraseña, ir al login
                                    </Link>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-white/20 mt-10 uppercase tracking-widest">
                    POWERED BY <b>SKALA MARKETING</b>
                </p>
            </div>
        </div>
    );
}
