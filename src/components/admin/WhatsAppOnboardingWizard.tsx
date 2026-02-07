'use client';

import { useState } from 'react';
import { upsertTwilioAccount } from '@/app/actions/superadmin';

interface WhatsAppOnboardingWizardProps {
    tenant: { id: string; name: string };
    existingConfig?: {
        account_sid?: string;
        auth_token?: string;
        whatsapp_number?: string;
        status?: string;
    } | null;
    onComplete?: () => void;
}

const STEPS = [
    { id: 1, title: 'Requisitos', icon: '📋' },
    { id: 2, title: 'Twilio', icon: '🔑' },
    { id: 3, title: 'WhatsApp', icon: '💬' },
    { id: 4, title: 'Verificar', icon: '✅' },
];

export default function WhatsAppOnboardingWizard({
    tenant,
    existingConfig,
    onComplete
}: WhatsAppOnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        account_sid: existingConfig?.account_sid || '',
        auth_token: existingConfig?.auth_token || '',
        whatsapp_number: existingConfig?.whatsapp_number?.replace('whatsapp:', '').replace('+', '') || '',
    });

    const twilioConsoleUrl = 'https://console.twilio.com';
    const twilioWhatsAppUrl = 'https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders';

    async function handleSave() {
        setLoading(true);
        setError(null);

        try {
            // Clean up the phone number
            let phone = formData.whatsapp_number.replace(/\D/g, '');
            if (!phone.startsWith('+')) {
                phone = `+${phone}`;
            }

            const result = await upsertTwilioAccount({
                tenant_id: tenant.id,
                account_sid: formData.account_sid.trim(),
                auth_token: formData.auth_token.trim(),
                whatsapp_number: phone,
            });

            if (result.success) {
                setSuccess(true);
                setCurrentStep(4);
                onComplete?.();
            } else {
                setError(result.error || 'Error al guardar la configuración');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-zinc-900/50 rounded-[32px] border border-white/5 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-br from-green-500/10 to-transparent">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    Configurar WhatsApp
                </h2>
                <p className="text-white/40 text-sm mt-1">
                    {tenant.name} - Sigue estos pasos para activar mensajería
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex border-b border-white/5">
                {STEPS.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                        className={`flex-1 py-4 px-4 text-center transition-all ${step.id === currentStep
                                ? 'bg-brand-500/10 border-b-2 border-brand-500'
                                : step.id < currentStep
                                    ? 'bg-green-500/5 text-green-400 cursor-pointer hover:bg-green-500/10'
                                    : 'text-white/20'
                            }`}
                    >
                        <span className="text-lg mr-2">{step.icon}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${step.id === currentStep ? 'text-brand-400' : ''
                            }`}>
                            {step.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Step Content */}
            <div className="p-8">
                {/* Step 1: Requirements */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-white">Antes de comenzar, asegúrate de tener:</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-white">Cuenta de Twilio</h4>
                                    <p className="text-white/50 text-sm mt-1">
                                        Si no tienes una, créala gratis en{' '}
                                        <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener" className="text-brand-400 hover:underline">
                                            twilio.com/try-twilio
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-white">Cuenta de Facebook Business</h4>
                                    <p className="text-white/50 text-sm mt-1">
                                        Meta requiere verificar tu negocio. Créala en{' '}
                                        <a href="https://business.facebook.com" target="_blank" rel="noopener" className="text-brand-400 hover:underline">
                                            business.facebook.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-white">Un número de teléfono</h4>
                                    <p className="text-white/50 text-sm mt-1">
                                        Puede ser el número del gimnasio (móvil o fijo). Debes poder recibir SMS o llamadas para verificarlo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <p className="text-amber-400 text-sm font-medium">
                                ⚠️ El proceso de aprobación de Meta puede tardar desde minutos hasta 24 horas.
                            </p>
                        </div>

                        <button
                            onClick={() => setCurrentStep(2)}
                            className="w-full py-4 rounded-2xl bg-brand-500 text-black font-black text-sm uppercase tracking-wider hover:bg-brand-600 transition-all"
                        >
                            Tengo todo listo →
                        </button>
                    </div>
                )}

                {/* Step 2: Twilio Credentials */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-white">Credenciales de Twilio</h3>
                        <p className="text-white/50 text-sm">
                            Encuentra estos datos en tu{' '}
                            <a href={twilioConsoleUrl} target="_blank" rel="noopener" className="text-brand-400 hover:underline">
                                Consola de Twilio →
                            </a>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                    Account SID
                                </label>
                                <input
                                    type="text"
                                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                    value={formData.account_sid}
                                    onChange={(e) => setFormData({ ...formData, account_sid: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-brand-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                    Auth Token
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••••••••••••••••••••"
                                    value={formData.auth_token}
                                    onChange={(e) => setFormData({ ...formData, auth_token: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-brand-500/50"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <p className="text-blue-400 text-sm font-medium">
                                💡 Estas credenciales se encuentran en la página principal de tu consola de Twilio.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 text-white/50 font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                            >
                                ← Atrás
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                disabled={!formData.account_sid || !formData.auth_token}
                                className="flex-[2] py-4 rounded-2xl bg-brand-500 text-black font-black text-sm uppercase tracking-wider hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: WhatsApp Number */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-white">Registrar Número de WhatsApp</h3>

                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl space-y-3">
                            <h4 className="font-bold text-green-400">📱 Paso importante:</h4>
                            <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                                <li>
                                    Abre la{' '}
                                    <a href={twilioWhatsAppUrl} target="_blank" rel="noopener" className="text-brand-400 hover:underline font-medium">
                                        sección de WhatsApp Senders en Twilio →
                                    </a>
                                </li>
                                <li>Haz clic en <strong className="text-white">"Register"</strong> o <strong className="text-white">"Add Sender"</strong></li>
                                <li>Vincula tu cuenta de Facebook Business</li>
                                <li>Ingresa el número de teléfono del gimnasio</li>
                                <li>Verifica el número (recibirás un código SMS o llamada)</li>
                                <li>Espera la aprobación de Meta (puede tardar hasta 24h)</li>
                            </ol>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                                Número de WhatsApp (ya registrado en Twilio)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">+</span>
                                <input
                                    type="text"
                                    placeholder="12025551234"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-brand-500/50 tabular-nums"
                                />
                            </div>
                            <p className="text-white/30 text-xs mt-2">Incluye código de país (ej: 1 para USA, 502 para Guatemala)</p>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 text-white/50 font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                            >
                                ← Atrás
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || !formData.whatsapp_number}
                                className="flex-[2] py-4 rounded-2xl bg-brand-500 text-black font-black text-sm uppercase tracking-wider hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Configuración'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {currentStep === 4 && (
                    <div className="text-center space-y-6 animate-in fade-in duration-300 py-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-white">¡Configuración Guardada!</h3>
                            <p className="text-white/50 mt-2">
                                Tu número de WhatsApp ha sido configurado para <strong className="text-white">{tenant.name}</strong>
                            </p>
                        </div>

                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left">
                            <h4 className="font-bold text-amber-400 mb-2">⏳ ¿Pendiente de aprobación?</h4>
                            <p className="text-white/60 text-sm">
                                Si Meta aún está revisando tu número, los mensajes no se enviarán hasta que sea aprobado.
                                Puedes verificar el estado en tu{' '}
                                <a href={twilioWhatsAppUrl} target="_blank" rel="noopener" className="text-brand-400 hover:underline">
                                    consola de Twilio
                                </a>.
                            </p>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
