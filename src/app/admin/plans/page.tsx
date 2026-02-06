import { supabaseAdmin } from '@/lib/supabaseServer';
import PlansManager from '@/components/admin/PlansManager';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function PlansPage({
    searchParams
}: {
    searchParams: { tenant_id?: string }
}) {
    const tenantIdParam = searchParams?.tenant_id;

    // 1. Resolve Tenant
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const isSuperAdmin = user.email === 'admin@gymtime.com';
    const dataClient = (isSuperAdmin && tenantIdParam) ? supabaseAdmin : supabase;

    const tenantQuery = dataClient.from('tenants').select('id, currency_symbol').limit(1);
    if (tenantIdParam) {
        tenantQuery.eq('id', tenantIdParam);
    }
    const { data: tenant } = await tenantQuery.single();

    if (!tenant) return <div className="text-white">Error: No se encontró el gimnasio</div>;

    const tenantId = tenant.id;
    const currency = tenant.currency_symbol || 'Q';

    // 2. Get Plans with Stats
    const { getPlanStats } = await import('@/app/actions/plans');
    const result = await getPlanStats(tenantId);
    const plans = result.success ? result.plans : [];

    return (
        <div className="max-w-7xl mx-auto">
            <PlansManager initialPlans={plans as any} tenantId={tenantId} currency={currency} />
        </div>
    );
}
