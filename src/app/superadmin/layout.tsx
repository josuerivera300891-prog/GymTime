import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { isUserSuperAdmin } from '@/lib/auth';
import LogoutButton from '@/components/admin/LogoutButton';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const isSuperAdmin = await isUserSuperAdmin();

    if (!isSuperAdmin) {
        redirect('/admin');
    }

    return (
        <div className="flex min-h-screen bg-[#050505]">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-black/60 backdrop-blur-xl p-8 flex flex-col">
                <div className="mb-12">
                    <div className="text-[10px] font-black bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent tracking-[0.3em] uppercase mb-1">
                        GYMTIME
                    </div>
                    <div className="text-xl font-black text-white italic tracking-tighter uppercase">
                        Supervisor
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-3">Menu Principal</div>
                    <Link href="/superadmin" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all text-sm font-bold uppercase tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500/0 group-hover:bg-brand-500 transition-all" />
                        Dashboard
                    </Link>
                    <Link href="/superadmin/tenants" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all text-sm font-bold uppercase tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500/0 group-hover:bg-brand-500 transition-all" />
                        Gimnasios
                    </Link>
                    <Link href="/superadmin/twilio" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all text-sm font-bold uppercase tracking-tight">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500/0 group-hover:bg-brand-500 transition-all" />
                        Twilio (SaaS)
                    </Link>
                </nav>

                <div className="pt-8 border-t border-white/5">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
