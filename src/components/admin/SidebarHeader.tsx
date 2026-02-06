'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTenantBranding } from '@/app/actions/tenant';
import Image from 'next/image';

export default function SidebarHeader() {
    const searchParams = useSearchParams();
    const tenantId = searchParams.get('tenant_id');
    const [branding, setBranding] = useState<{ name: string; logo_url: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBranding() {
            setLoading(true);
            try {
                const data = await getTenantBranding(tenantId || undefined);
                if (data) {
                    setBranding({
                        name: data.name,
                        logo_url: data.logo_url
                    });
                }
            } catch (error) {
                console.error('Error loading branding:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBranding();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="mb-10 animate-pulse h-12 bg-white/5 rounded-xl block"></div>
        );
    }

    return (
        <div className="mb-10">
            {branding?.logo_url ? (
                <div className="flex flex-col gap-2">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 p-1.5 border border-white/10 shadow-xl mt-1">
                        <Image
                            src={branding.logo_url}
                            alt={branding.name}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="text-lg font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent tracking-tighter uppercase leading-tight">
                        {branding.name}
                    </div>
                </div>
            ) : (
                <div className="text-xl font-black bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent tracking-tighter uppercase mt-1">
                    {branding?.name || 'Gimnasio'}
                </div>
            )}
        </div>
    );
}
