'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { updateMember } from '@/app/actions/updateMember';
import { useRouter } from 'next/navigation';

interface EditMemberModalProps {
    member: {
        id: string;
        name: string;
        phone: string;
    };
    onClose: () => void;
}

export default function EditMemberModal({ member, onClose }: EditMemberModalProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateMember(member.id, formData);

        if (result.success) {
            router.refresh();
            onClose();
        } else {
            alert(result.error);
        }
        setLoading(false);
    }

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-card max-w-md w-full relative overflow-hidden animate-zoom-in">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Editar Miembro</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field w-full"
                            required
                            defaultValue={member.name}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-white/50 mb-2">Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            className="input-field w-full"
                            required
                            defaultValue={member.phone}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest text-white/60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 disabled:opacity-50 font-bold uppercase tracking-widest">
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
