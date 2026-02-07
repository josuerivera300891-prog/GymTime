'use client';

import React, { useState } from 'react';
import { updateTenantBranding } from '@/app/actions/tenant';
import { COUNTRY_CONFIGS, TIMEZONE_OPTIONS } from '@/lib/countries';
import WhatsAppTestModal from './WhatsAppTestModal';
import WhatsAppOnboardingWizard from './WhatsAppOnboardingWizard';

interface BrandingFormProps {
    tenant: any;
    twilio: any;
}

export default function BrandingForm({ tenant, twilio }: BrandingFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [previewColor, setPreviewColor] = useState(tenant?.primary_color || '#E6007E');
    const [previewLogo, setPreviewLogo] = useState(tenant?.logo_url || '');

    // Regional config state
    const [selectedCountry, setSelectedCountry] = useState(tenant?.country || 'Guatemala');
    const [currencySymbol, setCurrencySymbol] = useState(tenant?.currency_symbol || 'Q');
    const [currencyCode, setCurrencyCode] = useState(tenant?.currency_code || 'GTQ');
    const [timezone, setTimezone] = useState(tenant?.timezone || 'America/Guatemala');
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const country = e.target.value;
        const config = COUNTRY_CONFIGS[country];

        if (config) {
            setSelectedCountry(country);
            setCurrencySymbol(config.currencySymbol);
            setCurrencyCode(config.currencyCode);
            setTimezone(config.timezone);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        if (!tenant?.id) {
            setMessage({ type: 'error', text: 'No se encontró un ID de gimnasio válido.' });
            setLoading(false);
            return;
        }
        const result = await updateTenantBranding(tenant.id, formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Error al guardar.' });
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="current_logo_url" value={tenant?.logo_url || ''} />

            <div className="glass-card">
                <h2 className="text-xl font-semibold mb-6">Identidad de Marca</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Logo del Gimnasio (PNG/SVG)</label>
                            <label className="relative group cursor-pointer block">
                                <div className="input-field w-full flex items-center justify-center gap-2 border-dashed py-8 transition-all group-hover:border-brand-500/50 bg-white/5">
                                    <span className="text-2xl opacity-50 group-hover:scale-110 transition-transform">📁</span>
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest group-hover:text-brand-400">Seleccionar Archivo</span>
                                </div>
                                <input
                                    type="file"
                                    name="logo_file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Color Primario (Hex)</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    name="primary_color"
                                    className="w-12 h-12 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                                    defaultValue={tenant?.primary_color || '#E6007E'}
                                    onChange={(e) => setPreviewColor(e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="input-field flex-1 font-mono uppercase"
                                    value={previewColor}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/5">
                        <div className="text-[10px] font-black text-white/20 uppercase mb-4 tracking-widest">Vista Previa PWA</div>
                        <div className="w-full max-w-[180px] aspect-[9/16] bg-[#050505] rounded-[32px] border-4 border-white/10 overflow-hidden relative shadow-2xl">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-center mb-4">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo Preview" className="h-6 object-contain" />
                                    ) : (
                                        <div className="h-6 text-white font-bold italic text-xs">LOGOTIPO</div>
                                    )}
                                </div>
                                <div className="h-16 w-full rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 rounded-full mb-1" style={{ backgroundColor: previewColor }}></div>
                                    <div className="w-12 h-1 bg-white/10 rounded-full"></div>
                                </div>
                                <button type="button" className="w-full py-2 rounded-lg text-black text-[10px] font-black uppercase" style={{ backgroundColor: previewColor }}>
                                    Entrar al Gym
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="space-y-6">
                <div className="glass-card">
                    <h2 className="text-xl font-semibold mb-6">Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-white/50 mb-2">Nombre del Gimnasio</label>
                            <input type="text" name="name" className="input-field w-full" defaultValue={tenant?.name} required />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2">País</label>
                            <select
                                name="country"
                                className="input-field w-full"
                                value={selectedCountry}
                                onChange={handleCountryChange}
                            >
                                {Object.values(COUNTRY_CONFIGS).map(config => (
                                    <option key={config.name} value={config.name}>
                                        {config.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2">Símbolo de Moneda</label>
                            <input
                                type="text"
                                name="currency_symbol"
                                className="input-field w-full bg-white/5"
                                value={currencySymbol}
                                onChange={(e) => setCurrencySymbol(e.target.value)}
                                maxLength={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-white/50 mb-2">Código ISO</label>
                            <input
                                type="text"
                                name="currency_code"
                                className="input-field w-full bg-white/5"
                                value={currencyCode}
                                onChange={(e) => setCurrencyCode(e.target.value)}
                                maxLength={3}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-white/50 mb-2">Zona Horaria</label>
                            <select
                                name="timezone"
                                className="input-field w-full"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                {TIMEZONE_OPTIONS.map(tz => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {message && (
                        <div className={`mt-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary mt-8 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Todos los Cambios'}
                    </button>
                </div>

                {/* WhatsApp Section */}
                {showOnboardingWizard ? (
                    <WhatsAppOnboardingWizard
                        tenant={{ id: tenant.id, name: tenant.name }}
                        existingConfig={twilio}
                        onComplete={() => setShowOnboardingWizard(false)}
                    />
                ) : (
                    <div className="glass-card border-brand-500/20">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Mensajería (WhatsApp)</h2>
                                <p className="text-sm text-white/40">Conexión vía Twilio</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {twilio?.status === 'ACTIVE' && (
                                    <button
                                        type="button"
                                        onClick={() => setIsTestModalOpen(true)}
                                        className="px-4 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all active:scale-95"
                                    >
                                        Enviar Prueba
                                    </button>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${twilio?.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                    {twilio?.status === 'ACTIVE' ? 'CONECTADO' : 'SIN CONFIGURAR'}
                                </span>
                            </div>
                        </div>

                        {twilio?.whatsapp_number ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="text-sm font-medium mb-1">Número de WhatsApp</div>
                                    <div className="text-lg font-mono text-brand-400" style={{ color: previewColor }}>
                                        {twilio.whatsapp_number.replace('whatsapp:', '')}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowOnboardingWizard(true)}
                                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-bold uppercase tracking-wider transition-all"
                                    >
                                        ⚙️ Reconfigurar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">💬</div>
                                <h3 className="text-lg font-bold text-white mb-2">WhatsApp no configurado</h3>
                                <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                                    Conecta tu número de WhatsApp para enviar recordatorios, notificaciones y más a tus miembros.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardingWizard(true)}
                                    className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-black font-black text-sm uppercase tracking-wider transition-all"
                                >
                                    🚀 Configurar WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {isTestModalOpen && twilio && (
                    <WhatsAppTestModal
                        isOpen={isTestModalOpen}
                        onClose={() => setIsTestModalOpen(false)}
                        tenant={{ id: tenant.id, name: tenant.name }}
                    />
                )}
            </section>
        </form>
    );
}
