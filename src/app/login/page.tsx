'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'Correo o contraseña incorrectos.'
                : error.message);
            setLoading(false);
        } else {
            router.refresh(); // Refresh to update middleware state
            router.push('/admin');
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="text-4xl font-black text-brand-500 mb-2">GymTime</div>
                    <p className="text-white/40">SaaS Multi-tenant de Membresías</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@gymtime.com"
                            className="input-field w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            disabled={loading}
                            className="btn-primary w-full !py-3 flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Entrar al Panel'
                            )}
                        </button>
                        <div className="text-center">
                            <a href="#" className="text-xs text-white/30 hover:text-brand-400">¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>
                </form>

                <p className="text-center text-xs text-white/20 mt-10">
                    POWERED BY <b>SKALA MARKETING</b>
                </p>
            </div>
        </div>
    );
}
