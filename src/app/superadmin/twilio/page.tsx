import { supabaseAdmin } from '@/lib/supabaseServer';

export default async function TwilioPage() {
    const { data: accounts } = await supabaseAdmin
        .from('twilio_accounts')
        .select('*, tenants(name)');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Configuración de Twilio (SaaS)</h1>
                <p className="text-white/50">Gestiona las subcuentas y números de WhatsApp de cada gimnasio.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {accounts?.map((acc: any) => (
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
                                    <button className="flex-1 btn-primary !py-2.5 text-xs uppercase tracking-widest opacity-50 cursor-not-allowed">Test Conexión</button>
                                    <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                        ⚙️
                                    </button>
                                </div>
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
        </div>
    );
}
