import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { isUserSuperAdmin } from '@/lib/auth';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const isSuperAdmin = await isUserSuperAdmin();

    if (!isSuperAdmin) {
        redirect('/admin');
    }

    return (
        <div className="flex min-h-screen bg-[#050505]">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-md p-6">
                <div className="text-xl font-black text-white mb-10 flex items-center gap-2">
                    <span className="bg-brand-600 px-2 py-1 rounded text-sm">SA</span>
                    GymTime
                </div>

                <nav className="space-y-2">
                    <Link href="/superadmin" className="block p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
                        Dashboard Global
                    </Link>
                    <Link href="/superadmin/tenants" className="block p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
                        Gimnasios (Tenants)
                    </Link>
                    <Link href="/superadmin/twilio" className="block p-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all">
                        Cuentas Twilio
                    </Link>
                    <div className="pt-10">
                        <Link href="/" className="block p-3 text-xs text-white/30 hover:text-white uppercase font-bold tracking-widest">
                            Cerrar Sesión
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
