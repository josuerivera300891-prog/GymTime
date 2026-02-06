'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 * Client component for proper logout functionality
 * Calls supabase.auth.signOut() to invalidate the session
 */
export default function LogoutButton({ className, children }: LogoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleLogout() {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            router.refresh();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={className || 'block p-3 text-xs text-white/30 hover:text-white uppercase font-bold tracking-widest transition-colors'}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Cerrando...
                </span>
            ) : (
                children || 'Cerrar Sesión'
            )}
        </button>
    );
}
