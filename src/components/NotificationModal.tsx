'use client';

import React from 'react';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    subscribing: boolean;
    primaryColor: string;
}

export default function NotificationModal({ isOpen, onClose, onAccept, subscribing, primaryColor }: NotificationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-sm glass-card !p-8 text-center space-y-6 animate-in zoom-in duration-300">
                <div
                    className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 100%)` }}
                >
                    🔔
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">¡No te pierdas de nada!</h2>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Activa las notificaciones para recibir avisos de vencimiento, beneficios exclusivos y noticias de tu gimnasio directamente en tu celular.
                    </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={onAccept}
                        disabled={subscribing}
                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        style={{ background: primaryColor }}
                    >
                        {subscribing ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Activar Avisos'
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-white/30 hover:text-white/50 transition-colors"
                    >
                        Quizás más tarde
                    </button>
                </div>

                <div className="text-[9px] text-white/20 uppercase font-black tracking-widest pt-2">
                    Podrás desactivar esto en cualquier momento
                </div>
            </div>
        </div>
    );
}
