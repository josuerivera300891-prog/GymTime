'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CarnetSectionProps {
    member: any;
    token: string | null;
    primaryColor: string;
    brightnessBoost: boolean;
    setBrightnessBoost: (boost: boolean) => void;
    onSubscribe: () => void;
    subscribing: boolean;
}

const IconProfile = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const CarnetSection: React.FC<CarnetSectionProps> = ({
    member,
    token,
    primaryColor,
    brightnessBoost,
    setBrightnessBoost,
    onSubscribe,
    subscribing
}) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className={`glass-card text-center !p-8 transition-all duration-500 ${brightnessBoost ? 'brightness-150' : ''}`}>
                <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                    CARNET DIGITAL
                </h2>
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mb-10">
                    Muestra este código en recepción
                </p>

                {/* QR Code with concentrated glow */}
                <div className="relative inline-block mb-10">
                    <div
                        className="absolute inset-0 blur-[60px] opacity-40 rounded-full"
                        style={{ background: primaryColor }}
                    ></div>
                    <div className="relative bg-white p-6 rounded-[40px] shadow-2xl">
                        <QRCodeSVG
                            value={token || ''}
                            size={240}
                            level="H"
                            includeMargin={false}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <span className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-lg ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                        member.status === 'EXPIRING' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                            'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}>
                        {member.status === 'ACTIVE' ? 'ACTIVA' : member.status === 'EXPIRING' ? 'POR VENCER' : 'VENCIDA'}
                    </span>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">
                        Expira: {member.memberships?.[0]?.next_due_date
                            ? new Date(member.memberships[0].next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
                            : 'Sin membresía activa'
                        }
                    </p>
                    {/* Member Code - More Visible */}
                    <div className="mt-6 px-8 py-4 rounded-3xl border-2 w-full" style={{ background: `${primaryColor}10`, borderColor: `${primaryColor}50` }}>
                        <div className="flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <line x1="19" y1="8" x2="19" y2="14"></line>
                                <line x1="22" y1="11" x2="16" y2="11"></line>
                            </svg>
                            <div className="text-center">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Código de Cliente</p>
                                <p className="text-white text-2xl font-black tracking-wider" style={{ color: primaryColor }}>
                                    {member.member_number || member.id.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onSubscribe}
                    disabled={subscribing}
                    className="glass-card flex items-center justify-center gap-3 !p-5 hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest text-white group"
                >
                    {subscribing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="group-hover:animate-bounce" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    )}
                    Avisos
                </button>

                <button
                    onClick={() => setBrightnessBoost(!brightnessBoost)}
                    className={`glass-card flex items-center justify-center gap-3 !p-5 transition-all text-xs font-black uppercase tracking-widest text-white ${brightnessBoost ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'hover:bg-white/5'}`}
                >
                    <svg className={brightnessBoost ? 'animate-spin-slow' : ''} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M22 12h2" /><path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" /></svg>
                    Brillo
                </button>
            </div>

            <div className="glass-card flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                    <IconProfile color="currentColor" />
                </div>
                <div>
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Plan Actual</div>
                    <div className="text-sm font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                        {member.memberships[0]?.plan_name || 'Sin Plan Activo'}
                    </div>
                </div>
            </div>
        </div>
    );
};
