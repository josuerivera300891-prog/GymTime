import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import ProductManagement from '@/components/admin/ProductManagement';

export default async function ProductsPage({
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

    const { data: products } = await dataClient
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .order('name');

    return <ProductManagement products={products || []} currency={currency} tenantId={tenantId} />;
}
