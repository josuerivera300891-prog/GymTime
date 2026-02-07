'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Nota: Estas funciones están diseñadas para ser llamadas desde componentes de cliente
 * ya que necesitan interactuar con el flujo de autenticación de Supabase que a menudo
 * depende del estado del navegador (como los links de recuperación).
 */

export async function resetPasswordAction(email: string) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updatePasswordAction(password: string) {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
