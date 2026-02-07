'use client';

import React, { useState, useEffect } from 'react';

interface ExpiredOverlayProps {
    member: any;
}

// Frases motivacionales para volver al gym
const motivationalPhrases = [
    { title: "¡Te Extrañamos!", message: "Cada día es una nueva oportunidad para ser mejor. Tu próximo entrenamiento te espera." },
    { title: "¡Tu Progreso Importa!", message: "Las pesas no se levantan solas. Vuelve y continúa construyendo tu mejor versión." },
    { title: "¡No Te Rindas!", message: "Un pequeño paso hoy, un gran cambio mañana. Tu cuerpo recordará cómo se siente estar fuerte." },
    { title: "¡Vuelve Más Fuerte!", message: "Las pausas son parte del camino. Lo importante es que estás aquí, listo para continuar." },
    { title: "¡Tu Lugar Te Espera!", message: "El gym es tu espacio para crecer. Renueva y sigue rompiendo límites." },
    { title: "¡Nunca Es Tarde!", message: "El mejor momento para volver fue ayer. El segundo mejor momento es ahora." },
];

export const ExpiredOverlay: React.FC<ExpiredOverlayProps> = ({ member }) => {
    const [phrase, setPhrase] = useState(motivationalPhrases[0]);
    const primaryColor = member.tenants?.primary_color || '#10B981';
    const activeMembership = member.memberships?.[0];
    const firstName = member.name?.split(' ')[0] || 'Campeón';

    useEffect(() => {
        setPhrase(motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full opacity-10 animate-float"
                        style={{
                            width: `${20 + Math.random() * 40}px`,
                            height: `${20 + Math.random() * 40}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: primaryColor,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-sm w-full">
                {/* Welcoming Icon */}
                <div
                    className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6 animate-bounce-slow"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}40 0%, ${primaryColor}20 100%)`, border: `2px solid ${primaryColor}50` }}
                >
                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke={primaryColor} strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                </div>

                {/* Greeting */}
                <p
                    className="text-sm font-bold uppercase tracking-widest mb-2"
                    style={{ color: primaryColor }}
                >
                    Hola, {firstName}
                </p>

                {/* Motivational Title */}
                <h1 className="text-3xl font-black text-white mb-4 leading-tight">
                    {phrase.title}
                </h1>

                {/* Motivational Message */}
                <p className="text-white/60 mb-8 text-base leading-relaxed">
                    {phrase.message}
                </p>

                {/* Status Card */}
                <div
                    className="rounded-2xl p-5 mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
                        border: `1px solid ${primaryColor}30`
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-white/40 text-xs uppercase font-bold tracking-wider mb-1">
                                Tu Membresía
                            </p>
                            <p className="text-white font-bold">
                                {activeMembership?.plan_name || 'Sin plan activo'}
                            </p>
                        </div>
                        <div
                            className="px-3 py-1.5 rounded-full text-xs font-black uppercase"
                            style={{ background: `${primaryColor}20`, color: primaryColor }}
                        >
                            Pausada
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-full py-4 rounded-2xl font-black text-white uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg animate-pulse-glow"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                        boxShadow: `0 10px 40px ${primaryColor}40`
                    }}
                >
                    💪 Renovar en Caja
                </button>

                {/* Subtle Message */}
                <p className="text-white/30 text-xs mt-6 italic">
                    Acércate a recepción para reactivar tu membresía
                </p>

                {/* Powered By */}
                <p className="text-white/10 text-[10px] uppercase tracking-widest mt-8">
                    Powered by GymTime
                </p>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 10px 40px ${primaryColor}40; }
                    50% { box-shadow: 0 10px 60px ${primaryColor}60; }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
