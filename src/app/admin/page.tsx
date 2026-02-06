import { getCurrentShift, getDashboardStats } from '@/app/actions/dashboard';
import DashboardClient from '@/components/admin/DashboardClient';
import { createClient } from '@/lib/supabase-server';

export default async function AdminDashboard({ searchParams }: { searchParams: { tenant_id?: string } }) {
    const tenantIdParam = searchParams?.tenant_id;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isSuperAdmin = user?.email === 'admin@gymtime.com';

    const [statsRes, shift] = await Promise.all([
        getDashboardStats(tenantIdParam),
        getCurrentShift(tenantIdParam)
    ]);

    if (statsRes.error || !statsRes.tenantId) {
        return <div className="text-white p-10">Error cargando dashboard: {statsRes.error}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <DashboardClient
                stats={statsRes.stats!}
                currentShift={shift}
                tenantId={statsRes.tenantId}
                currencySymbol={statsRes.currencySymbol || 'Q'}
                gymName={statsRes.gymName}
                isSuperAdmin={isSuperAdmin}
            />
        </div>
    );
}
