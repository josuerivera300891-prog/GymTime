'use client';

import { useState } from 'react';
import { createTenant } from '@/app/actions/superadmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { COUNTRY_CONFIGS } from '@/lib/countries';

export default function NewTenantPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdData, setCreatedData] = useState<{ id: string, email: string, pass: string } | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const adminEmail = formData.get('admin_email') as string;
        const adminPass = formData.get('admin_password') as string;

        const res = await createTenant(formData);

        if (res.success) {
            setCreatedData({ id: res.tenantId!, email: adminEmail, pass: adminPass });
            setSuccess(true);
            router.refresh();
        } else {
            alert('Error: ' + res.error);
            setLoading(false);
        }
    }

    if (success && createdData) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
                <div className="glass-card p-10 bg-emerald-500/10 border-emerald-500/20 text-center">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                        ✓
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">¡Gimnasio Registrado!</h1>
                    <p className="text-white/60 mb-8">El espacio de trabajo y la cuenta administrativa han sido creados correctamente.</p>

                    <div className="bg-black/40 rounded-2xl p-6 text-left space-y-4 mb-8 border border-white/5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Email del Administrador</label>
                            <div className="text-white font-mono">{createdData.email}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Contraseña Temporal</label>
                            <div className="text-white font-mono">{createdData.pass}</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="/superadmin/tenants"
                            className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest text-sm hover:bg-white/5 transition-all"
                        >
                            Ver Lista
                        </Link>
                        <Link
                            href={`/admin?tenant_id=${createdData.id}`}
                            className="flex-1 py-4 rounded-xl bg-brand-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20"
                        >
                            Ir al Panel →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
            <div>
                <Link href="/superadmin/tenants" className="text-white/40 hover:text-white transition-colors mb-4 inline-block">
                    ← Volver a la lista
                </Link>
                <h1 className="text-3xl font-bold text-white">Registrar Nuevo Gimnasio</h1>
                <p className="text-white/50">Crea un nuevo espacio de trabajo (tenant) para un cliente.</p>
            </div>

            <div className="glass-card p-8 bg-black/40 border-white/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-white/50 mb-2 font-bold uppercase tracking-widest">Nombre Comercial</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field w-full text-lg"
                            placeholder="Ej: Iron Gym Center"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/50 mb-2 font-bold uppercase tracking-widest">País</label>
                            <select name="country" className="input-field w-full">
                                {Object.values(COUNTRY_CONFIGS).map(config => (
                                    <option key={config.name} value={config.name}>
                                        {config.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2 font-bold uppercase tracking-widest">Plan de Suscripción</label>
                            <select name="plan" className="input-field w-full" disabled>
                                <option value="free">Versión Demo (Gratis)</option>
                                <option value="pro">Pro (Próximamente)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4">Credenciales del Administrador</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-white/50 mb-2 font-bold uppercase tracking-widest">Email Admin</label>
                                <input
                                    type="email"
                                    name="admin_email"
                                    className="input-field w-full"
                                    placeholder="admin@ejemplo.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/50 mb-2 font-bold uppercase tracking-widest">Contraseña Default</label>
                                <input
                                    type="text"
                                    name="admin_password"
                                    className="input-field w-full"
                                    placeholder="Ej: Gym2024!"
                                    minLength={6}
                                    defaultValue="Gym2024!"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-white/5">
                        <Link
                            href="/superadmin/tenants"
                            className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 text-sm font-bold uppercase tracking-widest transition-all"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest text-sm"
                        >
                            {loading ? 'Creando...' : 'Crear Gimnasio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
