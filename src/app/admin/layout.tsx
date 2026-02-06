import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import SidebarHeader from '@/components/admin/SidebarHeader';
import SidebarNav from '@/components/admin/SidebarNav';

import { isUserSuperAdmin } from '@/lib/auth';

export default async function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    const isSuperAdmin = await isUserSuperAdmin();

    // If SuperAdmin, we might have a tenant_id in the URL to show context
    // Layouts don't get searchParams directly in Next.js, 
    // but we can assume they'll see the dashboard or members.

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0A0A0A] p-6 flex flex-col fixed inset-y-0 shadow-2xl overflow-y-auto">
                <SidebarHeader />

                {isSuperAdmin && (
                    <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-pulse">
                        <div className="text-[10px] font-black uppercase text-emerald-400 mb-1 tracking-widest">Supervisor</div>
                        <div className="text-xs text-white/70 mb-3 leading-tight">Viendo panel con privilegios globales.</div>
                        <Link
                            href="/superadmin/tenants"
                            className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase py-2 px-3 rounded-lg block text-center transition-all"
                        >
                            ← Salir
                        </Link>
                    </div>
                )}

                <SidebarNav />
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-auto bg-[#050505] min-h-screen">
                {children}
            </main>
        </div>
    );
}
