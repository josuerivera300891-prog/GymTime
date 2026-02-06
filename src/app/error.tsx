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
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black">
            <h2 className="text-2xl font-bold text-white mb-4">Error de Aplicación</h2>
            <p className="text-white/50 mb-8">
                {error.message || 'Ha ocurrido un error crítico.'}
            </p>
            <button
                onClick={reset}
                className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-white/90 transition-all"
            >
                Recargar
            </button>
        </div>
    );
}
