import { supabaseAdmin } from '@/lib/supabaseServer';
import PlansManager from '@/components/admin/PlansManager';
import { getAuthorizedTenantId } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PlansPage({
    searchParams
}: {
    searchParams: { tenant_id?: string }
}) {
    const tenantIdParam = searchParams?.tenant_id;

    // 1. Resolve Tenant and Auth
    let tenantId: string | null = null;
    try {
        const auth = await getAuthorizedTenantId(tenantIdParam);
        tenantId = auth.tenantId;
    } catch (e) {
        redirect('/login');
    }

    if (!tenantId) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Acceso no válido</h1>
                <p className="text-white/50">Debes seleccionar un gimnasio válido para ver los planes.</p>
            </div>
        );
    }

    // 2. Fetch Tenant Data for Currency
    const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id, currency_symbol')
        .eq('id', tenantId)
        .single();

    if (!tenant) return <div className="text-white">Error: No se encontró el gimnasio</div>;

    const currency = tenant.currency_symbol || 'Q';

    // 3. Get Plans with Stats
    const { getPlanStats } = await import('@/app/actions/plans');
    const result = await getPlanStats(tenantId);
    const plans = result.success ? result.plans : [];

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Membresías y Planes</h1>
                <p className="text-white/40 text-sm">Gestiona la oferta comercial y el ciclo de vida de tus socios.</p>
            </header>
            <PlansManager initialPlans={plans as any} tenantId={tenantId} currency={currency} />
        </div>
    );
}
