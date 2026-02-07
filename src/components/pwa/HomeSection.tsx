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

export const HomeSection: React.FC<HomeSectionProps> = ({ member, primaryColor, onShowQR }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
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

            {/* CTA Button - Show QR */}
            <button
                onClick={onShowQR}
                className="relative w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-4 group overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #7c3aed 100%)`,
                    boxShadow: `0 10px 40px ${primaryColor}40, 0 0 20px ${primaryColor}20, inset 0 1px 0 rgba(255,255,255,0.2)`
                }}
            >
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                        transform: 'translateX(-100%)',
                        animation: 'shine 2s infinite'
                    }}></div>
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
