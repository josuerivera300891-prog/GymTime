import { supabaseAdmin } from '@/lib/supabaseServer';
import { getSuperAdminStats } from '@/app/actions/superadmin';
import SuperAdminDashboardClient from '@/components/superadmin/SuperAdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDashboard() {
    // Fetch critical data on the server
    const { data: tenants } = await supabaseAdmin
        .from('tenants')
        .select('*')
        .order('name');

    const stats = await getSuperAdminStats();

    return (
        <SuperAdminDashboardClient
            tenants={tenants || []}
            stats={stats}
        />
    );
}
