'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

export default function SidebarNav() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const tenantId = searchParams.get('tenant_id');

    const getLink = (href: string) => {
        if (!tenantId) return href;
        return `${href}?tenant_id=${tenantId}`;
    };

    const isActive = (href: string) => pathname === href;

    const navItems = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Miembros', href: '/admin/members' },
        { label: 'Scanner', href: '/admin/scanner', isNew: true },
        { label: 'Tienda', href: '/admin/products' },
        { label: 'Pagos', href: '/admin/payments' },
        { label: 'Reportes', href: '/admin/reports' },
        { label: 'Membresías', href: '/admin/plans' },
        { label: 'Configuración', href: '/admin/settings' },
    ];

    return (
        <nav className="space-y-4">
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={getLink(item.href)}
                    className={`block font-medium transition-colors ${isActive(item.href)
                        ? 'text-brand-400'
                        : 'text-white/70 hover:text-brand-400'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        {item.label}
                        {item.isNew && (
                            <span className="text-[8px] bg-brand-600 px-1 rounded text-white font-black animate-pulse">
                                NUEVO
                            </span>
                        )}
                    </span>
                </Link>
            ))}
        </nav>
    );
}
