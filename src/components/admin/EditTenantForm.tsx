'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateTenant, toggleTenantStatus } from '@/app/actions/superadmin';
import {
    Save,
    X,
    AlertTriangle,
    PauseCircle,
    PlayCircle,
    Info
} from 'lucide-react';

interface EditTenantFormProps {
    tenant: {
        id: string;
        name: string;
        country: string;
        admin_email: string | null;
        status: string;
        primary_color: string | null;
        secondary_color: string | null;
        cta_color: string | null;
    };
}

export default function EditTenantForm({ tenant }: EditTenantFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [suspending, setSuspending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: tenant.name,
        admin_email: tenant.admin_email || '',
        country: tenant.country,
        primary_color: tenant.primary_color || '#E6007E',
        secondary_color: tenant.secondary_color || '#22C55E',
        cta_color: tenant.cta_color || '#F97316'
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await updateTenant(tenant.id, formData);
            if (result.success) {
                router.refresh();
                router.push('/superadmin');
            } else {
                setError(result.error || 'Error al actualizar');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleStatus() {
        if (!confirm(`¿Estás seguro de que quieres ${tenant.status === 'ACTIVE' ? 'SUSPENDER' : 'REACTIVAR'} este gimnasio?`)) return;

        setSuspending(true);
        setError(null);

        try {
            const result = await toggleTenantStatus(tenant.id);
            if (result.success) {
                router.refresh();
            } else {
                setError(result.error || 'Error al cambiar estado');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSuspending(false);
        }
    }

    return (
        <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSubmit} className="glass-card !p-8 space-y-8">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Datos del Gimnasio</h2>
                        <p className="text-xs text-white/40">ID de Sistema: <code className="text-brand-400">{tenant.id}</code></p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
                        <AlertTriangle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                            Nombre Comercial
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-brand-500/50 outline-none transition-all"
                            placeholder="Ej. Iron Gym Central"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                            Email Administrador
                        </label>
                        <input
                            type="email"
                            value={formData.admin_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-brand-500/50 outline-none transition-all"
                            placeholder="admin@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                            País de Operación
                        </label>
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-brand-500/50 outline-none transition-all appearance-none"
                        >
                            <option value="Guatemala">🇬🇹 Guatemala</option>
                            <option value="México">🇲🇽 México</option>
                            <option value="Colombia">🇨🇴 Colombia</option>
                            <option value="Argentina">🇦🇷 Argentina</option>
                            <option value="España">🇪🇸 España</option>
                            <option value="Estados Unidos">🇺🇸 Estados Unidos</option>
                        </select>
                    </div>
                </div>

                {/* Color Customization Section */}
                <div className="space-y-6 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">Personalización Visual</h3>
                            <p className="text-[10px] text-white/30">Colores de la PWA para tus clientes</p>
                        </div>
                        {/* Live Preview */}
                        <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2">
                            <span className="text-[9px] text-white/30 uppercase tracking-widest">Preview</span>
                            <div
                                className="w-6 h-6 rounded-lg shadow-lg"
                                style={{ background: formData.primary_color }}
                                title="Primary"
                            />
                            <div
                                className="w-6 h-6 rounded-lg shadow-lg"
                                style={{ background: formData.secondary_color }}
                                title="Secondary"
                            />
                            <div
                                className="w-6 h-6 rounded-lg shadow-lg"
                                style={{ background: formData.cta_color }}
                                title="CTA"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Primary Color */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: formData.primary_color }} />
                                Color Principal
                            </label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl cursor-pointer appearance-none overflow-hidden"
                                    style={{ padding: '4px' }}
                                />
                                <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <span className="text-[9px] font-mono text-white/50 bg-black/50 px-2 py-0.5 rounded">
                                        {formData.primary_color.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[9px] text-white/20 ml-1">Badges, QR, acentos</p>
                        </div>

                        {/* Secondary Color */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: formData.secondary_color }} />
                                Color Secundario
                            </label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl cursor-pointer appearance-none overflow-hidden"
                                    style={{ padding: '4px' }}
                                />
                                <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <span className="text-[9px] font-mono text-white/50 bg-black/50 px-2 py-0.5 rounded">
                                        {formData.secondary_color.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[9px] text-white/20 ml-1">Éxito, progreso</p>
                        </div>

                        {/* CTA Color */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] ml-1 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: formData.cta_color }} />
                                Color de Acción
                            </label>
                            <div className="relative">
                                <input
                                    type="color"
                                    value={formData.cta_color}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cta_color: e.target.value }))}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl cursor-pointer appearance-none overflow-hidden"
                                    style={{ padding: '4px' }}
                                />
                                <div className="absolute bottom-1 left-0 right-0 text-center">
                                    <span className="text-[9px] font-mono text-white/50 bg-black/50 px-2 py-0.5 rounded">
                                        {formData.cta_color.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[9px] text-white/20 ml-1">Botones, alertas</p>
                        </div>
                    </div>

                    {/* Preset Palettes */}
                    <div className="flex items-center gap-2 pt-2">
                        <span className="text-[9px] text-white/20 uppercase tracking-widest">Paletas sugeridas:</span>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, primary_color: '#E6007E', secondary_color: '#22C55E', cta_color: '#F97316' }))}
                            className="flex gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                            title="GymTime Classic"
                        >
                            <div className="w-4 h-4 rounded bg-[#E6007E]" />
                            <div className="w-4 h-4 rounded bg-[#22C55E]" />
                            <div className="w-4 h-4 rounded bg-[#F97316]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, primary_color: '#3B82F6', secondary_color: '#10B981', cta_color: '#F59E0B' }))}
                            className="flex gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                            title="Ocean"
                        >
                            <div className="w-4 h-4 rounded bg-[#3B82F6]" />
                            <div className="w-4 h-4 rounded bg-[#10B981]" />
                            <div className="w-4 h-4 rounded bg-[#F59E0B]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, primary_color: '#8B5CF6', secondary_color: '#06B6D4', cta_color: '#EC4899' }))}
                            className="flex gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                            title="Neon"
                        >
                            <div className="w-4 h-4 rounded bg-[#8B5CF6]" />
                            <div className="w-4 h-4 rounded bg-[#06B6D4]" />
                            <div className="w-4 h-4 rounded bg-[#EC4899]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, primary_color: '#DC2626', secondary_color: '#16A34A', cta_color: '#EA580C' }))}
                            className="flex gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                            title="Power"
                        >
                            <div className="w-4 h-4 rounded bg-[#DC2626]" />
                            <div className="w-4 h-4 rounded bg-[#16A34A]" />
                            <div className="w-4 h-4 rounded bg-[#EA580C]" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading || suspending}
                        className="btn-primary flex items-center gap-2 py-3 px-8 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-brand-500/10"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                GUARDAR CAMBIOS
                            </>
                        )}
                    </button>
                    <Link
                        href="/superadmin"
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-black py-3 px-8 rounded-2xl border border-white/10 transition-all text-sm"
                    >
                        <X size={18} />
                        CANCELAR
                    </Link>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="glass-card !p-8 border-red-500/10 bg-red-500/[0.02] space-y-6">
                <div>
                    <h3 className="text-red-400 font-black uppercase tracking-tight italic flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Zona de Peligro
                    </h3>
                    <p className="text-white/40 text-xs mt-1">Acciones que afectan directamente la operación de la sede.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-white uppercase tracking-tight">Estado de la Sede</div>
                        <div className="text-[10px] text-white/30">
                            {tenant.status === 'ACTIVE'
                                ? 'El gimnasio está operando normalmente. Suspenderlo bloqueará el acceso a todos sus empleados.'
                                : 'El gimnasio está suspendido. Reactivarlo permitirá el acceso inmediato al personal.'
                            }
                        </div>
                    </div>
                    <button
                        onClick={handleToggleStatus}
                        disabled={loading || suspending}
                        className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${tenant.status === 'ACTIVE'
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                            : 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white'
                            }`}
                    >
                        {suspending ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            tenant.status === 'ACTIVE' ? (
                                <><PauseCircle size={14} /> Suspender Sede</>
                            ) : (
                                <><PlayCircle size={14} /> Reactivar Sede</>
                            )
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
