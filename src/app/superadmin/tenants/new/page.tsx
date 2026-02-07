'use client';

import { useState } from 'react';
import { createTenant } from '@/app/actions/superadmin';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { COUNTRY_CONFIGS } from '@/lib/countries';
import {
    Building2,
    Globe,
    ShieldCheck,
    Mail,
    Lock,
    ChevronLeft,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Loader2
} from 'lucide-react';

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
            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 py-10">
                <div className="glass-card p-10 bg-emerald-500/5 border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} />
                    </div>

                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-emerald-500/20 rotate-3 transition-transform animate-bounce">
                        <CheckCircle2 size={40} />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">¡Gimnasio Desplegado!</h1>
                    <p className="text-white/40 mb-8 max-w-sm mx-auto">El entorno administrativo y la base de datos para <span className="text-emerald-400 font-bold">GymTime</span> han sido configurados.</p>

                    <div className="bg-black/60 rounded-3xl p-8 text-left space-y-6 mb-8 border border-white/5 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
                                <Mail size={20} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Email del Administrador</label>
                                <div className="text-white font-mono text-lg">{createdData.email}</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
                                <Lock size={20} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Contraseña Temporal</label>
                                <div className="text-brand-400 font-mono text-lg tracking-wider">{createdData.pass}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="/superadmin/tenants"
                            className="flex-1 py-4 rounded-2xl border border-white/10 text-white/40 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:text-white transition-all"
                        >
                            Ver Directorio
                        </Link>
                        <Link
                            href={`/admin?tenant_id=${createdData.id}`}
                            className="flex-1 py-4 rounded-2xl bg-brand-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                            ENTRAR A LA SEDE
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700 pb-20">
            <header className="space-y-4">
                <Link href="/superadmin/tenants" className="flex items-center gap-2 text-white/30 hover:text-white transition-colors group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Regresar al Listado</span>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Instalar Nueva Sede</h1>
                    <p className="text-white/40 text-sm">Provisionamiento de nuevo espacio de trabajo multi-tenant.</p>
                </div>
            </header>

            <div className="glass-card p-1 bg-white/[0.02] border-white/5 rounded-[2.5rem]">
                <form onSubmit={handleSubmit} className="bg-black/40 rounded-[2.3rem] p-10 space-y-10">
                    {/* General Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-400">
                                <Building2 size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">Información de Identidad</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1">Nombre Comercial del Gimnasio</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-brand-500/50 outline-none transition-all text-xl font-black placeholder:text-white/10 uppercase"
                                    placeholder="Ej. TITANS GYM CENTER"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1">País de Operación</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <select name="country" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-500/50 outline-none transition-all appearance-none cursor-pointer font-bold uppercase text-sm">
                                            {Object.values(COUNTRY_CONFIGS).map(config => (
                                                <option key={config.name} value={config.name} className="bg-neutral-900">
                                                    {config.displayName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1">Plan de Servicio</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400/50" size={18} />
                                        <select name="plan" className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white/50 focus:border-brand-500/50 outline-none transition-all appearance-none cursor-not-allowed font-bold uppercase text-sm" disabled>
                                            <option value="free">PLATINUM DEMO (GRATIS)</option>
                                            <option value="pro">ENTERPRISE (PROXIMAMENTE)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Admin Credentials */}
                    <section className="space-y-6 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                                <Lock size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase text-white/40 tracking-widest">Seguridad y Acceso Root</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1">Email del Dueño / Admin</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="email"
                                        name="admin_email"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-500/50 outline-none transition-all font-bold placeholder:text-white/10"
                                        placeholder="owner@gymcompany.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 ml-1">Contraseña de Activación</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="text"
                                        name="admin_password"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white focus:border-brand-500/50 outline-none transition-all font-mono font-bold tracking-widest"
                                        placeholder="Gym2024!"
                                        minLength={6}
                                        defaultValue="Gym2024!"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Submit Section */}
                    <div className="pt-10 flex items-center justify-end gap-6 border-t border-white/5">
                        <Link
                            href="/superadmin/tenants"
                            className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest"
                        >
                            Abortar Proceso
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-brand-500 hover:bg-brand-400 text-black font-black py-5 px-10 rounded-3xl transition-all shadow-xl shadow-brand-500/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    DESPLEGANDO...
                                </>
                            ) : (
                                <>
                                    COMPLETAR INSTALACIÓN
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
