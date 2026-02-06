'use client';

import { useState } from 'react';
import { testTwilioConnection } from '@/app/actions/superadmin';

interface TwilioAccount {
    tenant_id: string;
    account_sid: string;
    whatsapp_number: string;
    status: string;
    tenants: { name: string } | null;
}

interface TwilioClientProps {
    accounts: TwilioAccount[];
}

export default function TwilioClient({ accounts }: TwilioClientProps) {
    const [testing, setTesting] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

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

    return (
        <div className="grid grid-cols-1 gap-6">
            {accounts?.map((acc) => (
                <div key={acc.tenant_id} className="glass-card border-brand-500/10 hover:border-brand-500/30 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-brand-400">{acc.tenants?.name}</h3>
                            <p className="text-xs text-white/30 font-mono italic">TENANT_ID: {acc.tenant_id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${acc.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {acc.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Account SID</label>
                                <div className="bg-white/5 p-3 rounded-xl font-mono text-sm border border-white/5">{acc.account_sid}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Auth Token</label>
                                <div className="bg-white/5 p-3 rounded-xl font-mono text-sm border border-white/5">••••••••••••••••••••</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">WhatsApp Number</label>
                                <div className="bg-brand-500/5 p-3 rounded-xl font-mono text-brand-400 font-bold border border-brand-500/10">
                                    {acc.whatsapp_number}
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => handleTestConnection(acc.tenant_id)}
                                    disabled={testing === acc.tenant_id}
                                    className="flex-1 btn-primary !py-2.5 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    {testing === acc.tenant_id ? (
                                        <>
                                            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                            Probando...
                                        </>
                                    ) : 'Test Conexión'}
                                </button>
                                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                    ⚙️
                                </button>
                            </div>

                            {/* Test Result */}
                            {results[acc.tenant_id] && (
                                <div className={`p-3 rounded-xl text-sm ${results[acc.tenant_id].success
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    }`}>
                                    {results[acc.tenant_id].success ? '✅' : '❌'} {results[acc.tenant_id].message}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {!accounts?.length && (
                <div className="glass-card border-dashed border-white/10 flex flex-col items-center py-20">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-white/40 mb-6 italic text-center">No hay cuentas de WhatsApp configuradas.</p>
                    <button className="btn-primary">Configurar Primera Cuenta</button>
                </div>
            )}
        </div>
    );
}
