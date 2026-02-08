'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerAttendance } from '@/app/actions/attendance';

export default function QRScannerPage() {
    const searchParams = useSearchParams();
    const paramTenantId = searchParams.get('tenant_id');

    const [scanning, setScanning] = useState(false);
    const [lastCheckin, setLastCheckin] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [testToken, setTestToken] = useState('');

    async function handleScan(token: string) {
        setScanning(true);
        setError(null);

        try {
            const result = await registerAttendance(token, paramTenantId || undefined);
            if (result.success && result.member) {
                setLastCheckin({
                    name: result.member.name,
                    status: result.member.status,
                    time: new Date().toLocaleTimeString(),
                    image_url: result.member.image_url,
                    plan: result.member.memberships?.[0]?.plan_name || 'Sin Plan',
                    expiry: result.member.memberships?.[0]?.next_due_date
                });

                // Auto close after 4 seconds
                setTimeout(() => setLastCheckin(null), 4000);
            } else {
                setError(result.error || 'Error desconocido');
                if (result.member) {
                    setLastCheckin({
                        name: result.member.name,
                        status: 'EXPIRED',
                        time: new Date().toLocaleTimeString(),
                        image_url: result.member.image_url,
                        plan: result.member.memberships?.[0]?.plan_name || 'Sin Plan',
                        expiry: result.member.memberships?.[0]?.next_due_date
                    });
                    // Auto close warning after 5 seconds
                    setTimeout(() => {
                        setLastCheckin(null);
                        setError(null);
                    }, 5000);
                }
            }
        } catch (e) {
            setError('Error de conexión');
        } finally {
            setScanning(false);
        }
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <header className="text-center">
                <h1 className="text-3xl font-bold">Escáner de Acceso</h1>
                <p className="text-white/50">Utiliza la cámara para registrar la entrada de los socios.</p>
            </header>

            <div className="glass-card flex flex-col items-center justify-center min-h-[400px] border-dashed border-white/20 relative overflow-hidden">
                {scanning && (
                    <div className="absolute inset-0 bg-brand-600/20 animate-pulse z-10 flex flex-col items-center justify-center">
                        <div className="text-white font-black tracking-widest uppercase text-xl">Procesando...</div>
                    </div>
                )}

                <div className="w-64 h-64 border-4 border-brand-500 rounded-3xl flex items-center justify-center relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white translate-x-1 -translate-y-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -translate-x-1 translate-y-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white translate-x-1 translate-y-1"></div>
                    <div className="text-white/20 text-4xl">📷</div>
                </div>

                <div className="mt-8 w-full max-w-xs space-y-4">
                    <input
                        type="text"
                        placeholder="Token del Socio (Escáner o Manual)"
                        className="input-field text-center"
                        value={testToken}
                        onChange={(e) => setTestToken(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleScan(testToken);
                                setTestToken(''); // Clear for next scan
                            }
                        }}
                    />
                    <button
                        onClick={() => handleScan(testToken)}
                        disabled={!testToken || scanning}
                        className="w-full btn-primary !py-3 uppercase font-black tracking-widest text-sm disabled:opacity-50"
                    >
                        Registrar Entrada
                    </button>
                </div>
            </div>

            {error && !lastCheckin && (
                <div className="glass-card bg-red-500/10 border-red-500/20 text-red-400 font-bold text-center animate-in fade-in slide-in-from-bottom-4">
                    ⚠️ {error}
                </div>
            )}

            {/* FULL SCREEN POPUP */}
            {lastCheckin && (
                <div className="fixed inset-0 z-50 bg-[#050505]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                    <div
                        className={`w-full max-w-lg rounded-3xl border-2 p-8 text-center relative shadow-2xl overflow-hidden
                        ${lastCheckin.status === 'ACTIVE'
                                ? 'bg-gradient-to-br from-gray-900 to-black border-green-500 shadow-green-500/20'
                                : 'bg-gradient-to-br from-gray-900 to-black border-red-500 shadow-red-500/20'}`}
                    >
                        <button
                            onClick={() => { setLastCheckin(null); setError(null); }}
                            className="absolute top-4 right-4 text-white/30 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="mb-8 relative inline-block">
                            {lastCheckin.image_url ? (
                                <img
                                    src={lastCheckin.image_url}
                                    className={`w-40 h-40 rounded-full object-cover border-4 shadow-xl mx-auto
                                    ${lastCheckin.status === 'ACTIVE' ? 'border-green-500 shadow-green-500/30' : 'border-red-500 shadow-red-500/30'}`}
                                />
                            ) : (
                                <div className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl border-4 mx-auto bg-white/5
                                ${lastCheckin.status === 'ACTIVE' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>
                                    👤
                                </div>
                            )}
                            {lastCheckin.status === 'ACTIVE' && (
                                <div className="absolute bottom-0 right-0 bg-green-500 text-black p-2 rounded-full border-4 border-black">
                                    ✅
                                </div>
                            )}
                        </div>

                        <h2 className="text-white/50 uppercase tracking-widest text-sm font-bold mb-2">Bienvenid@</h2>
                        <h1 className="text-4xl font-black text-white mb-2 leading-tight">{lastCheckin.name}</h1>
                        <div className="text-lg text-brand-400 font-bold mb-8 uppercase tracking-wide">{lastCheckin.plan}</div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-[10px] text-white/30 uppercase font-black mb-1">Estado</div>
                                <div className={`text-xl font-black uppercase ${lastCheckin.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                                    {lastCheckin.status === 'ACTIVE' ? 'ACTIVO' : 'VENCIDO'}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-[10px] text-white/30 uppercase font-black mb-1">Vence el</div>
                                <div className="text-xl font-black text-white">
                                    {lastCheckin.expiry ? new Date(lastCheckin.expiry).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {lastCheckin.status !== 'ACTIVE' && (
                            <div className="bg-red-500/20 text-red-400 p-4 rounded-xl font-bold uppercase tracking-widest text-sm animate-pulse mb-4">
                                🚫 Acceso Denegado: Membresía Vencida
                            </div>
                        )}

                        <div className="text-white/20 text-xs font-mono uppercase">
                            Check-in: {lastCheckin.time}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
