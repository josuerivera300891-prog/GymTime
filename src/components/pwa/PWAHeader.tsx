'use client';

import React from 'react';

interface PWAHeaderProps {
    tenant: any;
}

export const PWAHeader: React.FC<PWAHeaderProps> = ({ tenant }) => {
    return (
        <div className="flex flex-col items-center mb-8 animate-in fade-in zoom-in duration-700">
            {tenant.logo_url ? (
                <img
                    src={tenant.logo_url}
                    alt={tenant.name}
                    className="h-16 object-contain mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                />
            ) : (
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-4 text-4xl border border-white/10">
                    🏋️‍♂️
                </div>
            )}
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                {tenant.name}
            </h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">
                {tenant.country}
            </p>
        </div>
    );
};

interface PWAMemberSummaryProps {
    member: any;
    primaryColor: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
}

export const PWAMemberSummary: React.FC<PWAMemberSummaryProps> = ({ member, primaryColor, onFileChange, uploading }) => {
    return (
        <div className="glass-card mb-8">
            <div className="flex items-center gap-5">
                <div className="relative">
                    {member.image_url ? (
                        <img
                            src={member.image_url}
                            alt={member.name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border-2 border-white/10 text-3xl">
                            👤
                        </div>
                    )}
                    <label className="absolute -bottom-2 -right-2 p-2 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform"
                        style={{ background: primaryColor }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
                    </label>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Miembro</div>
                    <h1 className="text-xl font-black text-white tracking-tight leading-tight truncate">{member.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                        </span>
                        <span className="text-[10px] text-white/30 font-bold">
                            {member.memberships?.[0]?.next_due_date
                                ? `Vence ${new Date(member.memberships[0].next_due_date).toLocaleDateString()}`
                                : 'Sin membresía activa'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
