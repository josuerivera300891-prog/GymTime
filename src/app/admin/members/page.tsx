import { createClient } from '@/lib/supabase-server';
import MembersClient from '@/components/admin/MembersClient';
import { redirect } from 'next/navigation';

export default async function MembersPage({
    searchParams
}: {
    searchParams: { q?: string, status?: string, tenant_id?: string }
}) {
    const tenantIdParam = searchParams?.tenant_id;
    const isSuperAdminCheck = async (email?: string) => email === 'admin@gymtime.com'; // Simple check for now

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const isSuperAdmin = await isSuperAdminCheck(user.email);

    // Choose client: SuperAdmin uses Admin client to bypass RLS, normal users use RLS client
    const dataClient = (isSuperAdmin && tenantIdParam) ? (await import('@/lib/supabaseServer')).supabaseAdmin : supabase;

    // Resolve Tenant
    const tenantQuery = dataClient.from('tenants').select('*');
    if (isSuperAdmin && tenantIdParam) {
        tenantQuery.eq('id', tenantIdParam);
    }
    const { data: tenant, error: tError } = await tenantQuery.single();

    if (tError || !tenant) {
        console.error('Error fetching tenant:', tError);
        return <div className="p-4 text-red-500">Error: No se pudo cargar la información del gimnasio.</div>;
    }

    const currency = tenant.currency_symbol || 'Q';
    const queryTerm = searchParams?.q || '';
    const statusFilter = searchParams?.status || '';

    // Fetch Members (RLS is active, no need to filter by tenant_id explicitly if using secure client, 
    // but better to double check if the policy requires it. Policy is "Tenants see their own members", 
    // implying implicit tenant_id check via get_auth_tenant_id().

    // Fetch Members
    let memberQuery = dataClient
        .from('members')
        .select(`
            *,
            memberships(id, plan_name, next_due_date, status, amount)
        `);

    if (isSuperAdmin && tenantIdParam) {
        memberQuery = memberQuery.eq('tenant_id', tenantIdParam);
    }

    // Apply filters
    if (queryTerm) {
        memberQuery = memberQuery.or(`name.ilike.%${queryTerm}%,phone.ilike.%${queryTerm}%`);
    }

    if (statusFilter) {
        memberQuery = memberQuery.eq('status', statusFilter);
    }

    const { data: members, error } = await memberQuery.order('name');

    if (error) {
        console.error('Error fetching members:', error);
    }

    // Fetch Products
    const productsQuery = dataClient
        .from('products')
        .select('*')
        .eq('active', true);

    if (isSuperAdmin && tenantIdParam) {
        productsQuery.eq('tenant_id', tenantIdParam);
    }
    const { data: products } = await productsQuery.order('name');

    // Fetch Plans
    const plansQuery = dataClient
        .from('plans')
        .select('*')
        .eq('active', true);

    if (isSuperAdmin && tenantIdParam) {
        plansQuery.eq('tenant_id', tenantIdParam);
    }
    const { data: plans } = await plansQuery.order('price');

    return (
        <MembersClient
            members={members || []}
            currency={currency}
            tenantId={tenant.id}
            products={products || []}
            plans={plans || []}
        />
    );
}
