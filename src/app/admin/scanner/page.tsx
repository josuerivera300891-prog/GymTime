'use client';

import React, { useState } from 'react';
import { registerAttendance } from '@/app/actions/attendance';

export default function QRScannerPage() {
    const [scanning, setScanning] = useState(false);
    const [lastCheckin, setLastCheckin] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [testToken, setTestToken] = useState('');

    async function handleScan(token: string) {
        setScanning(true);
        setError(null);

        try {
            const result = await registerAttendance(token);
            if (result.success && result.member) {
                setLastCheckin({
                    name: result.member.name,
                    status: result.member.status,
                    time: new Date().toLocaleTimeString()
                });
            } else {
                setError(result.error || 'Error desconocido');
                if (result.member) {
                    setLastCheckin({
                        name: result.member.name,
                        status: 'EXPIRED',
                        time: new Date().toLocaleTimeString()
                    });
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
                        placeholder="Token del Socio (Simulado)"
                        className="input-field text-center"
                        value={testToken}
                        onChange={(e) => setTestToken(e.target.value)}
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

            {error && (
                <div className="glass-card bg-red-500/10 border-red-500/20 text-red-400 font-bold text-center">
                    ⚠️ {error}
                </div>
            )}

            {lastCheckin && !error && (
                <div className="glass-card bg-green-500/10 border-green-500/20 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-[10px] font-black text-green-400 uppercase mb-1">Entrada Exitosa</div>
                            <div className="text-xl font-bold">{lastCheckin.name}</div>
                            <div className="text-xs text-white/40">Check-in a las {lastCheckin.time}</div>
                        </div>
                        <div className="text-right">
                            <span className="bg-green-500 text-black text-[10px] font-black px-3 py-1 rounded-full">SOCIO ACTIVO</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
