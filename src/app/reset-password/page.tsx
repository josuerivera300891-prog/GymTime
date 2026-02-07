'use client';

import { useState, useEffect } from 'react';
import { updatePasswordAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // Verificar que el usuario tenga sesión (Supabase la crea automáticamente al clicar el link de recovery)
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('El enlace de recuperación ha expirado o no es válido.');
            }
        }
        checkSession();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await updatePasswordAction(password);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setError(result.error || 'Ocurrió un error al actualizar la contraseña.');
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="text-4xl font-black text-brand-500 mb-2">GymTime</div>
                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">Nueva Contraseña</h1>
                    <p className="text-white/40 text-sm mt-2">Ingresa tu nueva clave de acceso.</p>
                </div>

                <div className="glass-card">
                    {success ? (
                        <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-4xl">
                                ✅
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-white">¡Contraseña Actualizada!</h2>
                                <p className="text-white/40 text-sm">
                                    Tu contraseña ha sido cambiada con éxito. Redirigiendo al login...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
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
                                    disabled={loading || !!error && error.includes('expirado')}
                                    className="btn-primary w-full !py-3 flex justify-center items-center"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Actualizar Contraseña'
                                    )}
                                </button>
                                {error && error.includes('expirado') && (
                                    <div className="text-center">
                                        <a href="/forgot-password" title="Volver a intentar" className="text-xs text-brand-500 font-bold hover:underline">
                                            Solicitar nuevo enlace
                                        </a>
                                    </div>
                                )}
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
