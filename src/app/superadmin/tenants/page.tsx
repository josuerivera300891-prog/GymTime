import { supabaseAdmin } from '@/lib/supabaseServer';
import Link from 'next/link';
import TenantsClient from '@/components/admin/TenantsClient';

export default async function TenantsPage() {
    const { data: tenants, error } = await supabaseAdmin
        .from('tenants')
        .select('*, members(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end gap-4">
                <header className="flex flex-col gap-1">
                    <div className="text-[10px] font-black bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-[0.2em] uppercase">
                        GYMTIME · SUPERVISOR
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Gestión de Gimnasios</h1>
                    <p className="text-white/40 text-sm">Administra todos los gimnasios (tenants) registrados en la plataforma.</p>
                </header>
                <Link
                    href="/superadmin/tenants/new"
                    className="bg-brand-500 hover:bg-brand-600 text-black font-black py-2.5 px-6 rounded-full transition-all active:scale-95 block text-xs tracking-widest uppercase"
                >
                    + Registrar Nuevo Gym
                </Link>
            </div>

            <TenantsClient tenants={tenants || []} />
        </div>
    );
}
