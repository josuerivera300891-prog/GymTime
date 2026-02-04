'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ClientPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [member, setMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchMemberData();
        } else {
            setLoading(false);
        }
    }, [token]);

    async function fetchMemberData() {
        // In a real scenario, we'd use an API route to verify the token 
        // or use Supabase RLS with a custom setting.
        // For this demo, we'll fetch via a specialized query.
        const { data, error } = await supabase
            .from('members')
            .select('*, memberships(*, payments(*)), tenants(name, country, currency_symbol, logo_url, primary_color), attendance(*)')
            .eq('auth_token', token)
            .single();

        if (error) {
            console.error('PWA Fetch Error:', error);
            setError('Error al cargar perfil');
            setLoading(false);
            return;
        }

        if (data) {
            // Calculate Stats
            const visits = data.attendance || [];
            const now = new Date();
            // Reset time to start of day for accurate comparison
            now.setHours(0, 0, 0, 0);

            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday is 0, Monday is 1, etc.

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const visitsThisWeek = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfWeek).length;
            const visitsThisMonth = visits.filter((v: any) => new Date(v.checked_in_at) >= startOfMonth).length;

            setMember({ ...data, visitsThisWeek, visitsThisMonth });
        }
        setLoading(false);
    }

    async function subscribePush() {
        setSubscribing(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            });

            // Send subscription to server
            const { data: { user } } = await supabase.auth.getUser(); // If logged in

            await supabase.from('member_devices').insert({
                tenant_id: member.tenant_id,
                member_id: member.id,
                push_endpoint: subscription.endpoint,
                push_p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
                push_auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))),
                platform: navigator.platform
            });

            alert('¡Notificaciones activadas!');
        } catch (error) {
            console.error('Push error:', error);
            alert('Error al activar notificaciones');
        } finally {
            setSubscribing(false);
        }
    }

    if (loading) return <div className="p-20 text-center animate-pulse text-white/20 italic uppercase tracking-widest font-black">Cargando Perfil...</div>;
    if (error) return (
        <div className="p-10 text-center space-y-4">
            <div className="text-4xl">❌</div>
            <div className="text-red-400 font-bold">{error}</div>
            <p className="text-white/40 text-sm">Asegúrate de usar el enlace correcto.</p>
        </div>
    );

    if (!token || !member) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="text-5xl mb-6">🏋️‍♂️</div>
                <h1 className="text-2xl font-bold mb-2">Bienvenido a GymTime</h1>
                <p className="text-white/50">Por favor usa el enlace que recibiste por WhatsApp para acceder a tu perfil.</p>
            </div>
        );
    }

    const nextDueDate = new Date(member.memberships[0].next_due_date);
    const today = new Date();
    const diffTime = nextDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = member.status === 'EXPIRED' || diffDays < 0;

    const primaryColor = member.tenants.primary_color || '#E6007E';

    return (
        <div className="max-w-md mx-auto min-h-screen p-6 space-y-8 flex flex-col justify-center relative pb-20">
            <style jsx global>{`
                :root {
                    --brand-primary: ${primaryColor};
                }
                .text-brand-400 { color: var(--brand-primary); }
                .bg-brand-500 { background-color: var(--brand-primary); }
                .border-brand-500\/20 { border-color: ${primaryColor}33; }
                .shadow-brand-500\/40 { --tw-shadow-color: ${primaryColor}66; }
                .btn-primary { background-color: var(--brand-primary); }
            `}</style>

            {/* Blocking Overlay for Expired Members */}
            {isExpired && (
                <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-slide-up-blocking">
                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                        <span className="text-5xl animate-pulse">⚠️</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4 leading-tight uppercase tracking-tighter">TU MEMBRESÍA ESTÁ VENCIDA</h1>
                    <p className="text-white/60 mb-10 text-lg">
                        Realiza el pago en caja para seguir asistiendo al gym y activar tu membresía.
                    </p>
                    <div className="w-full space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="text-xs text-white/30 uppercase font-black mb-1">Venció el</div>
                            <div className="text-xl font-bold text-red-400">{nextDueDate.toLocaleDateString()}</div>
                        </div>
                        <p className="text-[10px] text-white/20 italic uppercase tracking-widest">Powered by GymTime</p>
                    </div>
                </div>
            )}

            <div className="text-center flex flex-col items-center">
                {member.tenants.logo_url ? (
                    <img src={member.tenants.logo_url} alt={member.tenants.name} className="h-12 object-contain mb-4" />
                ) : (
                    <>
                        <h2 className="text-white/50 uppercase tracking-widest text-xs font-bold mb-1">Tu Membresía en</h2>
                        <h1 className="text-3xl font-bold text-brand-400">{member.tenants.name}</h1>
                    </>
                )}
            </div>

            {/* Animated Warning Card (<= 3 days) */}
            {!isExpired && diffDays <= 3 && diffDays >= 0 && (
                <div className="glass-card bg-orange-500/10 border-orange-500/30 animate-pulse-warning overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="text-3xl">⏳</div>
                        <div>
                            <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest">¡Atención!</div>
                            <div className="text-sm font-bold text-white">Tu membresía vence en {diffDays} {diffDays === 1 ? 'día' : 'días'}.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Stats Summary */}
            {member && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card !p-4 border-brand-500/20 bg-brand-500/5">
                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 text-center">Esta Semana</div>
                        <div className="text-3xl font-black text-white text-center">{member.visitsThisWeek} <span className="text-xs font-normal text-white/40">días</span></div>
                    </div>
                    <div className="glass-card !p-4 border-brand-500/20 bg-brand-500/5">
                        <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1 text-center">Este Mes</div>
                        <div className="text-3xl font-black text-white text-center">{member.visitsThisMonth} <span className="text-xs font-normal text-white/40">días</span></div>
                    </div>
                </div>
            )}

            <div className="glass-card text-center relative overflow-hidden">
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 w-full h-1 ${member.status === 'ACTIVE' ? 'bg-green-500' :
                    member.status === 'EXPIRING' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />

                <div className="py-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Tu Estado</div>
                    <div className="text-5xl font-black mb-1">
                        {member.status === 'ACTIVE' ? 'ACTIVA' :
                            member.status === 'EXPIRING' ? 'POR VENCER' : 'VENCIDA'}
                    </div>
                    <p className="text-white/50 text-xs italic font-mono">Vence el {new Date(member.memberships[0].next_due_date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Digital Card (QR) */}
            <div className="glass-card bg-white/5 border-dashed border-white/20 flex flex-col items-center py-6">
                <div className="bg-white p-3 rounded-xl mb-3 shadow-2xl shadow-brand-500/40">
                    <div className="w-24 h-24 bg-black flex items-center justify-center text-white font-mono text-[8px] text-center p-2 leading-none">
                        [QR CODE]<br />{member.id.substring(0, 8)}
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-black uppercase tracking-widest text-white">Carnet Digital</div>
                    <div className="text-[9px] text-white/30">Escanea para entrar al gym</div>
                </div>
            </div>

            {/* Attendance Calendar (Simplified Visual) */}
            <div className="glass-card space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-white/40 tracking-wider">Tu Asistencia</h3>
                    <div className="text-[10px] text-brand-400 font-bold uppercase tracking-widest">Últimos 28 días</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - (27 - i));
                        const hasVisited = member.attendance?.some((v: any) =>
                            new Date(v.checked_in_at).toLocaleDateString() === day.toLocaleDateString()
                        );
                        return (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${hasVisited ? 'bg-brand-500 shadow-[0_0_10px_rgba(230,0,126,0.6)]' : 'bg-white/10'}`}></div>
                                <span className="text-[8px] text-white/20 uppercase font-black">{day.getDate()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Payment History */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 px-2">Pagos Recientes</h3>
                <div className="space-y-2">
                    {member.memberships[0]?.payments?.slice(0, 3).map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                            <div>
                                <div className="text-[10px] text-white/40">{new Date(p.paid_at).toLocaleDateString()}</div>
                                <div className="text-xs font-bold">{p.method}</div>
                            </div>
                            <div className="font-black text-brand-400 text-sm">{member.tenants.currency_symbol}{p.amount}</div>
                        </div>
                    ))}
                    {!member.memberships[0]?.payments?.length && (
                        <div className="text-center py-4 text-white/20 text-[10px] italic">No hay historial de pagos aún.</div>
                    )}
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <button
                    onClick={subscribePush}
                    disabled={subscribing}
                    className="w-full btn-primary !py-4 flex items-center justify-center gap-2 text-sm uppercase font-black"
                >
                    {subscribing ? 'Activando...' : '🔔 Recibir Avisos Push'}
                </button>
            </div>

            <footer className="text-center text-white/20 text-xs pt-10">
                POWERED BY <b>GYMTIME</b>
            </footer>
        </div>
    );
}
