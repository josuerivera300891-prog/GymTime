import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Supabase environment variables are missing! Please check .env.local');
    }
}

// This client has admin privileges, use ONLY in server-side code (API routes, Server Actions)
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || 'placeholder', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
