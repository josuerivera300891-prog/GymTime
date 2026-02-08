'use client';

import React from 'react';

interface HomeSectionProps {
    member: any;
    primaryColor: string;
    onShowQR: () => void;
}

const IconCalendar = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconQr = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
        <path d="M21 21v.01" />
        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
        <path d="M3 12h.01" />
        <path d="M12 3h.01" />
        <path d="M12 16v.01" />
        <path d="M16 12h1" />
        <path d="M21 12v.01" />
        <path d="M12 21v-1" />
    </svg>
);

const IconFire = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 1 2.5 1 4a2.5 2.5 0 0 1-5 0Z" />
        <path d="M15.8 8.6c.4-.4.8-.5 1.2-.4.4.1.7.5.8.9.2.6.2 1.4-.3 2.1-.4.5-.6 1.4-.4 2.1.2.6.8 1.1 1.4 1.1.7 0 1.4-.3 1.5-1.1s-.4-1.4-1.1-2.1c-.2-.2-.3-.5-.2-.7.1-.2.4-.4.8-.4.4 0 .8.1 1.1.4.6.6.9 1.4.9 2.2 0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1.1.4-2.1 1.2-2.9Z" />
    </svg>
);

export const HomeSection: React.FC<HomeSectionProps> = ({ member, primaryColor, onShowQR }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Quick Stats */}
            <div className="glass-card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                            <IconCalendar color={primaryColor} />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] text-white/30 uppercase font-black tracking-wider">Esta Semana</div>
                            <div className="text-2xl font-black text-white">{member.visitsThisWeek}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[10px] text-white/30 uppercase font-black tracking-wider">Este Mes</div>
                            <div className="text-2xl font-black text-white">{member.visitsThisMonth}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                            <IconCalendar color={primaryColor} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak Widget */}
            {member.streak > 0 && (
                <div
                    className="relative overflow-hidden p-6 rounded-[2.5rem] bg-[#0A0A0A] border border-white/5 shadow-2xl animate-in zoom-in-95 duration-500"
                    style={{
                        boxShadow: `0 20px 40px -20px ${primaryColor}40`
                    }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full" style={{ background: primaryColor }} />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
                                style={{ background: `linear-gradient(45deg, ${primaryColor}30, #7c3aed20)` }}>
                                <IconFire color="#FF4D00" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white italic lowercase tracking-tight">Racha de {member.streak} {member.streak === 1 ? 'día' : 'días'}</h3>
                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">¡No te detengas, {member.name.split(' ')[0]}!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] text-white/20 uppercase font-black tracking-[0.2em] mb-1">Tu Nivel</div>
                            <div
                                className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                                style={{
                                    borderColor: `${primaryColor}40`,
                                    color: primaryColor,
                                    background: `${primaryColor}10`
                                }}
                            >
                                {member.level}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Button - Show QR */}
            <button
                onClick={onShowQR}
                className="relative w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-4 group overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #7c3aed 100%)`,
                    boxShadow: `0 10px 40px ${primaryColor}40, 0 0 20px ${primaryColor}20, inset 0 1px 0 rgba(255,255,255,0.2)`
                }}
            >
                <IconQr color="white" />
                <span className="relative z-10">Mostrar mi QR</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>

            {/* Expiration Card */}
            {member.memberships && member.memberships.length > 0 && (
                <div className="glass-card border-2" style={{ borderColor: `${primaryColor}30` }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${primaryColor}20` }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-white/30 uppercase font-black tracking-wider mb-1">Próximo Vencimiento</div>
                                <div className="text-base font-black text-white">
                                    {member.memberships[0]?.next_due_date
                                        ? new Date(member.memberships[0].next_due_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'N/A'
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 rounded-full" style={{ background: member.status === 'ACTIVE' ? '#10b98120' : '#ef444420', color: member.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                            <span className="text-xs font-black uppercase tracking-wider">
                                {member.status === 'ACTIVE' ? 'Activa' : 'Vencida'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
