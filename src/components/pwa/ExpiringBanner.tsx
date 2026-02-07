'use client';

import { useState, useEffect } from 'react';

interface ExpiringBannerProps {
    daysUntilExpiration: number;
    planName: string;
    expirationDate: string;
    primaryColor: string;
    onRenew?: () => void;
}

export function ExpiringBanner({
    daysUntilExpiration,
    planName,
    expirationDate,
    primaryColor,
    onRenew
}: ExpiringBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    // Shake animation every few seconds for urgency
    useEffect(() => {
        if (daysUntilExpiration <= 1) {
            const interval = setInterval(() => {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [daysUntilExpiration]);

    // Only show for 1-5 days before expiration
    if (daysUntilExpiration < 0 || daysUntilExpiration > 5 || isDismissed) {
        return null;
    }

    const getUrgencyConfig = () => {
        if (daysUntilExpiration <= 1) {
            return {
                gradient: 'from-red-600 via-red-500 to-orange-500',
                borderGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
                iconColor: '#fff',
                iconBg: 'bg-red-500',
                message: daysUntilExpiration === 0 ? '¡VENCE HOY!' : '¡VENCE MAÑANA!'
            };
        } else if (daysUntilExpiration <= 3) {
            return {
                gradient: 'from-orange-600 via-amber-500 to-yellow-500',
                borderGlow: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
                iconColor: '#fff',
                iconBg: 'bg-orange-500',
                message: `Vence en ${daysUntilExpiration} días`
            };
        } else {
            return {
                gradient: 'from-yellow-500 via-amber-400 to-orange-400',
                borderGlow: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
                iconColor: '#fff',
                iconBg: 'bg-yellow-500',
                message: `Vence en ${daysUntilExpiration} días`
            };
        }
    };

    const config = getUrgencyConfig();

    return (
        <>
            <div
                className={`relative mx-4 mb-4 rounded-2xl overflow-hidden ${config.borderGlow} animate-in slide-in-from-top-5 duration-500 ${isShaking ? 'animate-shake' : ''}`}
            >
                {/* Animated Gradient Border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-90`}></div>

                {/* Animated Shine Effect */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Content Container */}
                <div className="relative z-10 p-4 bg-black/40 m-[2px] rounded-[14px]">
                    <div className="flex items-center gap-4">
                        {/* Animated Warning Icon */}
                        <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg} animate-pulse-scale`}
                        >
                            <svg className="w-8 h-8 animate-wiggle" fill="none" viewBox="0 0 24 24" stroke={config.iconColor} strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-base uppercase tracking-wide text-white drop-shadow-lg">
                                {config.message}
                            </p>
                            <p className="text-white/80 text-xs mt-0.5 font-medium">
                                {planName} • {new Date(expirationDate + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>

                        {/* Animated Renew Button */}
                        <button
                            onClick={onRenew}
                            className="shrink-0 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-white/20 backdrop-blur-sm border border-white/30 transition-all hover:bg-white/30 hover:scale-105 active:scale-95 animate-bounce-subtle"
                        >
                            ¡Renovar!
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsDismissed(true)}
                    className="absolute top-3 right-3 z-20 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/60 hover:text-white transition-all text-xs backdrop-blur-sm"
                >
                    ×
                </button>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes shine {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shine {
                    animation: shine 2s ease-in-out infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-8deg); }
                    75% { transform: rotate(8deg); }
                }
                .animate-wiggle {
                    animation: wiggle 1s ease-in-out infinite;
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-pulse-scale {
                    animation: pulse-scale 2s ease-in-out infinite;
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 1.5s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
