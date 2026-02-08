'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, CheckCircle2, Trophy, Dumbbell, Calendar } from 'lucide-react';

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
            const { data: { user } } = await supabase.auth.getUser();
            const isAdmin = user?.email && (
                user.email === 'admin@gymtime.com' ||
                user.email.toLowerCase().includes('skalamarketing')
            );

            router.refresh();
            if (isAdmin) {
                router.push('/superadmin');
            } else {
                router.push('/admin');
            }
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-[#020202]">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-100 group-hover:scale-105"
                style={{
                    backgroundImage: `url('/login-bg.png')`,
                }}
            />

            {/* Dark Overlay Layer */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

            {/* Ambient Light Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#7c3aed] rounded-full blur-[160px] opacity-20 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E6007E] rounded-full blur-[140px] opacity-10" />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">

                {/* Logo & Header */}
                <div className="text-center mb-10 space-y-6">
                    <div className="relative inline-block">
                        {/* Glow and Icon Group */}
                        <div className="absolute -inset-8 bg-gradient-to-r from-[#7c3aed] to-[#E6007E] rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="relative flex items-center justify-center">
                            {/* Gym Icons Group */}
                            <div className="flex items-center -space-x-4 mb-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md -rotate-12 scale-90 opacity-40">
                                    <Dumbbell className="text-white w-6 h-6" />
                                </div>
                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] shadow-[0_0_50px_-12px_rgba(124,58,237,0.6)] z-10 scale-110 border border-white/20">
                                    <Calendar className="text-white w-12 h-12 drop-shadow-lg" strokeWidth={2.5} />
                                    <div className="absolute bottom-5 right-5 bg-white rounded-full p-1 border-2 border-[#7c3aed]">
                                        <CheckCircle2 className="text-[#7c3aed] w-3 h-3" strokeWidth={4} />
                                    </div>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md rotate-12 scale-90 opacity-40">
                                    <Trophy className="text-white w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-1">GymTime</h1>
                            <p className="text-[11px] uppercase font-black tracking-[0.4em] text-[#a78bfa] brightness-125">
                                Plataforma de gestión para gimnasios
                            </p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-card !bg-black/60 !backdrop-blur-[32px] border border-white/[0.08] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group/card ring-1 ring-white/[0.05]">
                    {/* Floating accents */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#7c3aed] rounded-full blur-[80px] opacity-10 group-hover/card:opacity-20 transition-opacity duration-700" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#E6007E] rounded-full blur-[80px] opacity-5 group-hover/card:opacity-10 transition-opacity duration-700" />

                    <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Correo Electrónico</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-white/[0.02] rounded-2xl border border-white/[0.05] group-focus-within/input:border-[#7c3aed]/40 group-focus-within/input:bg-white/[0.05] transition-all duration-300" />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#a78bfa] transition-colors z-10" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@gymtime.com"
                                        className="relative w-full bg-transparent p-5 pl-12 text-white placeholder:text-white/10 outline-none transition-all font-semibold text-sm z-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-white/30 ml-2">Contraseña</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-white/[0.02] rounded-2xl border border-white/[0.05] group-focus-within/input:border-[#7c3aed]/40 group-focus-within/input:bg-white/[0.05] transition-all duration-300" />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within/input:text-[#a78bfa] transition-colors z-10" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="relative w-full bg-transparent p-5 pl-12 text-white placeholder:text-white/10 outline-none transition-all font-semibold text-sm z-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-[10px] text-center font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-shake shadow-red-500/10 shadow-lg ring-1 ring-red-500/20">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative w-full group/btn overflow-hidden rounded-2xl shadow-[0_20px_40px_-15px_rgba(124,58,237,0.4)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] transition-all duration-500 group-hover/btn:scale-110 group-active/btn:scale-95" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#E6007E] to-[#7c3aed] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                <div className="relative py-5 flex justify-center items-center gap-3">
                                    {loading ? (
                                        <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[13px] font-black uppercase tracking-[0.25em] text-white drop-shadow-sm">Entrar al Panel</span>
                                            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="text-[10px] font-black text-white/20 hover:text-white transition-all uppercase tracking-[0.2em] relative group/link"
                            >
                                ¿Olvidaste tu contraseña?
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white group-hover/link:w-1/2 transition-all duration-300 opacity-20" />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Footer Credits */}
                <div className="mt-16 text-center space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/5">
                        Powered by <span className="text-white/20 hover:text-brand-400 transition-colors cursor-default">Skala Marketing</span>
                    </p>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto" />
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
}
