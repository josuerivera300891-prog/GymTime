'use client';

import { useState, useEffect } from 'react';

interface BirthdayBannerProps {
    memberName: string;
    memberBirthdate: string | null;
    tenantName: string;
    primaryColor: string;
}

// Frases motivacionales alusivas al gym
const birthdayPhrases = [
    "¡Que cada repetición te acerque más a tus metas! 💪",
    "¡Otro año más fuerte, más rápido, más imparable! 🔥",
    "¡El mejor regalo es salud y disciplina! 🏋️",
    "¡Que este nuevo año sea tu mejor versión! ⭐",
    "¡Sigue rompiendo límites año tras año! 🚀",
    "¡Un año más de dedicación y resultados! 💎",
    "¡Que la fuerza te acompañe hoy y siempre! 🎯",
    "¡Tu constancia es tu mejor regalo! 🏆"
];

export function BirthdayBanner({ memberName, memberBirthdate, tenantName, primaryColor }: BirthdayBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [randomPhrase, setRandomPhrase] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        if (!memberBirthdate) return;

        const today = new Date();

        // Parse birthdate correctly to avoid timezone issues
        // Format is YYYY-MM-DD, extract parts directly
        const parts = memberBirthdate.split('-');
        const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed month
        const birthDay = parseInt(parts[2], 10);

        // Check if today is the member's birthday (month and day)
        const isBirthday =
            today.getMonth() === birthMonth &&
            today.getDate() === birthDay;

        if (isBirthday) {
            setIsVisible(true);
            setRandomPhrase(birthdayPhrases[Math.floor(Math.random() * birthdayPhrases.length)]);
        }
    }, [memberBirthdate]);

    if (!isVisible) return null;

    // Get first name
    const firstName = memberName.split(' ')[0];

    return (
        <>


            {/* Birthday Banner */}
            <div
                className="relative mx-4 mb-4 rounded-2xl overflow-hidden animate-bounce-in"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}40 50%, ${primaryColor}20 100%)`,
                    border: `2px solid ${primaryColor}50`
                }}
            >
                {/* Sparkle Effects (Static) */}
                <div className="absolute inset-0 overflow-hidden">
                    <svg className="absolute top-2 left-4 w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={primaryColor} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <svg className="absolute top-4 right-6 w-5 h-5" fill={primaryColor} viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <svg className="absolute bottom-3 left-8 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={primaryColor} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <svg className="absolute bottom-2 right-4 w-6 h-6" fill={primaryColor} viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 text-center">
                    {/* Premium Birthday Cake Icon */}
                    <div
                        className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center animate-bounce"
                        style={{ background: `linear-gradient(135deg, ${primaryColor}40 0%, ${primaryColor}60 100%)` }}
                    >
                        <svg className="w-9 h-9" fill="white" viewBox="0 0 24 24">
                            <path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm4.6 9.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01zM18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z" />
                        </svg>
                    </div>

                    <h2
                        className="text-xl font-black mb-2 tracking-wide"
                        style={{ color: primaryColor }}
                    >
                        ¡FELIZ CUMPLEAÑOS!
                    </h2>

                    <p className="text-white/90 text-lg font-semibold mb-3">
                        {firstName}
                    </p>

                    <p className="text-white/70 text-sm mb-3">
                        El equipo de <span className="font-bold" style={{ color: primaryColor }}>{tenantName}</span> te desea un excelente día
                    </p>

                    <div
                        className="inline-block px-4 py-2 rounded-xl text-sm font-medium"
                        style={{
                            background: `${primaryColor}30`,
                            color: 'white'
                        }}
                    >
                        {randomPhrase}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => { setIsVisible(false); setShowConfetti(false); }}
                    className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                    ×
                </button>
            </div>

            {/* CSS for banner animation */}
            <style jsx>{`
                @keyframes bounce-in {
                    0% {
                        transform: scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
            `}</style>
        </>
    );
}
