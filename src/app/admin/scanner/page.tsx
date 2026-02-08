'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerAttendance, searchMembersByQuery } from '@/app/actions/attendance';
import { Search, User, Check, X, QrCode, Phone, Fingerprint, ShieldSlash } from 'lucide-react';

export default function QRScannerPage() {
    const searchParams = useSearchParams();
    const paramTenantId = searchParams.get('tenant_id');

    const [scanning, setScanning] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [activeMember, setActiveMember] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const results = await searchMembersByQuery(searchQuery, paramTenantId || undefined);
                setSearchResults(results);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, paramTenantId]);

    const handleSelectMember = (member: any) => {
        setActiveMember(member);
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
        setSuccessMsg(null);
    };

    async function handleRegister(memberIdOrToken: string, isDirectId: boolean = false) {
        setScanning(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const result = await registerAttendance(memberIdOrToken, paramTenantId || undefined, isDirectId);
            if (result.success && result.member) {
                // If it was a scan/token, we might not have the full member object yet in "activeMember"
                const memberData = result.member;
                setActiveMember({
                    ...memberData,
                    memberships: memberData.memberships,
                    checkedInAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                });
                setSuccessMsg('Asistencia registrada correctamente');

                // Keep success state for 4 seconds if not manually closed
                // setTimeout(() => setSuccessMsg(null), 4000);
            } else {
                setError(result.error || 'Error desconocido');
                if (result.member) {
                    setActiveMember(result.member);
                }
            }
        } catch (e) {
            setError('Error de conexión');
        } finally {
            setScanning(false);
        }
    }

    const resetUI = () => {
        setActiveMember(null);
        setError(null);
        setSuccessMsg(null);
        setSearchQuery('');
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto px-4 pb-20">
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-white uppercase">Acceso de Socios</h1>
                <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-bold">Control de entrada inteligente</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Search & Scan */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card !p-6 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Buscador de Socios</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-brand-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Nombre, Teléfono o Código..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all text-sm font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoComplete="off"
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute left-6 right-6 z-50 mt-1 glass-card !p-2 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                                    {searchResults.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleSelectMember(m)}
                                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                                {m.image_url ? (
                                                    <img src={m.image_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white/20" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black text-white truncate group-hover:text-brand-400 transition-colors uppercase">{m.name}</div>
                                                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{m.phone || 'Sin teléfono'} • {m.auth_token}</div>
                                            </div>
                                            <div className={`text-[8px] font-black px-2 py-1 rounded-md border ${m.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {m.status === 'ACTIVE' ? 'ACTIVO' : 'VENCIDO'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em] text-white/10">
                                <span className="bg-[#050505] px-4">O Escanear</span>
                            </div>
                        </div>

                        {/* Scanner Box */}
                        <div className="relative aspect-square max-w-[280px] mx-auto group">
                            <div className="absolute inset-0 border-2 border-white/5 rounded-[2.5rem] group-hover:border-brand-500/30 transition-colors" />

                            {/* Animated Scanner Corner */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-500 rounded-tl-[2.5rem] -translate-x-1 -translate-y-1" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-500 rounded-tr-[2.5rem] translate-x-1 -translate-y-1" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-500 rounded-bl-[2.5rem] -translate-x-1 translate-y-1" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-500 rounded-br-[2.5rem] translate-x-1 translate-y-1" />

                            <div className="absolute inset-8 flex flex-col items-center justify-center space-y-4">
                                <div className="relative">
                                    <QrCode className="w-16 h-16 text-white/10 group-hover:text-brand-500/50 transition-all duration-500 group-hover:scale-110" />
                                    {scanning && (
                                        <div className="absolute inset-0 bg-brand-500/20 blur-xl animate-pulse rounded-full" />
                                    )}
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-brand-400 transition-colors">Esperando Código</div>
                            </div>

                            {/* Scanning Light Effect */}
                            <div className="absolute left-6 right-6 h-0.5 bg-brand-500/50 top-1/2 -translate-y-1/2 blur-[2px] animate-scan-line" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Member Details Card */}
                <div className="lg:col-span-7">
                    {activeMember ? (
                        <div className="animate-in fade-in zoom-in slide-in-from-right-8 duration-500 h-full">
                            <div className={`glass-card h-full flex flex-col items-center justify-center p-10 border-2 relative overflow-hidden transition-all duration-500
                                ${activeMember.status === 'ACTIVE' && !error ? 'border-green-500/30 shadow-[0_0_50px_-12px_rgba(34,197,94,0.2)]' : 'border-red-500/30 shadow-[0_0_50px_-12px_rgba(239,68,68,0.2)]'}
                            `}>
                                {/* Background Watermark */}
                                <div className="absolute -bottom-20 -right-20 opacity-[0.03] rotate-12 pointer-events-none">
                                    <Fingerprint size={400} />
                                </div>

                                <button onClick={resetUI} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-90">
                                    <X size={20} className="text-white/40" />
                                </button>

                                <div className="mb-10 relative">
                                    <div className={`w-48 h-48 rounded-[3rem] p-1.5 border-2 transition-all duration-700
                                        ${activeMember.status === 'ACTIVE' && !error ? 'border-green-500 rotate-3 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-red-500 -rotate-3 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}
                                    `}>
                                        <div className="w-full h-full rounded-[2.6rem] bg-zinc-900 overflow-hidden relative">
                                            {activeMember.image_url ? (
                                                <img src={activeMember.image_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                    <User size={64} className="text-white/10" />
                                                </div>
                                            )}
                                            {successMsg && (
                                                <div className="absolute inset-0 bg-green-500/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                                                    <Check size={80} className="text-white stroke-[4]" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {activeMember.status === 'ACTIVE' && !error && (
                                        <div className="absolute -bottom-4 -right-4 bg-green-500 text-black p-3 rounded-2xl border-4 border-[#0A0A0A] shadow-xl animate-bounce">
                                            <Check size={24} strokeWidth={4} />
                                        </div>
                                    )}
                                    {(activeMember.status !== 'ACTIVE' || error) && (
                                        <div className="absolute -bottom-4 -right-4 bg-red-500 text-white p-3 rounded-2xl border-4 border-[#0A0A0A] shadow-xl">
                                            <ShieldSlash size={24} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>

                                <div className="text-center space-y-4 max-w-sm w-full">
                                    <div className="space-y-1">
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-tight">{activeMember.name}</h2>
                                        <div className="flex items-center justify-center gap-2">
                                            <Phone size={12} className="text-white/20" />
                                            <p className="text-xs text-brand-400 font-bold tracking-widest uppercase">{activeMember.phone || 'S/N'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
                                            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Membresía</p>
                                            <p className="text-sm font-black text-white uppercase truncate">{activeMember.memberships?.[0]?.plan_name || 'Sin Plan'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
                                            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Vencimiento</p>
                                            <p className={`text-sm font-black uppercase ${activeMember.status === 'ACTIVE' ? 'text-white' : 'text-red-400'}`}>
                                                {activeMember.memberships?.[0]?.next_due_date ? new Date(activeMember.memberships[0].next_due_date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {error ? (
                                        <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-2xl space-y-1 animate-in shake duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Acceso Denegado</p>
                                            <p className="text-xs font-bold text-white uppercase">{error}</p>
                                        </div>
                                    ) : successMsg ? (
                                        <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl space-y-1 animate-in zoom-in duration-300">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-green-400">Entrada Registrada</p>
                                            <p className="text-xs font-bold text-white uppercase">{activeMember.checkedInAt || new Date().toLocaleTimeString()}</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRegister(activeMember.id, true)}
                                            disabled={scanning}
                                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3
                                                ${activeMember.status === 'ACTIVE'
                                                    ? 'bg-brand-500 text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(139,92,246,0.6)]'
                                                    : 'bg-white/10 text-white/30 cursor-not-allowed opacity-50'}
                                            `}
                                        >
                                            {scanning ? 'PROCESANDO...' : 'REGISTRAR ENTRADA'}
                                            <Check size={20} className={scanning ? 'hidden' : 'block'} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full glass-card !bg-white/[0.01] border-dashed border-white/5 flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div className="w-32 h-32 rounded-full bg-white/[0.02] flex items-center justify-center text-white/5 border border-white/5">
                                <User size={64} className="opacity-20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-white/20 uppercase tracking-widest">Esperando Selección</h3>
                                <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                                    Busca un socio por nombre o escanea su código QR para ver sus detalles
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0%, 100% { transform: translateY(-80px); opacity: 0; }
                    50% { transform: translateY(80px); opacity: 1; }
                }
                .animate-scan-line {
                    animation: scan 3s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
}
