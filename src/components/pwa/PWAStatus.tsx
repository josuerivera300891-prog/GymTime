'use client';

import React from 'react';

export const PWAStatus = {
    Loading: () => (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#E6007E] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="text-white/40 text-sm uppercase tracking-widest font-bold">Cargando Perfil...</div>
            </div>
        </div>
    ),
    Error: ({ message }: { message: string }) => (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-sm">
                <div className="text-6xl">❌</div>
                <div className="text-red-400 font-bold text-xl">{message}</div>
                <p className="text-white/40 text-sm">Asegúrate de usar el enlace correcto.</p>
            </div>
        </div>
    ),
    NoToken: () => (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-sm">
                <div className="text-6xl">🏋️‍♂️</div>
                <h1 className="text-2xl font-bold text-white">Bienvenido a GymTime</h1>
                <p className="text-white/50">Por favor usa el enlace que recibiste por WhatsApp para acceder a tu perfil.</p>
            </div>
        </div>
    )
};
