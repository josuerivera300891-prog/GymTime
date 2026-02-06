'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-[#111] rounded-2xl border border-white/10 m-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Algo salió mal</h2>
            <p className="text-white/50 mb-6 max-w-md">
                {error.message || 'Ha ocurrido un error inesperado al cargar el panel.'}
            </p>
            <button
                onClick={reset}
                className="bg-brand-500 hover:bg-brand-400 text-white font-bold py-2 px-6 rounded-xl transition-all"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}
