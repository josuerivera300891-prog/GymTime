import { getSystemHealth } from '@/app/actions/superadmin';
import HealthDashboard from '@/components/superadmin/HealthDashboard';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
    const healthData = await getSystemHealth();

    return (
        <div className="min-h-screen bg-black p-4 md:p-8">
            <div className="max-w-6xl mx-auto mb-8">
                <Link
                    href="/superadmin"
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Panel
                </Link>
            </div>

            <HealthDashboard data={healthData} />
        </div>
    );
}
