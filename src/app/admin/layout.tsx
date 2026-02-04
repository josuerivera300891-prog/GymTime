import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/20 backdrop-blur-md p-6">
                <div className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent mb-10">
                    GymTime
                </div>

                <nav className="space-y-4">
                    <Link href="/admin" className="block text-white/70 hover:text-brand-400 font-medium transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/admin/members" className="block text-white/70 hover:text-brand-400 font-medium transition-colors">
                        Miembros
                    </Link>
                    <Link href="/admin/scanner" className="block text-white/7 group flex items-center gap-2 hover:text-brand-400 font-medium transition-colors">
                        Scanner <span className="text-[8px] bg-brand-600 px-1 rounded text-white font-black animate-pulse">NUEVO</span>
                    </Link>
                    <Link href="/admin/products" className="block text-white/70 hover:text-brand-400 font-medium transition-colors">
                        Inventario
                    </Link>
                    <Link href="/admin/payments" className="block text-white/70 hover:text-brand-400 font-medium transition-colors">
                        Pagos
                    </Link>
                    <Link href="/admin/settings" className="block text-white/70 hover:text-brand-400 font-medium transition-colors">
                        Configuración
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
