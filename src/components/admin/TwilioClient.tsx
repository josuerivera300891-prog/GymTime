'use client';

import { useState } from 'react';
import { testTwilioConnection } from '@/app/actions/superadmin';
import TwilioModal from './TwilioModal';
import WhatsAppTestModal from './WhatsAppTestModal';

interface TwilioAccount {
    tenant_id: string;
    account_sid: string;
    auth_token: string;
    whatsapp_number: string;
    status: string;
    tenants: { name: string; id: string } | null;
}

interface TwilioClientProps {
    accounts: TwilioAccount[];
    allTenants: { id: string; name: string }[];
}

export default function TwilioClient({ accounts, allTenants }: TwilioClientProps) {
    const [testing, setTesting] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<any>(null);

    // Test WhatsApp state
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [activeTenant, setActiveTenant] = useState<{ id: string; name: string } | null>(null);

    async function handleTestConnection(tenantId: string) {
        setTesting(tenantId);
        try {
            const result = await testTwilioConnection(tenantId);
            setResults(prev => ({
                ...prev,
                [tenantId]: {
                    success: result.success,
                    message: result.success ? result.message! : result.error!
                }
            }));
        } catch (error: any) {
            setResults(prev => ({
                ...prev,
                [tenantId]: {
                    success: false,
                    message: error.message
                }
            }));
        } finally {
            setTesting(null);
        }
    }

    const openEdit = (acc: TwilioAccount) => {
        setEditingAccount(acc);
        setIsModalOpen(true);
    };

    const openCreate = () => {
        setEditingAccount(null);
        setIsModalOpen(true);
    };

    const openWhatsAppTest = (acc: TwilioAccount) => {
        setActiveTenant({ id: acc.tenant_id, name: acc.tenants?.name || 'Sede' });
        setIsTestModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex justify-end px-4">
                <button
                    onClick={openCreate}
                    className="btn-primary px-8 py-3 !rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                    <span className="text-xl leading-none">+</span> Nueva Configuración
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {accounts?.map((acc) => (
                    <div key={acc.tenant_id} className="glass-card border-white/5 hover:border-brand-500/30 transition-all !p-0 overflow-hidden group">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                    💬
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none">{acc.tenants?.name}</h3>
                                    <div className="text-[10px] text-white/20 font-mono mt-1 tracking-widest uppercase truncate max-w-[200px]">ID: {acc.tenant_id}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => openWhatsAppTest(acc)}
                                    className="px-4 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all active:scale-95"
                                >
                                    Enviar Prueba Real
                                </button>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${acc.status === 'ACTIVE'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    }`}>
                                    {acc.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 group-hover/field:text-brand-400 transitions-colors">Twilio Account SID</label>
                                    <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-white/5 text-white/60 select-all group-hover/field:border-white/10 transition-colors uppercase">{acc.account_sid}</div>
                                </div>
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 group-hover/field:text-brand-400 transition-colors">Auth Token</label>
                                    <div className="bg-black/40 p-4 rounded-xl font-mono text-xs border border-white/5 text-white/20 italic tracking-widest group-hover/field:border-white/10 transition-colors">••••••••••••••••••••••••••••••••</div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div className="group/field">
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 group-hover/field:text-brand-500 transition-colors">WhatsApp Number</label>
                                    <div className="bg-brand-500/5 p-5 rounded-2xl border border-brand-500/10 text-2xl font-black text-white tracking-widest text-center group-hover/field:bg-brand-500/10 transition-all tabular-nums">
                                        <span className="text-brand-400/50 mr-2 text-lg">+</span>{acc.whatsapp_number.replace('whatsapp:', '')}
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-3">
                                    <button
                                        onClick={() => handleTestConnection(acc.tenant_id)}
                                        disabled={testing === acc.tenant_id}
                                        className="flex-1 px-6 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/20 text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-brand-500/10"
                                    >
                                        {testing === acc.tenant_id ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                PROBANDO...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                TEST API
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => openEdit(acc)}
                                        className="px-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group active:scale-95 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white"
                                    >
                                        Editar
                                    </button>
                                </div>

                                {/* Test Result */}
                                {results[acc.tenant_id] && (
                                    <div className={`mt-4 p-4 rounded-xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${results[acc.tenant_id].success
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        }`}>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm ${results[acc.tenant_id].success ? 'bg-green-500/20' : 'bg-red-500/20'
                                            }`}>
                                            {results[acc.tenant_id].success ? '✓' : '✕'}
                                        </div>
                                        <span className="uppercase tracking-widest leading-tight">{results[acc.tenant_id].message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {!accounts?.length && (
                    <div className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center py-24 bg-white/[0.01]">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6 opacity-30 grayscale items-center justify-center">
                            💬
                        </div>
                        <p className="text-white/30 mb-8 italic text-sm font-medium tracking-wide">No se han detectado subcuentas de Twilio configuradas.</p>
                        <button
                            onClick={openCreate}
                            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-black text-xs tracking-widest uppercase"
                        >
                            Configurar Primera Conexión
                        </button>
                    </div>
                )}
            </div>

            <TwilioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                allTenants={allTenants}
                accountToEdit={editingAccount}
            />

            {activeTenant && (
                <WhatsAppTestModal
                    isOpen={isTestModalOpen}
                    onClose={() => setIsTestModalOpen(false)}
                    tenant={activeTenant}
                />
            )}
        </div>
    );
}
