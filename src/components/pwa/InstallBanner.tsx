'use client';

import React from 'react';

interface InstallBannerProps {
    isIOS: boolean;
    primaryColor: string;
    onInstall: () => void;
    onDismiss: () => void;
    hasDeferredPrompt: boolean;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({
    isIOS,
    primaryColor,
    onInstall,
    onDismiss,
    hasDeferredPrompt
}) => {
    return (
        <div className="fixed bottom-24 left-4 right-4 z-[60] animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="glass-card !p-5 flex items-center justify-between gap-4 border-white/20 shadow-2xl overflow-hidden relative">
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: primaryColor }}></div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                        📱
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white leading-none mb-1">Guarda esta App</h4>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-tight">
                            Añade {isIOS ? 'a Inicio desde el menú compartir' : 'a tu inicio para acceso rápido'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isIOS && hasDeferredPrompt && (
                        <button
                            onClick={onInstall}
                            className="px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] text-white transition-all shadow-lg active:scale-95 whitespace-nowrap"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Instalar
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="p-5 -m-2 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all active:scale-90 active:bg-white/10 touch-manipulation border border-white/5"
                        aria-label="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
