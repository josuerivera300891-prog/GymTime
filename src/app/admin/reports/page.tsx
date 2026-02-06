import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseServer';
import SalesClient from '@/components/admin/SalesClient';

export default async function ReportsPage({
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

    // 2. FETCH INITIAL DATA (Current Month)
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfDay = today.toISOString().split('T')[0];

    const { getSales } = await import('@/app/actions/reports');
    const result = await getSales(tenantId, startOfMonth, endOfDay);
    const initialSales = result.success ? result.sales : [];

    return (
        <SalesClient
            tenantId={tenantId}
            initialData={initialSales || []}
            currency={currency}
        />
    );
}
