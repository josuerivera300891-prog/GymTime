'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateTenant } from '@/app/actions/superadmin';

interface EditTenantFormProps {
    tenant: {
        id: string;
        name: string;
        country: string;
        admin_email: string;
        status: string;
    };
}

export default function EditTenantForm({ tenant }: EditTenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: tenant.name,
        admin_email: tenant.admin_email || '',
        country: tenant.country
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await updateTenant(tenant.id, formData);
            if (result.success) {
                router.push('/superadmin/tenants');
                router.refresh();
            } else {
                setError(result.error || 'Error al actualizar');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Editar Gimnasio</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">
                        Nombre del Gimnasio
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">
                        Email del Administrador
                    </label>
                    <input
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">
                        País
                    </label>
                    <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"
                    >
                        <option value="Guatemala">Guatemala</option>
                        <option value="México">México</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Argentina">Argentina</option>
                        <option value="España">España</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                    </select>
                </div>

                <div className="pt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">ID del Tenant</p>
                    <p className="font-mono text-white/50">{tenant.id}</p>
                </div>

                <div className="pt-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Status Actual</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${tenant.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {tenant.status === 'ACTIVE' ? 'ACTIVO' : 'SUSPENDIDO'}
                    </span>
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                            Guardando...
                        </>
                    ) : 'Guardar Cambios'}
                </button>
                <Link
                    href="/superadmin/tenants"
                    className="bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    );
}
