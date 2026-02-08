'use client';

import React from 'react';

interface ProfileSectionProps {
    member: any;
    primaryColor: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ member, primaryColor, onFileChange, uploading }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Mi Perfil</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest">Configuración personal</p>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group">
                    {member?.image_url ? (
                        <img
                            src={member.image_url}
                            alt={member?.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-3xl">
                            👤
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Cambiar</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={onFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>
                {uploading && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Subiendo foto...
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
                <div className="glass-card">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Nombre Completo</div>
                    <div className="text-lg font-black text-white">{member.name}</div>
                </div>
                <div className="glass-card">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Email</div>
                    <div className="text-sm font-bold text-white/60">{member.email || 'No registrado'}</div>
                </div>
                <div className="glass-card">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Teléfono</div>
                    <div className="text-sm font-bold text-white/60">{member.phone || 'No registrado'}</div>
                </div>
                <div className="glass-card">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Miembro Desde</div>
                    <div className="text-sm font-bold text-white/60">{new Date(member.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="glass-card">
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Estado</div>
                    <span className={`inline-block px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${member.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            <div className="text-center pt-4">
                <p className="text-xs text-white/20 uppercase tracking-widest">Para actualizar tus datos, contacta a recepción</p>
            </div>
        </div>
    );
};
