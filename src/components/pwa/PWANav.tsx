'use client';

import React from 'react';
import { PWATab } from '@/hooks/usePWA';

interface PWANavProps {
    activeTab: PWATab;
    setActiveTab: (tab: PWATab) => void;
    primaryColor: string;
}

const IconHome = ({ active, color }: { active?: boolean; color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const IconCalendar = ({ active, color }: { active?: boolean; color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconQr = ({ active, color }: { active?: boolean; color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
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

const IconStore = ({ active, color }: { active?: boolean; color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
        <path d="M12 3v6" />
    </svg>
);

const IconProfile = ({ active, color }: { active?: boolean; color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={active ? color : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const PWANav: React.FC<PWANavProps> = ({ activeTab, setActiveTab, primaryColor }) => {
    return (
        <nav className="bottom-nav">
            <style jsx>{`
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    background: linear-gradient(to top, rgba(10, 10, 10, 0.98), rgba(15, 15, 15, 0.95));
                    backdrop-filter: blur(24px) saturate(180%);
                    border-top: 1px solid rgba(255, 255, 255, 0.12);
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    padding: 12px 0 calc(env(safe-area-inset-bottom) + 8px) 0;
                    z-index: 40;
                    box-shadow: 
                        0 -8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }
                .bottom-nav::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, ${primaryColor}40, #7c3aed30, transparent);
                }
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 8px 4px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    gap: 4px;
                    position: relative;
                }
                .nav-item::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 40%;
                    height: 2px;
                    background: linear-gradient(90deg, ${primaryColor}, #7c3aed);
                    border-radius: 2px;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nav-item.active::before {
                    transform: translateX(-50%) scaleX(1);
                }
                .nav-item.active {
                    color: white;
                }
                .nav-item.active :global(svg) {
                    transform: scale(1.15);
                    filter: drop-shadow(0 0 8px ${primaryColor}60);
                }
            `}</style>

            <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
                <div className="mb-1"><IconHome active={activeTab === 'home'} color={primaryColor} /></div>
                Inicio
            </button>
            <button onClick={() => setActiveTab('attendance')} className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}>
                <div className="mb-1"><IconCalendar active={activeTab === 'attendance'} color={primaryColor} /></div>
                Asistencias
            </button>
            <button onClick={() => setActiveTab('carnet')} className={`nav-item ${activeTab === 'carnet' ? 'active' : ''}`}>
                <div className="mb-1"><IconQr active={activeTab === 'carnet'} color={primaryColor} /></div>
                Carnet
            </button>
            <button onClick={() => setActiveTab('store')} className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}>
                <div className="mb-1"><IconStore active={activeTab === 'store'} color={primaryColor} /></div>
                Tienda
            </button>
            <button onClick={() => setActiveTab('profile')} className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}>
                <div className="mb-1"><IconProfile active={activeTab === 'profile'} color={primaryColor} /></div>
                Perfil
            </button>
        </nav>
    );
};
