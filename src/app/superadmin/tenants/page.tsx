import { supabaseAdmin } from '@/lib/supabaseServer';
import Link from 'next/link';
import TenantsClient from '@/components/admin/TenantsClient';

export default async function TenantsPage() {
    const { data: tenants, error } = await supabaseAdmin
        .from('tenants')
        .select('*, members(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Gimnasios</h1>
                    <p className="text-white/50 text-sm">Administra todos los gimnasios (tenants) registrados en la plataforma.</p>
                </div>
                <Link
                    href="/superadmin/tenants/new"
                    className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg active:scale-95 block"
                >
                    + Registrar Nuevo Gym
                </Link>
            </div>

            <TenantsClient tenants={tenants || []} />
        </div>
    );
}
